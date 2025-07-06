import { useRef, useEffect, useState } from 'react'

// Declare ROSLIB on window object for ROS2 bridge
declare global {
  interface Window {
    ROSLIB: any;
  }
}

export interface RobotPose {
  base_to_shoulder: number // radians
  shoulder_to_upper_arm: number // radians
  upper_arm_to_lower_arm: number // radians
  lower_arm_to_wrist: number // radians
  wrist_to_gripper: number // radians
}

export interface RobotDriver {
  moveJoint(
    name:
      | 'base_to_shoulder'
      | 'shoulder_to_upper_arm'
      | 'upper_arm_to_lower_arm'
      | 'lower_arm_to_wrist'
      | 'wrist_to_gripper',
    angle: number
  ): void
  getPose(): RobotPose
  reset(): void
  isConnected(): boolean
}

interface ROSMessage {
  name: string[]
  position: number[]
  velocity: number[]
  effort: number[]
}

export function useGazeboSimulator(): {
  driver: RobotDriver | null
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
} {
  const [driver, setDriver] = useState<RobotDriver | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const rosRef = useRef<unknown>(null)
  const jointStateRef = useRef<RobotPose>({
    base_to_shoulder: 0,
    shoulder_to_upper_arm: 0,
    upper_arm_to_lower_arm: 0,
    lower_arm_to_wrist: 0,
    wrist_to_gripper: 0,
  })

  useEffect(() => {
    // Only initialize ROS connection on client side
    if (typeof window === 'undefined') return

    // Load ROSLIB if not already loaded
    const loadROSLIB = async () => {
      if (typeof window.ROSLIB === 'undefined') {
        try {
          // Dynamically import ROSLIB
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/roslib@1/build/roslib.min.js'
          script.onload = initializeROS
          script.onerror = () => {
            console.error('Failed to load ROSLIB')
            setConnectionStatus('error')
          }
          document.head.appendChild(script)
        } catch (error) {
          console.error('Error loading ROSLIB:', error)
          setConnectionStatus('error')
        }
      } else {
        initializeROS()
      }
    }

    const initializeROS = () => {
      if (typeof window.ROSLIB === 'undefined') {
        setConnectionStatus('error')
        return
      }
      
      setConnectionStatus('connecting')
      
      try {
        // Initialize ROS2 connection via rosbridge
        const ros = new window.ROSLIB.Ros({
          url: 'ws://localhost:9090' // ROS2 Bridge websocket server
        })

      ros.on('connection', () => {
        console.log('Connected to ROS websocket server')
        setConnectionStatus('connected')
        setupRobotDriver(ros)
      })

      ros.on('error', (error: unknown) => {
        console.log('Error connecting to ROS websocket server: ', error)
        setConnectionStatus('error')
      })

      ros.on('close', () => {
        console.log('Connection to ROS websocket server closed')
        setConnectionStatus('disconnected')
        setDriver(null)
      })

        rosRef.current = ros
      } catch (error) {
        console.error('Error initializing ROS:', error)
        setConnectionStatus('error')
      }
    }

    const setupRobotDriver = (ros: unknown) => {
      // Joint state subscriber for ROS2
      const jointStateListener = new window.ROSLIB.Topic({
        ros: ros,
        name: '/joint_states',
        messageType: 'sensor_msgs/msg/JointState'
      })

      jointStateListener.subscribe((message: ROSMessage) => {
        // Update joint state from ROS messages
        const jointMap: { [key: string]: keyof RobotPose } = {
          'base_to_shoulder': 'base_to_shoulder',
          'shoulder_to_upper_arm': 'shoulder_to_upper_arm',
          'upper_arm_to_lower_arm': 'upper_arm_to_lower_arm',
          'lower_arm_to_wrist': 'lower_arm_to_wrist',
          'wrist_to_gripper': 'wrist_to_gripper'
        }

        message.name.forEach((jointName, index) => {
          const mappedName = jointMap[jointName]
          if (mappedName && message.position[index] !== undefined) {
            jointStateRef.current[mappedName] = message.position[index]
          }
        })
      })

      // Joint command publisher for ROS2
      const jointCmdPublisher = new window.ROSLIB.Topic({
        ros: ros,
        name: '/joint_trajectory_controller/joint_trajectory',
        messageType: 'trajectory_msgs/msg/JointTrajectory'
      })

      // Gazebo services for ROS2
      const resetWorldService = new window.ROSLIB.Service({
        ros: ros,
        name: '/reset_world',
        serviceType: 'std_srvs/srv/Empty'
      })

      // Robot driver implementation
      const gazeboDriver: RobotDriver = {
        moveJoint(name, angle) {
          try {
            if (typeof window.ROSLIB === 'undefined') {
              console.error('ROSLIB not available')
              return
            }
            
            const jointNames = [
              'base_to_shoulder',
              'shoulder_to_upper_arm',
              'upper_arm_to_lower_arm',
              'lower_arm_to_wrist',
              'wrist_to_gripper'
            ]

            const positions = [
              name === 'base_to_shoulder' ? angle : jointStateRef.current.base_to_shoulder,
              name === 'shoulder_to_upper_arm' ? angle : jointStateRef.current.shoulder_to_upper_arm,
              name === 'upper_arm_to_lower_arm' ? angle : jointStateRef.current.upper_arm_to_lower_arm,
              name === 'lower_arm_to_wrist' ? angle : jointStateRef.current.lower_arm_to_wrist,
              name === 'wrist_to_gripper' ? angle : jointStateRef.current.wrist_to_gripper,
            ]

            const trajectory = new window.ROSLIB.Message({
              header: {
                stamp: {
                  sec: Math.floor(Date.now() / 1000),
                  nanosec: (Date.now() % 1000) * 1000000
                },
                frame_id: ''
              },
              joint_names: jointNames,
              points: [{
                positions: positions,
                velocities: new Array(jointNames.length).fill(0),
                accelerations: new Array(jointNames.length).fill(0),
                effort: new Array(jointNames.length).fill(0),
                time_from_start: {
                  sec: 1,
                  nanosec: 0
                }
              }]
            })

            jointCmdPublisher.publish(trajectory)
          } catch (error) {
            console.error('Error moving joint:', error)
          }
        },

        getPose() {
          return { ...jointStateRef.current }
        },

        reset() {
          try {
            if (typeof window.ROSLIB === 'undefined') {
              console.error('ROSLIB not available')
              return
            }
            
            const request = new window.ROSLIB.ServiceRequest({})
            resetWorldService.callService(request, () => {
              console.log('Gazebo world reset')
              // Reset joint states
              Object.keys(jointStateRef.current).forEach(key => {
                jointStateRef.current[key as keyof RobotPose] = 0
              })
            })
          } catch (error) {
            console.error('Error resetting robot:', error)
          }
        },

        isConnected() {
          return rosRef.current?.isConnected || false
        }
      }

      setDriver(gazeboDriver)
    }

    loadROSLIB()

    return () => {
      if (rosRef.current) {
        rosRef.current.close()
      }
    }
  }, [])

  return { 
    driver, 
    connectionStatus 
  }
}
