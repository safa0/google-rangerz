#!/bin/bash

# Make this script executable with: chmod +x start.sh

# Function to cleanup processes when the script is terminated
cleanup() {
    echo "Cleaning up processes..."
    # Kill the backend server if it's running
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend server (PID: $BACKEND_PID)..."
        kill -TERM "$BACKEND_PID" 2>/dev/null || true
    fi
    
    # Check if port 5000 is still in use and force kill if necessary
    PORT_PID=$(lsof -ti:5000 2>/dev/null)
    if [ ! -z "$PORT_PID" ]; then
        echo "Force killing process using port 5000 (PID: $PORT_PID)..."
        kill -9 $PORT_PID 2>/dev/null || true
    fi
    
    echo "Cleanup complete."
    exit 0
}

# Set up trap to call cleanup function when script is terminated
trap cleanup SIGINT SIGTERM EXIT

# Check command line arguments
if [ "$1" == "test" ]; then
    echo "Setting up environment for tests..."
    
    # Check if python virtual environment exists, create if it doesn't
    if [ ! -d "venv" ]; then
        echo "Creating Python virtual environment for tests..."
        python3 -m venv venv
    fi
    
    # Activate the virtual environment
    source venv/bin/activate
    
    # Make sure all dependencies are installed
    echo "Installing dependencies..."
    pip install -r requirements.txt
    
    # Run the specified test or all tests
    if [ "$2" != "" ]; then
        echo "Running test: $2"
        python run_tests.py "$2"
    else
        echo "Running all authentication tests..."
        python run_tests.py test_auth
    fi
    
    # Save the exit code
    exit_code=$?
    
    # Delete test database if it exists
    if [ -f "test_users.db" ]; then
        rm test_users.db
    fi
    
    # Return the test exit code
    exit $exit_code
fi

# Regular app startup
# Check if port 5000 is already in use
PORT_PID=$(lsof -ti:5000 2>/dev/null)
if [ ! -z "$PORT_PID" ]; then
    echo "Port 5000 is already in use by process $PORT_PID."
    read -p "Do you want to kill this process? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Killing process $PORT_PID..."
        kill -9 $PORT_PID
        sleep 1
    else
        echo "Exiting."
        exit 1
    fi
fi

# Check if python virtual environment exists, create if it doesn't
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Start the backend server in the background
echo "Starting backend server on port 5000..."
python server.py &
BACKEND_PID=$!

# Wait a moment for the backend to start
sleep 2

# Verify the backend is running
if ! curl -s http://localhost:5000/ > /dev/null; then
    echo "Error: Backend server failed to start properly."
    cleanup
    exit 1
fi

echo "Backend running with PID: $BACKEND_PID"
echo "Starting frontend server..."

# Start the frontend server (npm doesn't propagate signals well, so we don't background it)
npm start

# Note: cleanup will be called automatically when the script exits due to the trap 