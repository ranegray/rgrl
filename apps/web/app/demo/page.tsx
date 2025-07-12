// app/demo/page.tsx
"use client"

import LessonPane from "../components/ui/LessonPane"
import IDE from "../components/ui/IDE"
import Terminal from "../components/ui/Terminal"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { useState, useCallback } from "react"
import URDFViewer from "../components/ui/URDFViewer"
import { useRobotWebSocket } from "../hooks/useRobotWebSocket"

const mockExercise = {
    id: "ex1",
    title: "🤖 Fluid Robot Wave Demo",
    description: `Watch the SO-101 robot arm perform a smooth, fluid waving motion! This demo showcases:
    
    • **Smooth interpolated movement** between joint positions
    • **Real-time WebSocket control** with immediate responsiveness  
    • **Natural robotic motion** with realistic timing
    • **Multi-joint coordination** for complex gestures
    
    Click RUN to see the robot wave hello and goodbye with fluid, life-like movement!`,
    code: `#!/usr/bin/env python3
"""
SO-101 Robot Arm Test - Simple Joint Movement
Test basic joint movement with clear, obvious positions
"""

import time
import json

class SimpleRobotTest:
    def __init__(self):
        print("🤖 Robot test initialized!")

    def send_position(self, description, shoulder_pan=0.0, shoulder_lift=0.0, elbow_flex=0.0, wrist_flex=0.0, wrist_roll=0.0, gripper=0.0):
        """Send a single joint position"""
        joint_positions = {
            'shoulder_pan': shoulder_pan,
            'shoulder_lift': shoulder_lift,
            'elbow_flex': elbow_flex,
            'wrist_flex': wrist_flex,
            'wrist_roll': wrist_roll,
            'gripper': gripper
        }
        
        print(f"🎯 {description}", flush=True)
        
        # Send joint state update immediately
        joint_state_msg = f"JOINT_STATE:{json.dumps(joint_positions)}"
        print(joint_state_msg, flush=True)

    def test_movement(self):
        """Test fluid robot movement"""
        print("🧪 Starting fluid movement test...", flush=True)
        
        # Enhanced wave sequence with expressive descriptions
        positions = [
            ("🏠 Initializing to home position", {"shoulder_pan": 0.0, "shoulder_lift": 0.0, "elbow_flex": 0.0, "wrist_flex": 0.0, "wrist_roll": 0.0, "gripper": 0.0}),
            ("🚀 Raising arm gracefully", {"shoulder_pan": 0.0, "shoulder_lift": -1.2, "elbow_flex": 0.0, "wrist_flex": 0.0, "wrist_roll": 0.0, "gripper": 0.0}),
            ("💪 Preparing to wave - elbow bend", {"shoulder_pan": 0.0, "shoulder_lift": -1.2, "elbow_flex": 1.5, "wrist_flex": 0.0, "wrist_roll": 0.0, "gripper": 0.0}),
            ("👋 Waving right - Hello there!", {"shoulder_pan": 0.8, "shoulder_lift": -1.2, "elbow_flex": 1.5, "wrist_flex": -0.3, "wrist_roll": 0.0, "gripper": 0.0}),
            ("🎯 Returning to center", {"shoulder_pan": 0.0, "shoulder_lift": -1.2, "elbow_flex": 1.5, "wrist_flex": -0.3, "wrist_roll": 0.0, "gripper": 0.0}),
            ("👈 Waving left - Nice to meet you!", {"shoulder_pan": -0.8, "shoulder_lift": -1.2, "elbow_flex": 1.5, "wrist_flex": -0.3, "wrist_roll": 0.0, "gripper": 0.0}),
            ("🎯 Center position again", {"shoulder_pan": 0.0, "shoulder_lift": -1.2, "elbow_flex": 1.5, "wrist_flex": -0.3, "wrist_roll": 0.0, "gripper": 0.0}),
            ("👋 Final wave right - Goodbye!", {"shoulder_pan": 0.8, "shoulder_lift": -1.2, "elbow_flex": 1.5, "wrist_flex": -0.3, "wrist_roll": 0.0, "gripper": 0.0}),
            ("🎯 Returning to center", {"shoulder_pan": 0.0, "shoulder_lift": -1.2, "elbow_flex": 1.5, "wrist_flex": -0.3, "wrist_roll": 0.0, "gripper": 0.0}),
            ("📉 Lowering arm gradually", {"shoulder_pan": 0.0, "shoulder_lift": -0.6, "elbow_flex": 0.8, "wrist_flex": -0.1, "wrist_roll": 0.0, "gripper": 0.0}),
            ("😴 Returning to rest position", {"shoulder_pan": 0.0, "shoulder_lift": 0.0, "elbow_flex": 0.0, "wrist_flex": 0.0, "wrist_roll": 0.0, "gripper": 0.0})
        ]
        
        for description, joint_positions in positions:
            print(f"🎯 {description}", flush=True)
            joint_state_msg = f"JOINT_STATE:{json.dumps(joint_positions)}"
            print(joint_state_msg, flush=True)
            time.sleep(0.5)  # Small delay to allow smooth transitions
        
        print("🎉 Fluid wave completed!", flush=True)

def main():
    try:
        robot = SimpleRobotTest()
        robot.test_movement()
        print("🎉 All tests passed!", flush=True)
    except Exception as e:
        print(f"❌ Error: {e}", flush=True)

if __name__ == '__main__':
    main()`,
    stepByStep: [
        "Create a SimpleRobotTest class for testing.",
        "Define send_position() with individual joint parameters.",
        "Send clear JOINT_STATE messages with named joints.",
        "Test each joint individually with obvious movements.",
        "Use proper timing delays between movements.",
        "Start from neutral and return to neutral.",
        "Verify each movement is visible before proceeding.",
    ],
    hints: [
        "Each joint movement is isolated and obvious.",
        "shoulder_pan=1.0 should rotate the base significantly.",
        "shoulder_lift=-0.5 should lift the arm up.",
        "elbow_flex=1.0 should bend the elbow joint.",
        "2-second delays give plenty of time for movement.",
        "Joint positions are in radians for realistic movement.",
        "This tests each joint individually for debugging.",
    ],
    concept: "Python",
    exerciseDescription: `Let's make the SO-101 robot wave with proper timing and smooth movement.`,
}

