#!/usr/bin/env bash
set -e
sim="$1"            # pybullet | mujoco | gazebo
secs="${2:-120}"

docker compose up -d "$sim"
cid=$(docker compose ps -q "$sim")

echo "==> Stats for $sim (running $secs s)"
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" "$cid" &
statspid=$!

sleep "$secs"
kill -INT "$statspid"

mkdir -p benchmarks
docker stats --no-stream --format "{{.Name}} {{.CPUPerc}} {{.MemUsage}}" "$cid" \
  > "benchmarks/$(date +%F)_${sim}.txt"

docker compose rm -sf "$sim"
