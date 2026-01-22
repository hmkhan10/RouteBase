#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Kill any existing Next.js processes first
echo "🧹 Cleaning up existing Next.js processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
rm -rf "/home/hamad-maqbool/Documents/python verse/python randoms/RouteBase parent/RouteBase/v0-route-base-main/.next" 2>/dev/null || true

# Wait a moment for processes to fully terminate
sleep 3

# Start Django Backend
echo "🚀 Starting Django Backend on port 8000..."
cd "Route Base/backend"
source "../venv_new/bin/activate"
python manage.py migrate
python manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!

# Start Next.js Frontend
echo "🚀 Starting Next.js Frontend on port 3000..."
cd "../../v0-route-base-main"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
npm run dev &
NEXT_PID=$!

echo "✅ All services started!"
echo "📊 Django Backend: http://localhost:8000"
echo "🌐 Next.js Frontend: http://localhost:3000"

# Wait for both processes
wait $DJANGO_PID $NEXT_PID