export default function DemoPage() {
    const [code, setCode] = useState(mockExercise.code)

    // Use the WebSocket hook for real-time robot control
    const {
        isConnected,
        connectionStatus,
        logs,
        jointPositions,
        executeCode,
        clearLogs,
        isRunning,
        lastError,
        sendJointPositionConfirmation,
    } = useRobotWebSocket()

    const handleRun = useCallback(async () => {
        try {
            await executeCode(code)
        } catch (error) {
            console.error("Failed to execute code:", error)
            // Error is already logged by the hook
        }
    }, [code, executeCode])

    const handleTerminalCommand = useCallback(
        (command: string) => {
            if (command.toLowerCase() === "clear") {
                clearLogs()
            } else if (command.toLowerCase() === "status") {
                const statusMsg = `Connection: ${connectionStatus}, Running: ${isRunning}, Joints: ${
                    Object.keys(jointPositions).length
                }`
                console.log(statusMsg) // This will show in terminal via logs
            } else {
                // For now, just echo the command
                console.log(`Command not recognized: ${command}`)
            }
        },
        [clearLogs, connectionStatus, isRunning, jointPositions]
    )

    return (
        <main className="h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex flex-col">
            {/* WebSocket Connection Status
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-lg font-semibold text-gray-800">
                        Click & Whirr - Robot Control Demo
                    </h1>
                    <div className="flex items-center space-x-2">
                        <div
                            className={`w-3 h-3 rounded-full ${
                                connectionStatus === "connected"
                                    ? "bg-green-500"
                                    : connectionStatus === "connecting"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                            }`}
                        ></div>
                        <span className="text-sm text-gray-600">
                            {connectionStatus === "connected"
                                ? "Connected to Robot Server"
                                : connectionStatus === "connecting"
                                ? "Connecting..."
                                : connectionStatus === "error"
                                ? "Connection Error"
                                : "Disconnected"}
                        </span>
                    </div>
                </div>
                {lastError && (
                    <div className="bg-red-50 border border-red-200 rounded px-3 py-1">
                        <span className="text-sm text-red-600">
                            {lastError}
                        </span>
                    </div>
                )}
            </div> */}

            <div className="h-full">
                <PanelGroup direction="horizontal" className="h-full">
                    <Panel
                        defaultSize={33}
                        className="flex h-full"
                        minSize={20}
                    >
                        <LessonPane exercise={mockExercise} />
                    </Panel>
                    <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-orange-500 transition-colors duration-200 relative">
                        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-gray-300 transform -translate-x-1/2" />
                    </PanelResizeHandle>
                    <Panel
                        defaultSize={34}
                        className="flex h-full"
                        minSize={30}
                    >
                        <IDE
                            code={code}
                            setCode={setCode}
                            onRun={handleRun}
                            isRunning={isRunning}
                        />
                    </Panel>
                    <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-orange-500 transition-colors duration-200 relative">
                        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-gray-300 transform -translate-x-1/2" />
                    </PanelResizeHandle>
                    <Panel
                        defaultSize={33}
                        className="flex flex-col"
                        minSize={20}
                    >
                        <div className="flex flex-col">
                            <Terminal
                                logs={logs}
                                onCommand={handleTerminalCommand}
                                isRunning={isRunning}
                            />
                            <URDFViewer
                                jointPositions={jointPositions}
                                onJointPositionsChanged={
                                    sendJointPositionConfirmation
                                }
                            />
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </main>
    )
}
