"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import * as THREE from "three"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js"
import URDFLoader, { URDFRobot } from "urdf-loader"
import { useControls, Leva, button } from "leva"

// TODO: Refactore this to use a more modular approach

interface RobotControlsProps {
    robot: URDFRobot | null
    jointValues: { [key: string]: number }
    onJointValuesChange: (values: { [key: string]: number }) => void
}

const RobotControls: React.FC<RobotControlsProps> = ({
    robot,
    jointValues,
    onJointValuesChange,
}) => {
    const resetJoints = useCallback(() => {
        const resetValues: { [key: string]: number } = {}
        Object.keys(jointValues).forEach((key) => {
            resetValues[key] = 0
        })
        onJointValuesChange(resetValues)
    }, [jointValues, onJointValuesChange])

    // Create Leva controls dynamically based on robot joints
    const sortedJoints = React.useMemo(() => {
        return robot?.joints
            ? Object.values(robot.joints)
                  .filter((joint) =>
                      ["continuous", "prismatic", "revolute"].includes(
                          joint.jointType
                      )
                  )
                  .sort((a, b) => a.name.localeCompare(b.name))
            : []
    }, [robot?.joints])

    // Build Leva control schema
    const controlsSchema = React.useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const schema: Record<string, any> = {
            "Reset Joints": button(resetJoints),
            // "Reset Camera": button() // Placeholder for future camera reset functionality
        }

        sortedJoints.forEach((joint) => {
            const limits = joint.limit || { lower: -3.14, upper: 3.14 }
            schema[joint.name] = {
                value: jointValues[joint.name] || 0,
                min: limits.lower,
                max: limits.upper,
                step: 0.01,
            }
        })

        return schema
    }, [sortedJoints, jointValues, resetJoints])

    // Use Leva controls
    const controls = useControls(controlsSchema) as Record<string, number>

    // Update joint values when Leva controls change
    useEffect(() => {
        const newJointValues: { [key: string]: number } = {}
        sortedJoints.forEach((joint) => {
            if (controls[joint.name] !== undefined) {
                newJointValues[joint.name] = controls[joint.name]
            }
        })
        onJointValuesChange(newJointValues)
    }, [controls, sortedJoints, onJointValuesChange])

    // Return null because Leva handles its own rendering
    return (
        <Leva
            fill
            hideCopyButton
            collapsed
            titleBar={{ drag: false, filter: false, title: "Control Panel" }}
        />
    )
}

const URDFRobotViewer: React.FC<{
    robot: URDFRobot | null
    jointValues: { [key: string]: number }
    animationSpeed?: number
}> = ({ robot, jointValues, animationSpeed = 0.08 }) => {
    const { scene } = useThree()
    const robotRef = useRef<URDFRobot | null>(null)
    const currentJointValues = useRef<{ [key: string]: number }>({})
    const targetJointValues = useRef<{ [key: string]: number }>({})

    useEffect(() => {
        if (robot && robot !== robotRef.current) {
            if (robotRef.current) {
                scene.remove(robotRef.current)
            }
            scene.add(robot)
            robotRef.current = robot
            robot.rotation.x = -Math.PI / 2
        }

        return () => {
            if (robotRef.current) {
                scene.remove(robotRef.current)
                robotRef.current = null
            }
        }
    }, [robot, scene])

    // Update target positions when new joint values arrive
    useEffect(() => {
        if (Object.keys(jointValues).length > 0) {
            console.log("🎯 Setting new target positions:", jointValues)
            targetJointValues.current = { ...jointValues }

            // Initialize current values if not set
            if (Object.keys(currentJointValues.current).length === 0) {
                currentJointValues.current = { ...jointValues }
            }
        }
    }, [jointValues])

    // Smooth animation using useFrame
    useFrame(() => {
        if (
            robotRef.current?.joints &&
            Object.keys(targetJointValues.current).length > 0
        ) {
            let hasMovement = false

            Object.entries(targetJointValues.current).forEach(
                ([jointName, targetValue]) => {
                    const currentValue =
                        currentJointValues.current[jointName] || 0
                    const difference = targetValue - currentValue

                    if (Math.abs(difference) > 0.001) {
                        // Small threshold to avoid infinite tiny movements
                        hasMovement = true
                        const newValue =
                            currentValue + difference * animationSpeed
                        currentJointValues.current[jointName] = newValue

                        try {
                            if (robotRef.current!.joints[jointName]) {
                                robotRef.current!.setJointValue(
                                    jointName,
                                    newValue
                                )
                            }
                        } catch (err) {
                            console.log(`❌ Error setting ${jointName}:`, err)
                        }
                    }
                }
            )

            if (hasMovement) {
                robotRef.current.updateMatrixWorld(true)
            }
        }
    })

    return null
}

interface URDFViewerProps {
    urdfUrl?: string
    className?: string
    jointPositions?: { [key: string]: number }
    onJointPositionsChanged?: (positions: { [key: string]: number }) => void
    animationSpeed?: number // Add animation speed control
}

