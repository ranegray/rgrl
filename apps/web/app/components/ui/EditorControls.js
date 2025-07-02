export function EditorControls({ runCode, isRunning, completed }) {
    return (
        <div className="flex items-center justify-between bg-gray-100 p-2 border-y">
            <div className="flex items-center space-x-4">
                <button
                    onClick={runCode}
                    disabled={isRunning}
                    className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors duration-200 disabled:bg-gray-400"
                >
                    {isRunning ? "Running..." : "Run Code"}
                </button>
            </div>
            <div className="flex items-center space-x-2">
                {completed && (
                    <span className="text-green-500 font-bold">
                        Exercise Complete!
                    </span>
                )}
            </div>
        </div>
    )
}
