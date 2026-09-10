#!/bin/zsh
export PATH="$HOME/.gemini/antigravity-ide/bin:$PATH"

echo "=========================================="
echo " Starting Lumi AI Full-Stack Workspace"
echo " Frontend: http://localhost:5173"
echo " Backend:  http://localhost:5001"
echo "=========================================="

# Trap SIGINT/SIGTERM to kill all spawned child processes on exit
trap 'kill $(jobs -p) 2>/dev/null' EXIT INT TERM

# Start backend in background
(cd backend && npm run dev) &

# Start frontend in background
(cd frontend && npm run dev) &

wait