const URDFViewer: React.FC<URDFViewerProps> = ({
    urdfUrl = "/assets/robots/so101/so101_new_calib.urdf",
    className = "",
    jointPositions = {},
    onJointPositionsChanged,
    animationSpeed = 0.08, // Default smooth animation speed
}) => {
    const [robot, setRobot] = useState<URDFRobot | null>(null)
    const [jointValues, setJointValues] = useState<{ [key: string]: number }>(
        {}
    )
    const [isLoading, setIsLoading] = useState(false)
    const [isRobotReady, setIsRobotReady] = useState(false)

    const loadMesh = useCallback(
        (
            path: string,
            manager: THREE.LoadingManager,
            onComplete: (mesh: THREE.Object3D) => void
        ) => {
            const fullPath = path.startsWith("/")
                ? path
                : `/assets/robots/so101/${path}`

            new STLLoader(manager).load(
                fullPath,
                (geometry) => {
                    // Enhanced material with better appearance
                    const material = new THREE.MeshPhongMaterial({
                        color: 0x2563eb, // Blue robot color
                        shininess: 30,
                        specular: 0x111111,
                    })
                    const mesh = new THREE.Mesh(geometry, material)
                    mesh.castShadow = true
                    mesh.receiveShadow = true
                    onComplete(mesh)
                },
                undefined,
                () => {
                    // Enhanced fallback with better visibility
                    const geometry = new THREE.BoxGeometry(0.08, 0.08, 0.08)
                    const material = new THREE.MeshPhongMaterial({
                        color: 0xef4444, // Red fallback
                        transparent: true,
                        opacity: 0.8,
                    })
                    const mesh = new THREE.Mesh(geometry, material)
                    mesh.castShadow = true
                    onComplete(mesh)
                }
            )
        },
        []
    )

    const loadURDF = useCallback(
        async (url: string) => {
            setIsLoading(true)
            setIsRobotReady(false)
            try {
                const manager = new THREE.LoadingManager()
                const loader = new URDFLoader(manager)
                loader.packages = { "": "/assets/robots/so101/" }
                loader.loadMeshCb = loadMesh

                const loadedRobot = await new Promise<URDFRobot>(
                    (resolve, reject) => {
                        loader.load(url, resolve, undefined, reject)
                    }
                )

                setRobot(loadedRobot)

                // Initialize joint values to 0
                const initialJointValues: { [key: string]: number } = {}
                if (loadedRobot.joints) {
                    Object.keys(loadedRobot.joints).forEach((jointName) => {
                        initialJointValues[jointName] = 0
                    })
                }
                setJointValues(initialJointValues)

                // Add a small delay to ensure everything is set before marking as ready
                setTimeout(() => {
                    setIsRobotReady(true)
                }, 100)
            } catch (err) {
                console.error("URDF loading error:", err)
            } finally {
                setIsLoading(false)
            }
        },
        [loadMesh]
    )

    useEffect(() => {
        if (urdfUrl) {
            loadURDF(urdfUrl)
        }
    }, [urdfUrl, loadURDF])

    useEffect(() => {
        if (Object.keys(jointPositions).length > 0) {
            console.log(
                "📥 URDFViewer received jointPositions:",
                jointPositions
            )
            setJointValues((prev) => {
                const newValues = { ...prev, ...jointPositions }
                console.log("🔄 URDFViewer final jointValues:", newValues)

                // Notify parent component that positions have been updated
                if (onJointPositionsChanged) {
                    // Use setTimeout to ensure the visual update happens first
                    setTimeout(() => {
                        onJointPositionsChanged(newValues)
                    }, 16) // Next animation frame
                }

                return newValues
            })
        }
    }, [jointPositions, onJointPositionsChanged])

    return (
        <div className={`relative h-[50vh] ${className}`}>
            {/* Robot Status Indicator */}
            <div className="absolute top-2 left-2 z-50 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                    <div
                        className={`w-2 h-2 rounded-full ${
                            isLoading
                                ? "bg-yellow-500 animate-pulse"
                                : isRobotReady
                                ? "bg-green-500"
                                : "bg-red-500"
                        }`}
                    ></div>
                    <span>
                        {isLoading
                            ? "Loading Robot..."
                            : isRobotReady
                            ? "Robot Ready"
                            : "Robot Error"}
                    </span>
                </div>
            </div>

            <div className="absolute top-0 right-0 z-100">
                {isRobotReady &&
                    robot &&
                    Object.keys(jointValues).length > 0 && (
                        <RobotControls
                            robot={robot}
                            jointValues={jointValues}
                            onJointValuesChange={setJointValues}
                        />
                    )}
            </div>

            <Canvas camera={{ position: [-1.2, 1.0, 1.5], fov: 50 }}>
                {/* Enhanced Lighting Setup */}
                <ambientLight intensity={0.3} />
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={0.8}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />
                <directionalLight position={[-5, 5, -5]} intensity={0.4} />
                <pointLight position={[0, 3, 0]} intensity={0.3} />

                {/* Grid with better styling */}
                <gridHelper args={[2, 20]} position={[0, 0, 0]} />

                <PerspectiveCamera
                    makeDefault
                    fov={60}
                    position={[-1.2, 1.0, 1.5]}
                />
                <OrbitControls
                    enablePan
                    enableZoom
                    enableRotate
                    minDistance={0.5}
                    maxDistance={5}
                    target={[0, 0.3, 0]} // Focus on robot center
                />
                <URDFRobotViewer
                    robot={robot}
                    jointValues={jointValues}
                    animationSpeed={animationSpeed}
                />
            </Canvas>

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 ">
                    <div className="bg-white p-4 rounded">Loading URDF...</div>
                </div>
            )}
        </div>
    )
}

export default URDFViewer
