#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start Redis Container
echo "🚀 Starting Redis on port 6379..."
sudo docker run -d --name routebase-redis -p 6379:6379 redis:7-alpine

# Wait for Redis to start
echo "⏳ Waiting for Redis to start..."
sleep 5

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
echo "🔴 Redis: localhost:6379"

# Wait for both processes
wait $DJANGO_PID $NEXT_PID
