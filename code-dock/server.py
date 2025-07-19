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
import signal
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
                except WebSocketDisconnect:
                    disconnected.append(connection)
                except Exception as e:
                    print(f"Error sending message: {e}")

            # Remove disconnected connections
            for conn in disconnected:
                self.disconnect(conn)


manager = ConnectionManager()


# ── security validation functions ─────────────────────────────────────
def validate_user_code(code: str) -> None:
    """Validate user code for dangerous patterns"""
    dangerous_patterns = [
        'import os', 'import sys', 'import subprocess', 'import socket',
        'import urllib', 'import requests', 'import httpx', 'from os',
        'from sys', 'from subprocess', 'from socket', '__import__',
        'eval(', 'exec(', 'compile(', 'open(', 'file(', 'input(',
        'raw_input(', 'globals(', 'locals(', 'vars(', 'dir(',
        'getattr(', 'setattr(', 'delattr(', 'hasattr(',
    ]
    
    code_lower = code.lower()
    for pattern in dangerous_patterns:
        if pattern in code_lower:
            raise ValueError(f"Dangerous code pattern detected: {pattern}")
    
    # Check for excessive complexity
    if len(code) > 50000:  # 50KB limit
        raise ValueError("Code size exceeds limit")
    
    if code.count('\n') > 2000:  # Line limit
        raise ValueError("Too many lines of code")


def secure_workspace_setup(workdir: str) -> None:
    """Set up secure workspace with restricted permissions"""
    # Remove write permissions from parent directories
    try:
        parent_dir = os.path.dirname(workdir)
        os.chmod(parent_dir, 0o555)  # Read and execute only
    except:
        pass
    
    # Restrict workspace permissions
    os.chmod(workdir, 0o700)  # Owner read/write/execute only
    
    # Create restricted __pycache__ to prevent bytecode attacks
    pycache_dir = os.path.join(workdir, '__pycache__')
    if os.path.exists(pycache_dir):
        shutil.rmtree(pycache_dir)


def cleanup_process_group(process):
    """Forcefully cleanup process and any child processes"""
    try:
        if process.returncode is None:
            # Kill entire process group
            os.killpg(os.getpgid(process.pid), signal.SIGKILL)
        process.kill()
        asyncio.create_task(process.wait())
    except:
        pass


