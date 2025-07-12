"""
Enhanced FastAPI server with WebSocket support for real-time robot joint updates.
Replaces the existing code-dock/server.py
"""

import os
import sys
import subprocess
import tempfile
import shutil
import json
import uuid
import resource
import asyncio
import threading
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Cloud Python Runner with WebSocket")

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── request schema ────────────────────────────────────────────────────
class ExecRequest(BaseModel):
    code: str  # main.py source
    stdin: str | None = ""  # optional stdin
    tests: str | None = None  # optional pytest file


# ── WebSocket connection manager ──────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(
            f"WebSocket disconnected. Total connections: {len(self.active_connections)}"
        )

    async def send_message(self, message: str):
        if self.active_connections:
            disconnected = []
            for connection in self.active_connections:
                try:
                    await connection.send_text(message)
                except:
                    disconnected.append(connection)

            # Remove disconnected connections
            for conn in disconnected:
                self.disconnect(conn)


manager = ConnectionManager()


# ── per‑process resource caps (no nsjail) ─────────────────────────────
def _limits() -> None:
    resource.setrlimit(resource.RLIMIT_AS, (256 << 20, 256 << 20))  # 256 MB
    resource.setrlimit(
        resource.RLIMIT_CPU, (10, 10)
    )  # 10 CPU‑s (increased for longer running code)
    resource.setrlimit(resource.RLIMIT_NPROC, (10, 10))  # fork cap


def parse_output_for_joint_states(output: str) -> List[Dict[str, Any]]:
    """
    Parse output for JOINT_STATE lines and extract joint positions
    Format expected: JOINT_STATE:{"joint_name": value, ...}
    """
    joint_states = []
    lines = output.split("\n")

    for line in lines:
        line = line.strip()
        if line.startswith("JOINT_STATE:"):
            try:
                json_str = line[len("JOINT_STATE:") :]
                joint_data = json.loads(json_str)
                joint_states.append(
                    {
                        "type": "joint_state",
                        "data": joint_data,
                        "timestamp": asyncio.get_event_loop().time(),
                    }
                )
            except json.JSONDecodeError as e:
                print(f"Failed to parse joint state JSON: {e}")
                print(f"Raw line: {line}")

    return joint_states


async def stream_process_output(process, workdir: str):
    """
    Stream process output in real-time and broadcast joint states via WebSocket
    """
    stdout_data = []
    stderr_data = []

    # Read stdout line by line
    while True:
        try:
            line = await asyncio.wait_for(process.stdout.readline(), timeout=0.1)
            if not line:
                break

            line_str = line.decode("utf-8").rstrip()
            stdout_data.append(line_str)

            print(f"📝 Server received line: {line_str}")

            # Send regular output to WebSocket
            await manager.send_message(
                json.dumps(
                    {
                        "type": "stdout",
                        "data": line_str,
                        "timestamp": asyncio.get_event_loop().time(),
                    }
                )
            )

            # Check for joint state updates
            if line_str.strip().startswith("JOINT_STATE:"):
                print(f"🎯 Found JOINT_STATE line: {line_str}")
                joint_states = parse_output_for_joint_states(line_str)
                for joint_state in joint_states:
                    print(f"🚀 Sending joint state: {joint_state}")
                    await manager.send_message(json.dumps(joint_state))

        except asyncio.TimeoutError:
            # Check if process is still running
            if process.returncode is not None:
                break
        except Exception as e:
            print(f"Error reading process output: {e}")
            break

    # Read any remaining stderr
    try:
        stderr_output = await process.stderr.read()
        if stderr_output:
            stderr_str = stderr_output.decode("utf-8")
            stderr_data.append(stderr_str)
            await manager.send_message(
                json.dumps(
                    {
                        "type": "stderr",
                        "data": stderr_str,
                        "timestamp": asyncio.get_event_loop().time(),
                    }
                )
            )
    except:
        pass

    return "\n".join(stdout_data), "\n".join(stderr_data)


