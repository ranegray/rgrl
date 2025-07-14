import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "../../../../lib/db/index"
import { eq, and, asc } from "drizzle-orm"
import {
    courses,
    modules,
    moduleContent,
    lessons,
    exercises,
    userProgress,
    userExerciseProgress,
} from "../../../../lib/db/schema"

async function updateLessonProgress(userId: string, moduleContentId: string) {
    const existing = await db
        .select()
        .from(userProgress)
        .where(
            and(
                eq(userProgress.userId, userId),
                eq(userProgress.moduleContentId, moduleContentId)
            )
        )
        .limit(1)

    if (existing.length > 0) {
        // Update existing record
        await db
            .update(userProgress)
            .set({ lastActiveAt: new Date() })
            .where(
                and(
                    eq(userProgress.userId, userId),
                    eq(userProgress.moduleContentId, moduleContentId)
                )
            )
    } else {
        // Insert new record
        await db.insert(userProgress).values({
            userId,
            moduleContentId,
            status: "in_progress",
            lastActiveAt: new Date(),
        })
    }
}

async function getNextExerciseSlug(
    userId: string,
    courseSlug: string,
    lessonSlug: string
): Promise<string | null> {
    const result = await db
        .select({
            lessonId: lessons.id,
            moduleContentId: moduleContent.id, // Add this for userProgress
            exerciseId: exercises.id,
            exerciseSlug: exercises.slug,
            exerciseOrder: exercises.orderIndex,
            status: userExerciseProgress.status,
        })
        .from(courses)
        .innerJoin(modules, eq(modules.courseId, courses.id))
        .innerJoin(moduleContent, eq(moduleContent.moduleId, modules.id))
        .innerJoin(lessons, eq(lessons.moduleContentId, moduleContent.id))
        .innerJoin(exercises, eq(exercises.lessonId, lessons.id))
        .leftJoin(
            userExerciseProgress,
            and(
                eq(userExerciseProgress.exerciseId, exercises.id),
                eq(userExerciseProgress.userId, userId)
            )
        )
        .where(
            and(
                eq(courses.slug, courseSlug),
                eq(moduleContent.slug, lessonSlug),
                eq(moduleContent.contentType, "lesson")
            )
        )
        .orderBy(asc(exercises.orderIndex))

    if (!result.length) return null

    await updateLessonProgress(userId, result[0].moduleContentId)

    // Find first exercise that's not completed
    const nextExercise = result.find((r) => r.status !== "completed")
    const targetExercise = nextExercise || result[result.length - 1]

    // If they haven't started this exercise yet, mark it as in_progress
    if (!targetExercise.status) {
        await db
            .insert(userExerciseProgress)
            .values({
                userId,
                lessonId: targetExercise.lessonId,
                exerciseId: targetExercise.exerciseId,
                status: "in_progress",
                startedAt: new Date(),
                lastActiveAt: new Date(),
            })
            .onConflictDoNothing()
    }

    return targetExercise.exerciseSlug
}

export default async function LessonPage({
    params,
}: {
    params: { courseSlug: string; lessonSlug: string }
}) {
    const { courseSlug, lessonSlug } = await params
    const user = await currentUser()
    if (!user) redirect("/sign-in")

    const exerciseSlug = await getNextExerciseSlug(
        user.id,
        courseSlug,
        lessonSlug
    )

    if (!exerciseSlug) redirect("/courses")

    redirect(
        `/courses/${courseSlug}/lesson/${lessonSlug}/exercise/${exerciseSlug}`
    )
}
