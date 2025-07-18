"use client"

// apps/web/app/components/ui/IDE.tsx
import { editorOptions } from "../../lib/editorOptions"
import { EditorControls } from "./EditorControls"
import { Editor } from "@monaco-editor/react"
import { useState } from "react"

interface IDEProps {
    codeInit: string
    isRunning?: boolean
    completed?: boolean
}

const onRun = () => {
    // Logic to handle running the code
    console.log("Run button clicked")
}

export default function IDE({
    codeInit,
    isRunning = false,
    completed = false,
}: IDEProps) {
    const [code, setCode] = useState(codeInit)

    return (
        <div className="flex h-full w-full flex-col bg-white shadow-xl border-x border-gray-200">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 border-b">
                <h3 className="font-semibold text-sm flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    Code Editor
                    {isRunning && (
                        <span className="ml-auto flex items-center text-orange-300">
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Executing...
                        </span>
                    )}
                </h3>
            </div>
            <div className="relative h-full w-full grow border-b border-gray-200">
                <Editor
                    value={code}
                    onChange={(v) => setCode(v || "")}
                    language="python"
                    theme="vs"
                    options={{
                        ...editorOptions,
                        readOnly: isRunning, // Disable editing while running
                    }}
                />
                {isRunning && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-10 flex items-center justify-center">
                        <div className="bg-white rounded-lg shadow-lg p-4 flex items-center">
                            <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-orange-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            <span className="text-gray-700 font-medium">
                                Executing code in ROS2 container...
                            </span>
                        </div>
                    </div>
                )}
            </div>
            <EditorControls
                onRun={onRun}
                isRunning={isRunning}
                completed={completed}
            />
        </div>
    )
}
