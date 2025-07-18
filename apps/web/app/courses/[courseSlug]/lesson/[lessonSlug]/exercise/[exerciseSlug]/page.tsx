import IDE from "@/app/components/ui/IDE"
import LessonPane from "@/app/components/ui/LessonPane"
import Terminal from "@/app/components/ui/Terminal"
import URDFViewer from "@/app/components/ui/URDFViewer"
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "@/components/ui/resizable"
import { db } from "@/app/lib/db"
import { redirect } from "next/navigation"
import { exercises, steps, userExerciseProgress } from "@/app/lib/db/schema"
import { eq } from "drizzle-orm"
import { currentUser } from "@clerk/nextjs/server"

export default async function ExercisePage({
    params,
}: {
    params: { courseSlug: string; lessonSlug: string; exerciseSlug: string }
}) {
    const { courseSlug, lessonSlug, exerciseSlug } = await params
    const user = await currentUser()
    if (!user) redirect("/sign-in")

    // Fetch exercise data based on courseSlug, lessonSlug, and exerciseSlug
    const exerciseData = await db
        .select()
        .from(exercises)
        .where(eq(exercises.slug, exerciseSlug))
        .then((results) => results[0]) // Get the first matching exercise

    const stepData = await db
        .select()
        .from(steps)
        .where(eq(steps.exerciseId, exerciseData?.id))

    // Fetch user progress data if user is logged in
    const userExerciseProgressData = user
        ? await db
              .select()
              .from(userExerciseProgress)
              .where(eq(userExerciseProgress.userId, user.id))
              .then(results => {
                  const progress = results[0] || { completedSteps: [] };
                  return {
                      ...progress,
                      completedSteps: progress.completedSteps || []
                  };
              })
        : { completedSteps: [] }

    return (
        <main className="flex h-screen w-full">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={33} className="flex h-full">
                    <LessonPane exerciseData={exerciseData} stepData={stepData} userExerciseProgress={userExerciseProgressData} />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={33} className="">
                    <IDE
                        codeInit={exerciseData?.initialCode || ""}
                        // Add environment configs from exerciseData
                        // setCode={setCode}
                        // onRun={handleRun}
                        // isRunning={isRunning}
                    />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={33} className="flex flex-col">
                    <div className="flex flex-col">
                        <Terminal
                                    // logs={logs}
                                    // onCommand={handleTerminalCommand}
                                    // isRunning={isRunning}
                                />
                        <URDFViewer
                        // jointPositions={jointPositions}
                        // onJointPositionsChanged={
                        //     sendJointPositionConfirmation
                        // }
                        />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </main>
    )
}
