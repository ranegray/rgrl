import { editorOptions } from "../../lib/editorOptions"
import { EditorControls } from "./EditorControls"
import { Editor } from "@monaco-editor/react"

export default function IDE({ code, setCode, onRun }) {
    return (
        <div className="flex h-full w-full flex-col bg-white shadow-xl border-x border-gray-200">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 border-b">
                <h3 className="font-semibold text-sm flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    Code Editor
                </h3>
            </div>
            <div className="relative h-full w-full grow border-b border-gray-200">
                <Editor
                    value={code}
                    onChange={(v) => setCode(v || "")}
                    language="python"
                    theme="vs"
                    options={editorOptions}
                />
            </div>
            <EditorControls onRun={onRun} />
        </div>
    )
}
