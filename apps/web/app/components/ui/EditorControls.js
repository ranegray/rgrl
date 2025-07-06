export function EditorControls({ onRun, isRunning, completed }) {
    return (
        <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => {
                        console.log("Run button clicked")
                        onRun()
                    }}
                    disabled={isRunning}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:transform-none disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                    {isRunning ? (
                        <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Running...
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z"></path>
                            </svg>
                            Run Code
                        </div>
                    )}
                </button>
            </div>
            <div className="flex items-center space-x-2">
                {completed && (
                    <div className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full border border-green-200">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="font-semibold">Exercise Complete!</span>
                    </div>
                )}
            </div>
        </div>
    )
}
