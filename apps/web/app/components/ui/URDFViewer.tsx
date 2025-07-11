"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import * as THREE from "three"
import { Canvas, useThree } from "@react-three/fiber"
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
}> = ({ robot, jointValues }) => {
    const { scene } = useThree()
    const robotRef = useRef<URDFRobot | null>(null)

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

    useEffect(() => {
        if (robotRef.current?.joints) {
            Object.entries(jointValues).forEach(([jointName, value]) => {
                try {
                    robotRef.current!.setJointValue(jointName, value)
                } catch {
                    // Joint might not exist
                }
            })
            robotRef.current.updateMatrixWorld(true)
        }
    }, [jointValues])

    return null
}

interface URDFViewerProps {
    urdfUrl?: string
    className?: string
    jointPositions?: { [key: string]: number }
}

const URDFViewer: React.FC<URDFViewerProps> = ({
    urdfUrl = "/assets/robots/so101/so101_new_calib.urdf",
    className = "",
    jointPositions = {},
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
                    const material = new THREE.MeshPhongMaterial({
                        color: 0x888888,
                    })
                    const mesh = new THREE.Mesh(geometry, material)
                    onComplete(mesh)
                },
                undefined,
                () => {
                    // Fallback red cube
                    const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05)
                    const material = new THREE.MeshPhongMaterial({
                        color: 0xff0000,
                    })
                    const mesh = new THREE.Mesh(geometry, material)
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
            setJointValues((prev) => ({ ...prev, ...jointPositions }))
        }
    }, [jointPositions])

    return (
        <div className={`relative h-full ${className}`}>
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

            <Canvas camera={{ position: [-5.5, 3.5, 5.5], fov: 50 }}>
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <gridHelper args={[10, 10]} />
                <PerspectiveCamera
                    makeDefault
                    fov={60}
                    position={[0.5, 0.5, 0.5]}
                />
                <OrbitControls
                    enablePan
                    enableZoom
                    enableRotate
                    minDistance={0.25}
                    maxDistance={2}
                />
                <URDFRobotViewer robot={robot} jointValues={jointValues} />
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
