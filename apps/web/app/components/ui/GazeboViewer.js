"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, RotateCcw, Maximize2, Minimize2 } from "lucide-react"

export default function GazeboViewer({ onReset, onPause, onPlay }) {
    const viewerRef = useRef(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [rosConnection, setRosConnection] = useState(null)
    const [gazeboState, setGazeboState] = useState({
        paused: false,
        realTime: 0,
        simTime: 0,
        rtf: 1.0 // Real-time factor
    })

    useEffect(() => {
        // Initialize ROS connection
        if (typeof window !== 'undefined' && typeof window.ROSLIB !== 'undefined') {
            const ros = new window.ROSLIB.Ros({
                url: 'ws://localhost:9090'
            })

            ros.on('connection', () => {
                console.log('Connected to ROS websocket server')
                setIsConnected(true)
            })

            ros.on('error', (error) => {
                console.log('Error connecting to ROS websocket server: ', error)
                setIsConnected(false)
            })

            ros.on('close', () => {
                console.log('Connection to ROS websocket server closed')
                setIsConnected(false)
            })

            setRosConnection(ros)

            // Initialize Gazebo web viewer
            if (viewerRef.current) {
                initializeGazeboViewer()
            }
        }

        return () => {
            if (rosConnection) {
                rosConnection.close()
            }
        }
    }, [])

    const initializeGazeboViewer = () => {
        if (!viewerRef.current) return

        // Create Gazebo web viewer iframe
        const iframe = document.createElement('iframe')
        iframe.src = 'http://localhost:7681' // Gazebo web interface port
        iframe.style.width = '100%'
        iframe.style.height = '100%'
        iframe.style.border = 'none'
        iframe.style.borderRadius = '8px'
        
        // Add error handling
        iframe.onload = () => {
            console.log('Gazebo viewer loaded successfully')
        }
        
        iframe.onerror = () => {
            console.error('Failed to load Gazebo viewer')
            // Fallback to status message
            viewerRef.current.innerHTML = `
                <div class="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                    <div class="text-center">
                        <div class="text-4xl mb-4">🤖</div>
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">Gazebo Simulator</h3>
                        <p class="text-gray-500 mb-4">Connecting to Gazebo...</p>
                        <div class="text-sm text-gray-400">
                            Make sure Gazebo is running with web interface enabled
                        </div>
                    </div>
                </div>
            `
        }

        viewerRef.current.appendChild(iframe)
    }

    const handleReset = () => {
        if (rosConnection && isConnected && typeof window.ROSLIB !== 'undefined') {
            try {
                // Call Gazebo reset service
                const resetService = new window.ROSLIB.Service({
                    ros: rosConnection,
                    name: '/gazebo/reset_world',
                    serviceType: 'std_srvs/Empty'
                })

                const request = new window.ROSLIB.ServiceRequest({})
                resetService.callService(request, () => {
                    console.log('Gazebo world reset')
                    onReset?.()
                })
            } catch (error) {
                console.error('Error resetting Gazebo:', error)
            }
        } else {
            onReset?.()
        }
    }

    const handlePausePlay = () => {
        if (rosConnection && isConnected && typeof window.ROSLIB !== 'undefined') {
            try {
                const serviceName = gazeboState.paused ? '/gazebo/unpause_physics' : '/gazebo/pause_physics'
                const service = new window.ROSLIB.Service({
                    ros: rosConnection,
                    name: serviceName,
                    serviceType: 'std_srvs/Empty'
                })

                const request = new window.ROSLIB.ServiceRequest({})
                service.callService(request, () => {
                    setGazeboState(prev => ({ ...prev, paused: !prev.paused }))
                    if (gazeboState.paused) {
                        onPlay?.()
                    } else {
                        onPause?.()
                    }
                })
            } catch (error) {
                console.error('Error controlling Gazebo physics:', error)
            }
        }
    }

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden ${
            isFullscreen ? 'fixed inset-4 z-50' : 'h-full'
        }`}>
            {/* Gazebo Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 border-b flex items-center justify-between">
                <div className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <h3 className="font-semibold text-sm">Gazebo Simulator</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center text-xs text-gray-300 mr-3">
                        <div className={`w-2 h-2 rounded-full mr-1 ${
                            isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                        }`}></div>
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                    <button
                        onClick={handlePausePlay}
                        className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded text-xs font-medium transition-colors duration-200 flex items-center"
                        disabled={!isConnected}
                    >
                        {gazeboState.paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    </button>
                    <button
                        onClick={handleReset}
                        className="p-1.5 bg-orange-500 hover:bg-orange-600 rounded text-xs font-medium transition-colors duration-200"
                        disabled={!isConnected}
                    >
                        <RotateCcw className="w-3 h-3" />
                    </button>
                    <button
                        onClick={toggleFullscreen}
                        className="p-1.5 bg-gray-600 hover:bg-gray-700 rounded text-xs font-medium transition-colors duration-200"
                    >
                        {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                    </button>
                </div>
            </div>

            {/* Gazebo Status Bar */}
            <div className="bg-gray-100 px-3 py-2 border-b text-xs text-gray-600 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div>Real Time: {gazeboState.realTime.toFixed(2)}s</div>
                    <div>Sim Time: {gazeboState.simTime.toFixed(2)}s</div>
                    <div>RTF: {gazeboState.rtf.toFixed(2)}x</div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                        gazeboState.paused ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                        {gazeboState.paused ? 'Paused' : 'Running'}
                    </div>
                </div>
            </div>

            {/* Gazebo Viewer */}
            <div 
                ref={viewerRef} 
                className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden"
                style={{ height: isFullscreen ? 'calc(100vh - 140px)' : 'calc(100% - 80px)' }}
            >
                {/* Fallback content while Gazebo loads */}
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="text-4xl mb-4">🤖</div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Gazebo Simulator</h3>
                        <p className="text-gray-500 mb-4">Initializing...</p>
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}