import { useState, useRef, useEffect } from "react";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [output, setOutput] = useState("");
  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5; // Maximum number of reconnection attempts
  const reconnectDelay = 5000; // Delay between reconnection attempts in milliseconds

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectWebSocket = () => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      console.log("WebSocket is already connected or connecting");
      return;
    }

    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log("Max reconnection attempts reached. Stopping reconnection.");
      return;
    }

    // TODO - Replace with your own WebSocket server URL
    wsRef.current = new WebSocket("ws://localhost:8765");

    wsRef.current.onopen = (event) => {
      console.log("WebSocket Connected", event);
      setIsConnected(true);
      reconnectAttemptsRef.current = 0; // Reset reconnection attempts on successful connection
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "output") {
        setOutput(data.data + "\n");
      }
    };

    wsRef.current.onclose = (event) => {
      console.log("WebSocket Disconnected", event);
      setIsConnected(false);
      reconnectAttemptsRef.current += 1;
      setTimeout(connectWebSocket, reconnectDelay);
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
  };

  const sendCode = (code) => {
    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "runCode", code }));
    } else {
      setOutput("Not connected to server. Please wait...");
    }
  };

  return { isConnected, output, sendCode };
}