# ── WebSocket endpoint for real-time communication ───────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Listen for incoming messages from the frontend
            message = await websocket.receive_text()
            try:
                msg_data = json.loads(message)
                msg_type = msg_data.get("type")

                if msg_type == "joint_position_confirmed":
                    # Handle position confirmation from URDF viewer
                    joint_positions = msg_data.get("data", {})
                    print(f"📥 Received joint position confirmation: {joint_positions}")

                    # Broadcast confirmation to all connected clients (including Python execution context)
                    await manager.send_message(
                        json.dumps(
                            {
                                "type": "joint_position_confirmed",
                                "data": joint_positions,
                                "timestamp": asyncio.get_event_loop().time(),
                            }
                        )
                    )

                else:
                    # Echo unknown messages
                    await websocket.send_text(f"Server received: {message}")

            except json.JSONDecodeError:
                await websocket.send_text(f"Server received (non-JSON): {message}")

    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ── enhanced execution endpoint with WebSocket streaming ──────────────
@app.post("/execute")
async def execute(req: ExecRequest):
    workdir = tempfile.mkdtemp(prefix=f"job_{uuid.uuid4()}_")
    try:
        # 1 · write user code (and tests)
        with open(os.path.join(workdir, "main.py"), "w", encoding="utf-8") as f:
            f.write(req.code)
        if req.tests:
            with open(
                os.path.join(workdir, "test_user.py"), "w", encoding="utf-8"
            ) as f:
                f.write(req.tests)

        # 2 · run main.py with async process for real-time streaming
        await manager.send_message(
            json.dumps(
                {
                    "type": "execution_start",
                    "data": "Starting Python execution...",
                    "timestamp": asyncio.get_event_loop().time(),
                }
            )
        )

        process = await asyncio.create_subprocess_exec(
            sys.executable,
            "main.py",
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=workdir,
            preexec_fn=_limits,
        )

        # Send stdin if provided
        if req.stdin:
            process.stdin.write(req.stdin.encode())
            await process.stdin.drain()
        process.stdin.close()

        # Stream output in real-time
        stdout, stderr = await asyncio.wait_for(
            stream_process_output(process, workdir),
            timeout=15,  # Increased timeout for robot movements
        )

        # Wait for process to complete
        await process.wait()

        result = {
            "exit_code": process.returncode,
            "stdout": stdout,
            "stderr": stderr,
        }

        # 3 · optional pytest run
        if req.tests:
            await manager.send_message(
                json.dumps(
                    {
                        "type": "test_start",
                        "data": "Running tests...",
                        "timestamp": asyncio.get_event_loop().time(),
                    }
                )
            )

            test_proc = await asyncio.create_subprocess_exec(
                sys.executable,
                "-m",
                "pytest",
                "-q",
                "test_user.py",
                "--json-report",
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=workdir,
                preexec_fn=_limits,
            )

            test_stdout, test_stderr = await asyncio.wait_for(
                test_proc.communicate(), timeout=6
            )

            report_path = os.path.join(workdir, ".report.json")
            tests = []
            if os.path.exists(report_path):
                with open(report_path, "r", encoding="utf-8") as rf:
                    rep = json.load(rf)
                tests = [
                    {
                        "name": t["nodeid"],
                        "status": t["outcome"],
                        "duration_ms": int(t["duration"] * 1000),
                    }
                    for t in rep.get("tests", [])
                ]
            result["tests"] = tests

        await manager.send_message(
            json.dumps(
                {
                    "type": "execution_complete",
                    "data": f'Execution finished with exit code: {result["exit_code"]}',
                    "timestamp": asyncio.get_event_loop().time(),
                }
            )
        )

        return result

    except asyncio.TimeoutError:
        await manager.send_message(
            json.dumps(
                {
                    "type": "error",
                    "data": "Execution timed out",
                    "timestamp": asyncio.get_event_loop().time(),
                }
            )
        )
        raise HTTPException(status_code=408, detail="Execution timed out")

    except Exception as e:
        await manager.send_message(
            json.dumps(
                {
                    "type": "error",
                    "data": f"Execution error: {str(e)}",
                    "timestamp": asyncio.get_event_loop().time(),
                }
            )
        )
        raise HTTPException(status_code=500, detail=f"Execution error: {str(e)}")

    finally:
        shutil.rmtree(workdir, ignore_errors=True)


# ── health check endpoint ─────────────────────────────────────────────
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "connections": len(manager.active_connections),
        "message": "WebSocket Python execution server running",
    }


# ── launch when run directly (Docker CMD ["python","server.py"]) ─────
if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8080")),
        workers=1,
    )
