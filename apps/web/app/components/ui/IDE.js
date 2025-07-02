import { useState, useRef, useEffect } from "react"
import { normalizeOutput } from "../../utils/normalizeOutput"
import { useWebSocket } from "../../lib/useWebSocket"
import { customEditorTheme } from "../../lib/editorTheme"
import { editorOptions } from "../../lib/editorOptions"
import { EditorControls } from "./EditorControls"
import { Editor } from "@monaco-editor/react"

export default function IDE({ mission, lesson, exercise }) {
    const [editorTheme, setEditorTheme] = useState("vs")
    const [isRunning, setIsRunning] = useState(false)
    const [completed, setCompleted] = useState(false)
    const editorRef = useRef(null)

    const { isConnected, output, sendCode } = useWebSocket()

    const handleEditorWillMount = (monaco) => {
        monaco.editor.defineTheme("myCustomTheme", customEditorTheme)
        setEditorTheme("myCustomTheme")
    }

    useEffect(() => {
        if (output && isRunning) {
            const normalizedServerOutput = normalizeOutput(output)
            const normalizedExpectedOutput = normalizeOutput(
                exercise.expectedOutput
            )

            if (normalizedServerOutput === normalizedExpectedOutput) {
                console.log("Mission Complete!")
                setCompleted(true)
            } else {
                console.log("Outputs do not match. Check your code.")
            }
            setIsRunning(false)
        }
    }, [output, isRunning, exercise.expectedOutput])

    const runCode = () => {
        setIsRunning(true)
        setCompleted(false)
        const code = editorRef.current.getValue()
        sendCode(code)
    }

    return (
        <div className="flex flex-col w-full">
            <div className="p-2 border-b text-sm text-gray-500">
                {isConnected
                    ? "Connected to server"
                    : "Disconnected from server"}
            </div>
            <div className="bg-gray-100">
                <p className="w-fit bg-white p-2 text-gray-600 border-r">
                    blink.py
                </p>
            </div>
            <Editor
                defaultLanguage="python"
                value={exercise.codeTemplate}
                onMount={(editor) => {
                    editorRef.current = editor
                }}
                beforeMount={handleEditorWillMount}
                theme={editorTheme}
                options={editorOptions}
            />
            <EditorControls
                runCode={runCode}
                completed={completed}
                setCompleted={setCompleted}
                isRunning={isRunning}
                setIsRunning={setIsRunning}
                mission={mission}
                lesson={lesson}
                exercise={exercise}
            />
        </div>
    )
}
