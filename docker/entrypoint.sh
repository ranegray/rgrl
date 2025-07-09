#!/usr/bin/env bash
set -e

DUR="${BENCH_SECONDS:-120}"         # default 2 min
echo "[sim] running $* for ${DUR}s"

"$@" &                               # fire up the sim
PID=$!

sleep "${DUR}"                       # hold container open
echo "[sim] done, shutting down"
kill -INT "${PID}" 2>/dev/null || true
wait "${PID}" || true
