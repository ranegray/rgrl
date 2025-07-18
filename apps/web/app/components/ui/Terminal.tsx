"use client"

import { useState, useEffect, useRef } from "react"
import { Terminal as TerminalIcon, Minus, Square } from "lucide-react"

interface LogEntry {
    timestamp?: string
    type?: "error" | "warning" | "success" | "info"
    message: string
}

// TODO add types for logs
interface TerminalProps {
    logs?: (string | LogEntry)[]
    onCommand?: (command: string) => void
    isRunning?: boolean
}

export default function Terminal({
    logs,
    onCommand,
    isRunning,
}: TerminalProps) {
    const [input, setInput] = useState("")
    const [history, setHistory] = useState<string[]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const [isMinimized, setIsMinimized] = useState(false)
    const terminalRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight
        }
    }, [logs])

    const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            if (input.trim()) {
                setHistory((prev) => [...prev, input])
                setHistoryIndex(-1)
                onCommand?.(input.trim())
                setInput("")
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            if (history.length > 0) {
                const newIndex =
                    historyIndex === -1
                        ? history.length - 1
                        : Math.max(0, historyIndex - 1)
                setHistoryIndex(newIndex)
                setInput(history[newIndex])
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault()
            if (historyIndex >= 0) {
                const newIndex = historyIndex + 1
                if (newIndex >= history.length) {
                    setHistoryIndex(-1)
                    setInput("")
                } else {
                    setHistoryIndex(newIndex)
                    setInput(history[newIndex])
                }
            }
        }
    }

    const focusInput = () => {
        if (inputRef.current && !isMinimized) {
            inputRef.current.focus()
        }
    }

    const clearTerminal = () => {
        onCommand?.("clear")
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg m-2 overflow-hidden flex flex-col h-[50vh]">
            {/* Terminal Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 border-b flex items-center justify-between flex-shrink-0">
                <div className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    <TerminalIcon className="w-4 h-4 mr-2" />
                    <h3 className="font-semibold text-sm">Terminal</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <button
                        onClick={clearTerminal}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                        <Square className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Terminal Content */}
            <div className="flex-1 flex flex-col bg-gray-900 text-green-400 font-mono text-sm min-h-0">
                {/* Output Area */}
                <div
                    ref={terminalRef}
                    className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 min-h-0"
                    onClick={focusInput}
                >
                    {/* Welcome Message */}
                    <div className="text-gray-400 mb-2">
                        <div>Welcome to Click & Whirr Terminal</div>
                        <div>
                            Type &lsquo;help&rsquo; for available commands
                        </div>
                        <div className="border-b border-gray-700 my-2"></div>
                    </div>

                    {/* Log Messages */}
                    {logs?.map((log, index) => {
                        const logEntry =
                            typeof log === "string" ? { message: log } : log
                        return (
                            <div key={index} className="mb-1">
                                {logEntry.timestamp && (
                                    <span className="text-gray-500">
                                        [{logEntry.timestamp}]{" "}
                                    </span>
                                )}
                                <span
                                    className={`${
                                        logEntry.type === "error"
                                            ? "text-red-400"
                                            : logEntry.type === "warning"
                                            ? "text-yellow-400"
                                            : logEntry.type === "success"
                                            ? "text-green-400"
                                            : logEntry.type === "info"
                                            ? "text-blue-400"
                                            : "text-gray-300"
                                    }`}
                                >
                                    {logEntry.message}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Input Line - Fixed at bottom */}
                <div className="flex items-center p-4 pt-2 border-t border-gray-700 flex-shrink-0 bg-gray-900">
                    <span className="text-green-400 mr-2">$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleCommand}
                        className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono"
                        placeholder={
                            isRunning ? "Running..." : "Enter command..."
                        }
                        disabled={isRunning}
                        autoFocus
                    />
                    {isRunning && (
                        <div className="ml-2 flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
