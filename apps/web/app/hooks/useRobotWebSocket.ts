// app/hooks/useRobotWebSocket.ts
"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
const PYTHON_WEB_SOCKET_SERVICEURL = 'wss://code-dock-1045653961265.us-central1.run.app'
interface JointState {
  [key: string]: number
}

interface WebSocketMessage {
  type: 'stdout' | 'stderr' | 'joint_state' | 'execution_start' | 'execution_complete' | 'error' | 'test_start'
  data: string | JointState
  timestamp: number
}

interface UseRobotWebSocketReturn {
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  logs: string[]
  jointPositions: JointState
  executeCode: (code: string, stdin?: string) => Promise<{ success: boolean; output?: string; error?: string }>
  clearLogs: () => void
  isRunning: boolean
  lastError: string | null
  sendJointPositionConfirmation: (positions: JointState) => void
}

export function useRobotWebSocket(serverUrl: string = PYTHON_WEB_SOCKET_SERVICEURL): UseRobotWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [logs, setLogs] = useState<string[]>([])
  const [jointPositions, setJointPositions] = useState<JointState>({})
  const [isRunning, setIsRunning] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const addLog = useCallback((message: string, type?: 'error' | 'success' | 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'info' ? 'ℹ️' : ''
    const formattedMessage = `[${timestamp}] ${prefix} ${message}`

    setLogs(prev => [...prev, formattedMessage])
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setConnectionStatus('connecting')
    setLastError(null)

    try {
      const wsUrl = `${serverUrl}/ws`
      console.log('Connecting to WebSocket:', wsUrl)

      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        addLog('Connected to robot control server', 'success')
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)

          switch (message.type) {
            case 'stdout':
              if (typeof message.data === 'string') {
                addLog(message.data)
              }
              break

            case 'stderr':
              if (typeof message.data === 'string' && message.data.trim()) {
                addLog(message.data, 'error')
              }
              break

            case 'joint_state':
              // Update robot joint positions in real-time
              console.log('🔥 WebSocket received joint_state:', message.data)

              // Immediately update joint positions - let React handle the timing
              if (typeof message.data === 'object' && message.data !== null) {
                setJointPositions(message.data as JointState)
                console.log('🔥 Updated jointPositions state to:', message.data)
                addLog(`Joint update: ${Object.keys(message.data as JointState).length} joints`, 'info')
              }
              break

            case 'execution_start':
              setIsRunning(true)
              if (typeof message.data === 'string') {
                addLog(message.data, 'info')
              }
              break

            case 'execution_complete':
              setIsRunning(false)
              if (typeof message.data === 'string') {
                addLog(message.data, 'success')
              }
              break

            case 'error':
              setIsRunning(false)
              if (typeof message.data === 'string') {
                addLog(message.data, 'error')
                setLastError(message.data)
              }
              break

            case 'test_start':
              if (typeof message.data === 'string') {
                addLog(message.data, 'info')
              }
              break

            default:
              console.log('Unknown message type:', message.type)
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
          addLog(`Failed to parse message: ${event.data}`, 'error')
        }
      }

      wsRef.current.onclose = (event) => {
        setIsConnected(false)
        setConnectionStatus('disconnected')

        if (event.code !== 1000) { // Not a normal closure
          addLog(`Connection lost (${event.code}): ${event.reason || 'Unknown reason'}`, 'error')

          // Attempt to reconnect
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000)

            addLog(`Reconnecting in ${delay / 1000}s... (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`, 'info')

            reconnectTimeoutRef.current = setTimeout(() => {
              connect()
            }, delay)
          } else {
            addLog('Max reconnection attempts reached. Please refresh the page.', 'error')
            setConnectionStatus('error')
          }
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('error')
        addLog('WebSocket connection error', 'error')
      }

    } catch (err) {
      console.error('Failed to create WebSocket connection:', err)
      setConnectionStatus('error')
      addLog('Failed to connect to robot server', 'error')
    }
  }, [serverUrl, addLog])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnect')
      wsRef.current = null
    }

    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [])

  const executeCode = useCallback(async (code: string, stdin: string = ''): Promise<{ success: boolean; output?: string; error?: string }> => {
    try {
      if (!isConnected) {
        throw new Error('Not connected to robot server')
      }

      const response = await fetch(`${serverUrl.replace('ws:', 'http:').replace('wss:', 'https:')}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          stdin,
          tests: null
        }),
        // Reduce timeout since we removed artificial delays
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      addLog(`Execution failed: ${errorMessage}`, 'error')
      setLastError(errorMessage)
      throw err
    }
  }, [isConnected, serverUrl, addLog])

  // Initialize connection
  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      disconnect()
    }
  }, [disconnect])

  const sendJointPositionConfirmation = useCallback((positions: JointState) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'joint_position_confirmed',
        data: positions,
        timestamp: Date.now()
      }
      wsRef.current.send(JSON.stringify(message))
      console.log('📤 Sent joint position confirmation:', positions)
    }
  }, [])

  return {
    isConnected,
    connectionStatus,
    logs,
    jointPositions,
    executeCode,
    clearLogs,
    isRunning,
    lastError,
    sendJointPositionConfirmation
  }
}
