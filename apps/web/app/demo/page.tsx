"use client"

import LessonPane from "../components/ui/LessonPane"
import IDE from "../components/ui/IDE"
import Terminal from "../components/ui/Terminal"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { useState } from "react"
import URDFViewer from "../components/ui/URDFViewer"

const mockExercise = {
    id: "ex1",
    title: "Wave the arm",
    description: `Let's make the SO-101 robot wave its arm using a simple Python simulation. This demonstrates how to control robot joints and create movement patterns.`,
    code: `#!/usr/bin/env python3
"""
SO-101 Robot Arm Wave Exercise - Simulation Version
Make the SO-101 robot wave its arm using joint position control
"""

import time
import json

class RobotWaveDemo:
    def __init__(self):
        # Joint names for the SO-101 robot
        self.joint_names = [
            'base_to_shoulder',
            'shoulder_to_upper_arm', 
            'upper_arm_to_lower_arm',
            'lower_arm_to_wrist',
            'wrist_to_gripper'
        ]
        
        # Initial joint positions (all zeros)
        self.joint_positions = {
            'base_to_shoulder': 0.0,
            'shoulder_to_upper_arm': 0.0,
            'upper_arm_to_lower_arm': 0.0,
            'lower_arm_to_wrist': 0.0,
            'wrist_to_gripper': 0.0
        }
        
        print("Robot initialized successfully!")

    def update_joint_positions(self, positions):
        """Update joint positions and send to frontend"""
        for i, joint_name in enumerate(self.joint_names):
            if i < len(positions):
                self.joint_positions[joint_name] = positions[i]
        
        # Send joint state update to frontend
        print(f"JOINT_STATE:{json.dumps(self.joint_positions)}")

    def wave_arm(self):
        """Make the robot wave its arm 3 times"""
        print("Starting wave motion...")
        
        for i in range(3):
            print(f"Wave {i + 1}/3")
            
            # Move shoulder up (-1.0 radians)
            print("Moving shoulder to up position (-1.0 rad)...")
            wave_up_positions = [0.0, -1.0, 0.0, 0.0, 0.0]
            self.update_joint_positions(wave_up_positions)
            time.sleep(1.5)
            
            # Move shoulder back to neutral (0.0 radians)
            print("Moving shoulder back to neutral (0.0 rad)...")
            neutral_positions = [0.0, 0.0, 0.0, 0.0, 0.0]
            self.update_joint_positions(neutral_positions)
            time.sleep(1.5)
        
        print("Wave motion complete!")

def main():
    try:
        robot = RobotWaveDemo()
        robot.wave_arm()
        print("Demo finished successfully!")
    except KeyboardInterrupt:
        print("Program interrupted")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()`,
    stepByStep: [
        "Create a RobotWaveDemo class to manage robot state.",
        "Define the joint names for the SO-101 robot arm.",
        "Initialize joint positions to zero (neutral position).",
        "Create a method to update joint positions and send to frontend.",
        "Build a wave_arm method that repeats the motion 3 times.",
        "Move shoulder_to_upper_arm to -1.0 radians (up position).",
        "Wait for movement completion with time.sleep().",
        "Move shoulder back to 0.0 radians (neutral position).",
        "Use JSON output to communicate joint states to the frontend.",
    ],
    hints: [
        "The JOINT_STATE output format allows the frontend to update the 3D robot.",
        "Joint positions are in radians (negative values move up for shoulder).",
        "Use time.sleep() to create realistic movement timing.",
        "The json.dumps() function converts the position dict to JSON string.",
        "Print statements provide feedback about the robot's current action.",
        "Exception handling ensures graceful error management.",
    ],
    concept: "Python",
    exerciseDescription: `Let's make the SO-101 robot wave its claw using simulated joint control.`,
}

export default function DemoPage() {
    const [code, setCode] = useState(mockExercise.code)
    const [logs, setLogs] = useState<string[]>([
        "Ready to run robot wave demo...",
    ])
    const [isRunning, setIsRunning] = useState(false)
    const [jointPositions, setJointPositions] = useState<{
        [key: string]: number
    }>({})

    const handleTerminalCommand = () => {}

    const handleRun = async () => {

    }

    return (
        <main className="h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex flex-col">
            {/* TODO: Add UI for WebSocket connection status */}
            <div className="flex-1">
                <PanelGroup direction="horizontal" className="h-full">
                    <Panel defaultSize={33} className="flex" minSize={20}>
                        <LessonPane exercise={mockExercise} />
                    </Panel>
                    <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-orange-500 transition-colors duration-200 relative">
                        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-gray-300 transform -translate-x-1/2" />
                    </PanelResizeHandle>
                    <Panel defaultSize={34} className="flex" minSize={30}>
                        <IDE code={code} setCode={setCode} onRun={handleRun} />
                    </Panel>
                    <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-orange-500 transition-colors duration-200 relative">
                        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-gray-300 transform -translate-x-1/2" />
                    </PanelResizeHandle>
                    <Panel
                        defaultSize={33}
                        className="flex flex-col"
                        minSize={20}
                    >
                        <div className="flex flex-col h-full">
                            <Terminal
                                logs={logs}
                                onCommand={handleTerminalCommand}
                                isRunning={isRunning}
                            />
                            <URDFViewer jointPositions={jointPositions} />
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </main>
    )
}
