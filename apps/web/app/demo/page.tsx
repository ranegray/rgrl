"use client"

import LessonPane from "../components/ui/LessonPane"
import IDE from "../components/ui/IDE"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

const mockExercise = {
    id: "ex1",
    title: "Blink an LED",
    description: `Let's start with a classic "Hello, World!" of the hardware world. In this exercise, you'll write a simple script to make the robot's onboard LED blink. This will confirm that your development environment is set up correctly and that you can communicate with the robot.`,
    code: `// Your code here
function blink() {
  // TODO: Implement the blink logic
}

blink();
`,
    stepByStep: [
        "Access the robot's onboard LED.",
        "Turn the LED on.",
        "Wait for a short period.",
        "Turn the LED off.",
        "Wait again.",
        "Repeat this process in a loop.",
    ],
    hints: [
        "Look for a function to control GPIO pins.",
        "The LED is usually connected to a specific pin number.",
        "You'll need a way to create a delay or pause in your script.",
    ],
    concept: "Digital Output, GPIO, Loops",
    exerciseDescription: `Let's start with a classic "Hello, World!" of the hardware world. In this exercise, you'll write a simple script to make the robot's onboard LED blink. This will confirm that your development environment is set up correctly and that you can communicate with the robot.`,
}

const mockLesson = {
    id: "l1",
    title: "Getting Started",
    description: "An introduction to the basic functions of your robot.",
    exercises: [mockExercise],
}

const mockMission = {
    id: "m1",
    title: "First Steps",
    description:
        "Complete this mission to learn the fundamentals of robot programming.",
    lessons: [mockLesson],
}

export default function DemoPage() {
    return (
        <main className="h-screen">
            <PanelGroup direction="horizontal">
                <Panel defaultSize={33} className="flex" minSize={20}>
                    <LessonPane exercise={mockExercise} />
                </Panel>
                <PanelResizeHandle className="w-px bg-gray-200 transition-colors hover:bg-orange-500" />
                <Panel defaultSize={34} className="flex" minSize={30}>
                    <IDE
                        mission={mockMission}
                        lesson={mockLesson}
                        exercise={mockExercise}
                    />
                </Panel>
                <PanelResizeHandle className="w-px bg-gray-200 transition-colors hover:bg-orange-500" />
                <Panel
                    defaultSize={33}
                    className="flex flex-col"
                    minSize={20}
                ></Panel>
            </PanelGroup>
        </main>
    )
}
