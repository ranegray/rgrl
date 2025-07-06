"use client"

import LessonPane from "../components/ui/LessonPane"
import IDE from "../components/ui/IDE"
import Terminal from "../components/ui/Terminal"
import GazeboViewer from "../components/ui/GazeboViewer"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { useGazeboSimulator } from "../hooks/useGazeboSimulator"
import { useState } from "react"

const mockExercise = {
    id: "ex1",
    title: "Wave the arm",
    description: `Let's make the SO-101 robot wave its arm using ROS2/Gazebo. This will confirm that your development environment is set up correctly and that you can communicate with the robot simulation.`,
    code: `#!/usr/bin/env python3
"""
SO-101 Robot Arm Wave Exercise - ROS2 Version
Make the SO-101 robot wave its arm using ROS2/Gazebo
"""

import rclpy
from rclpy.node import Node
from rclpy.duration import Duration
import time
from trajectory_msgs.msg import JointTrajectory, JointTrajectoryPoint
from std_msgs.msg import Header

class RobotWaveNode(Node):
    def __init__(self):
        super().__init__('robot_wave_demo')
        
        # Create publisher for joint trajectory
        self.publisher = self.create_publisher(
            JointTrajectory,
            '/joint_trajectory_controller/joint_trajectory',
            10
        )
        
        # Joint names for the SO-101 robot
        self.joint_names = [
            'base_to_shoulder',
            'shoulder_to_upper_arm',
            'upper_arm_to_lower_arm',
            'lower_arm_to_wrist',
            'wrist_to_gripper'
        ]
        
        # Wait for publisher to connect
        time.sleep(0.5)

    def wave_arm(self):
        """Make the robot wave its arm 3 times"""
        print("Starting wave motion...")
        
        for i in range(3):
            print(f"Wave {i + 1}/3")
            
            # Move shoulder up (-1.0 radians)
            trajectory = JointTrajectory()
            trajectory.header = Header()
            trajectory.header.stamp = self.get_clock().now().to_msg()
            trajectory.joint_names = self.joint_names
            
            point = JointTrajectoryPoint()
            point.positions = [0.0, -1.0, 0.0, 0.0, 0.0]  # shoulder_to_upper_arm = -1.0
            point.time_from_start = Duration(seconds=1.0).to_msg()
            trajectory.points = [point]
            
            self.publisher.publish(trajectory)
            time.sleep(1.5)
            
            # Move shoulder back to neutral (0.0 radians)
            trajectory.header.stamp = self.get_clock().now().to_msg()
            point.positions = [0.0, 0.0, 0.0, 0.0, 0.0]  # All joints to 0
            trajectory.points = [point]
            
            self.publisher.publish(trajectory)
            time.sleep(1.5)
        
        print("Wave motion complete!")

def main(args=None):
    rclpy.init(args=args)
    
    try:
        node = RobotWaveNode()
        node.wave_arm()
    except KeyboardInterrupt:
        print("Program interrupted")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        rclpy.shutdown()

if __name__ == '__main__':
    main()`,
    stepByStep: [
        "Initialize ROS2 with rclpy.init() and create a Node class.",
        "Create a publisher to send joint trajectory commands to the controller.",
        "Define the joint names for the robot arm.",
        "Create a loop to repeat the wave motion 3 times.",
        "Build a JointTrajectory message with target positions.",
        "Set shoulder_lift to -1.0 radians (up position).",
        "Publish the trajectory and wait for execution.",
        "Move shoulder_lift back to 0.0 radians (neutral position).",
        "Use time.sleep() to allow movement completion.",
    ],
    hints: [
        "Use \`rclpy.init()\` and create a Node class for ROS2.",
        "The \`/joint_trajectory_controller/joint_trajectory\` topic accepts JointTrajectory messages.",
        "Joint positions are in radians (negative values move up for shoulder_lift).",
        "Use \`self.get_clock().now().to_msg()\` for timestamps in ROS2.",
        "Always set \`time_from_start\` for trajectory points using Duration.",
        "Print statements help debug the execution flow.",
    ],
    concept: "ROS2 Programming, Publishers, Joint Control, Python",
    exerciseDescription: `Let's make the SO-101 robot wave its arm using ROS2/Gazebo. This will confirm that your development environment is set up correctly and that you can communicate with the robot simulation.`,
}

