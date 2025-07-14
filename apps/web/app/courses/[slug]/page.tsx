import { db } from "@/app/lib/db"
import {
    courses,
    modules,
    moduleContent,
    ModuleContentSelect,
} from "@/app/lib/db/schema"
import { eq } from "drizzle-orm"
import Link from "next/link"
import { BookOpen, Clock, Users } from "lucide-react"
import React from "react"
import ModuleComponent from "./ModuleComponent"

export default async function CoursePage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    let course: typeof courses.$inferSelect | null = null
    let courseModules: (typeof modules.$inferSelect)[] = []
    const moduleContents: Record<string, Array<ModuleContentSelect>> = {}

    try {
        ;[course] = await db
            .select()
            .from(courses)
            .where(eq(courses.slug, slug))
            .limit(1)

        if (!course) {
            throw new Error("Course not found")
        }

        courseModules = await db
            .select()
            .from(modules)
            .where(eq(modules.courseId, course.id))
            .orderBy(modules.orderIndex)

        for (const mod of courseModules) {
            const contentsForModule = await db
                .select()
                .from(moduleContent)
                .where(eq(moduleContent.moduleId, mod.id))

            moduleContents[mod.id] = contentsForModule
        }
    } catch (error) {
        console.error("Error fetching course data:", error)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Course Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
                    <div className="flex items-start gap-6">
                        <div className="bg-orange-100 p-3 rounded-lg">
                            <BookOpen className="h-8 w-8 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {course?.title}
                            </h1>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                {course?.description}
                            </p>

                            {/* Course Stats */}
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    <span>{courseModules.length} modules</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        ~{courseModules.length * 30} minutes
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>Beginner friendly</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lessons Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Course Modules
                    </h2>
                    {courseModules.length > 0 ? (
                        <div className="space-y-4">
                            {courseModules.map((mod, index) => (
                                <ModuleComponent
                                    key={mod.id}
                                    module={mod}
                                    courseSlug={slug}
                                    contents={moduleContents[mod.id] || []}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">
                                No lessons available yet.
                            </p>
                            <p className="text-gray-400">
                                Check back soon for updates!
                            </p>
                        </div>
                    )}
                </div>

                {/* Back to Courses */}
                <div className="mt-8 text-center">
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors font-medium"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Courses
                    </Link>
                </div>
            </div>
        </div>
    )
}