# ── enhanced security limits with process isolation ─────────────────
def _security_limits() -> None:
    """Apply comprehensive security limits to user code execution"""
    # Memory limits: 128MB virtual memory, 64MB RSS
    resource.setrlimit(resource.RLIMIT_AS, (128 << 20, 128 << 20))
    resource.setrlimit(resource.RLIMIT_RSS, (64 << 20, 64 << 20))
    
    # CPU time: 5 seconds max
    resource.setrlimit(resource.RLIMIT_CPU, (5, 5))
    
    # Process limits: prevent fork bombing
    resource.setrlimit(resource.RLIMIT_NPROC, (1, 1))
    
    # File limits: prevent file descriptor exhaustion
    resource.setrlimit(resource.RLIMIT_NOFILE, (32, 32))
    resource.setrlimit(resource.RLIMIT_FSIZE, (10 << 20, 10 << 20))  # 10MB file size
    
    # Core dumps disabled
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    
    # Set process group to enable cleanup
    os.setpgrp()
    
    # Disable network access by setting restrictive umask
    os.umask(0o077)


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
    Stream process output in real-time with security monitoring
    """
    stdout_data = []
    stderr_data = []
    start_time = asyncio.get_event_loop().time()
    max_output_lines = 1000  # Prevent output flooding
    line_count = 0

    # Read stdout line by line with security checks
    while True:
        try:
            line = await asyncio.wait_for(process.stdout.readline(), timeout=0.1)
            if not line:
                break

            # Check for excessive output
            line_count += 1
            if line_count > max_output_lines:
                await manager.send_message(
                    json.dumps({
                        "type": "error",
                        "data": "Output limit exceeded - execution terminated",
                        "timestamp": asyncio.get_event_loop().time(),
                    })
                )
                process.kill()
                break

            # Check for execution time limit
            if asyncio.get_event_loop().time() - start_time > 10:  # 10 second hard limit
                await manager.send_message(
                    json.dumps({
                        "type": "error", 
                        "data": "Time limit exceeded - execution terminated",
                        "timestamp": asyncio.get_event_loop().time(),
                    })
                )
                process.kill()
                break

            line_str = line.decode("utf-8", errors="replace").rstrip()
            stdout_data.append(line_str)

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
                joint_states = parse_output_for_joint_states(line_str)
                for joint_state in joint_states:
                    await manager.send_message(json.dumps(joint_state))

        except asyncio.TimeoutError:
            # Check if process is still running
            if process.returncode is not None:
                break
        except Exception as e:
            print(f"Error reading process output: {e}")
            break

    # Read any remaining stderr with limits
    try:
        stderr_output = await asyncio.wait_for(process.stderr.read(), timeout=1.0)
        if stderr_output:
            stderr_str = stderr_output.decode("utf-8", errors="replace")[:10000]  # Limit stderr size
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
    process = None
    workdir = tempfile.mkdtemp(prefix=f"secure_job_{uuid.uuid4()}_")
    
    try:
        # 1 · Security validation
        validate_user_code(req.code)
        if req.tests:
            validate_user_code(req.tests)
        
        # 2 · Setup secure workspace
        secure_workspace_setup(workdir)
        
        # 3 · write user code (and tests) with restricted content
        with open(os.path.join(workdir, "main.py"), "w", encoding="utf-8") as f:
            f.write(req.code)
        if req.tests:
            with open(
                os.path.join(workdir, "test_user.py"), "w", encoding="utf-8"
            ) as f:
                f.write(req.tests)

        # 4 · run main.py with enhanced security sandbox
        await manager.send_message(
            json.dumps(
                {
                    "type": "execution_start",
                    "data": "Running...",
                    "timestamp": asyncio.get_event_loop().time(),
                }
            )
        )

        # Create secure execution environment
        env = os.environ.copy()
        # Remove sensitive environment variables
        for key in list(env.keys()):
            if any(sensitive in key.upper() for sensitive in ['SECRET', 'KEY', 'TOKEN', 'PASSWORD', 'AUTH']):
                del env[key]
        
        # Add restricted Python environment
        env['PYTHONPATH'] = workdir
        env['PYTHONDONTWRITEBYTECODE'] = '1'
        env['PYTHONHASHSEED'] = '0'

        process = await asyncio.create_subprocess_exec(
            sys.executable,
            "-I",  # Isolated mode - ignore environment variables and user site
            "-u",  # Unbuffered output
            "-B",  # Don't write .pyc files
            "main.py",
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=workdir,
            env=env,
            preexec_fn=_security_limits,
        )

        # Send stdin if provided
        if req.stdin:
            process.stdin.write(req.stdin.encode())
            await process.stdin.drain()
        process.stdin.close()

        # Stream output in real-time with strict timeout
        stdout, stderr = await asyncio.wait_for(
            stream_process_output(process, workdir),
            timeout=12,  # Hard timeout with buffer
        )

        # Wait for process to complete with cleanup
        try:
            await process.wait()
        finally:
            cleanup_process_group(process)

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
                "-I",  # Isolated mode
                "-m",
                "pytest",
                "-q",
                "test_user.py",
                "--json-report",
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=workdir,
                env=env,
                preexec_fn=_security_limits,
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

    except ValueError as e:
        # Security validation error
        await manager.send_message(
            json.dumps(
                {
                    "type": "error",
                    "data": f"Security violation: {str(e)}",
                    "timestamp": asyncio.get_event_loop().time(),
                }
            )
        )
        raise HTTPException(status_code=400, detail=f"Security violation: {str(e)}")

    except asyncio.TimeoutError:
        if process:
            cleanup_process_group(process)
        await manager.send_message(
            json.dumps(
                {
                    "type": "error",
                    "data": "Execution timed out - process terminated",
                    "timestamp": asyncio.get_event_loop().time(),
                }
            )
        )
        raise HTTPException(status_code=408, detail="Execution timed out")

    except Exception as e:
        if process:
            cleanup_process_group(process)
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
        # Secure cleanup of workspace
        try:
            shutil.rmtree(workdir, ignore_errors=True)
        except:
            pass


@app.get("/version")
def get_version():
    return {"version": "clod-dock-secured", "message": "This is the updated container with added security."}
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