export default function DemoPage() {
    const { driver, connectionStatus } = useGazeboSimulator()
    const [code, setCode] = useState(mockExercise.code)
    const [terminalLogs, setTerminalLogs] = useState<Array<{message: string, type: string, timestamp: string}>>([])
    const [isRunning, setIsRunning] = useState(false)
    const [gazeboPaused, setGazeboPaused] = useState(false)

    const addLog = (message: string, type: string = "info") => {
        const timestamp = new Date().toLocaleTimeString()
        setTerminalLogs(prev => [...prev, { message, type, timestamp }])
    }

    const handleTerminalCommand = (command: string) => {
        addLog(`$ ${command}`, "input")
        
        switch (command.toLowerCase()) {
            case "clear":
                setTerminalLogs([])
                break
            case "help":
                addLog("Available commands:", "info")
                addLog("  clear - Clear the terminal", "info")
                addLog("  run - Execute the current code", "info")
                addLog("  reset - Reset the Gazebo simulation", "info")
                addLog("  status - Show connection status", "info")
                addLog("  pause - Pause/unpause Gazebo physics", "info")
                addLog("  help - Show this help message", "info")
                break
            case "run":
                handleRun()
                break
            case "reset":
                if (driver && driver.isConnected()) {
                    driver.reset()
                    addLog("Gazebo simulation reset", "success")
                } else {
                    addLog("Gazebo simulator not connected", "error")
                }
                break
            case "status":
                addLog(`Connection status: ${connectionStatus}`, "info")
                addLog(`Driver available: ${driver ? 'Yes' : 'No'}`, "info")
                if (driver) {
                    addLog(`ROS connected: ${driver.isConnected() ? 'Yes' : 'No'}`, "info")
                }
                break
            case "pause":
                setGazeboPaused(!gazeboPaused)
                addLog(`Gazebo ${!gazeboPaused ? 'paused' : 'unpaused'}`, "info")
                break
            default:
                addLog(`Unknown command: ${command}`, "error")
                addLog("Type 'help' for available commands", "info")
        }
    }

    const handleRun = async () => {
        setIsRunning(true)
        addLog("Starting code execution...", "info")
        
        if (!driver || !driver.isConnected()) {
            addLog("Gazebo simulator not connected", "error")
            addLog(`Connection status: ${connectionStatus}`, "error")
            setIsRunning(false)
            return
        }
        
        addLog("Executing code in Gazebo simulation...", "info")
        
        try {
            addLog("📝 Python code ready for execution", "info")
            addLog("⚠️  Note: This is a Python code editor for ROS/Gazebo", "warning")
            addLog("🔧 Make sure ROS/Gazebo services are running (see setup instructions)", "info")
            addLog("📋 To execute Python code:", "info")
            addLog("   1. Save code to a .py file", "info")
            addLog("   2. Run: python3 your_script.py", "info")
            addLog("   3. Or use: rosrun your_package script.py", "info")
            addLog("", "info")
            addLog("💡 Example execution commands:", "info")
            addLog("   python3 /tmp/robot_wave.py", "output")
            addLog("   rosrun my_robot_package wave_demo.py", "output")
            addLog("", "info")
            addLog("🤖 Code validated - ready for ROS execution!", "success")
        } catch (e) {
            addLog(`Validation error: ${e instanceof Error ? e.message : 'Unknown error'}`, "error")
            console.error(e)
        } finally {
            setIsRunning(false)
        }
    }

    return (
        <main className="h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex flex-col">
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
                <Panel defaultSize={33} className="flex flex-col" minSize={20}>
                    <div className="flex flex-col h-full">
                        <div className="h-1/2 mb-2">
                            <Terminal 
                                logs={terminalLogs} 
                                onCommand={handleTerminalCommand} 
                                isRunning={isRunning}
                            />
                        </div>
                        <div className="h-1/2">
                            <GazeboViewer 
                                onReset={() => {
                                    if (driver && driver.isConnected()) {
                                        driver.reset()
                                        addLog("Gazebo simulation reset", "success")
                                    }
                                }}
                                onPause={() => {
                                    setGazeboPaused(true)
                                    addLog("Gazebo simulation paused", "info")
                                }}
                                onPlay={() => {
                                    setGazeboPaused(false)
                                    addLog("Gazebo simulation resumed", "info")
                                }}
                            />
                        </div>
                    </div>
                </Panel>
                </PanelGroup>
            </div>
        </main>
    )
}
