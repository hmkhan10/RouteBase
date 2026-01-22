#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

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

# Wait for both processes
wait $DJANGO_PID $NEXT_PID
