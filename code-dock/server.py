"""
Minimal FastAPI cloud‑compiler (no nsjail).
Runs user‑supplied Python code in a temp dir and returns stdout/stderr.
"""

import os
import sys
import subprocess
import tempfile
import shutil
import json
import uuid
import resource
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Cloud Python Runner")

# ── request schema ────────────────────────────────────────────────────
class ExecRequest(BaseModel):
    code: str                  # main.py source
    stdin: str | None = ""     # optional stdin
    tests: str | None = None   # optional pytest file


# ── per‑process resource caps (no nsjail) ─────────────────────────────
def _limits() -> None:
    resource.setrlimit(resource.RLIMIT_AS,  (256 << 20, 256 << 20))  # 256 MB
    resource.setrlimit(resource.RLIMIT_CPU, (2, 2))                  # 2 CPU‑s
    resource.setrlimit(resource.RLIMIT_NPROC, (10, 10))              # fork cap


# ── main execution endpoint ──────────────────────────────────────────
@app.post("/execute")
def execute(req: ExecRequest):
    workdir = tempfile.mkdtemp(prefix=f"job_{uuid.uuid4()}_")
    try:
        # 1 · write user code (and tests)
        with open(os.path.join(workdir, "main.py"), "w", encoding="utf-8") as f:
            f.write(req.code)
        if req.tests:
            with open(os.path.join(workdir, "test_user.py"), "w", encoding="utf-8") as f:
                f.write(req.tests)

        # 2 · run main.py
        proc = subprocess.run(
            [sys.executable, "main.py"],
            input=(req.stdin or ""),
            text=True,
            capture_output=True,
            cwd=workdir,
            timeout=4,
            preexec_fn=_limits,
        )

        result = {
            "exit_code": proc.returncode,
            "stdout": proc.stdout,
            "stderr": proc.stderr,
        }

        # 3 · optional pytest run
        if req.tests:
            test_proc = subprocess.run(
                [sys.executable, "-m", "pytest", "-q", "test_user.py", "--json-report"],
                capture_output=True,
                text=True,
                cwd=workdir,
                timeout=6,
                preexec_fn=_limits,
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

        return result

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Execution timed out")

    finally:
        shutil.rmtree(workdir, ignore_errors=True)


# ── launch when run directly (Docker CMD ["python","server.py"]) ─────
if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8080")),
        workers=1,
    )

