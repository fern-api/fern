#!/bin/bash
# End-to-end OAuth test using Node.js mock server

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOCK_SERVER_DIR="$SCRIPT_DIR/mock-server"
SERVER_PID=""

cleanup() {
    echo "Cleaning up..."
    if [ -n "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
    fi
}

trap cleanup EXIT

echo "=== OAuth End-to-End Test with Node.js Mock Server ==="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "$MOCK_SERVER_DIR/node_modules" ]; then
    echo "Installing mock server dependencies..."
    cd "$MOCK_SERVER_DIR"
    npm install
    cd "$SCRIPT_DIR"
fi

# Start the mock server
echo "Starting Node.js mock server on port 8080..."
cd "$MOCK_SERVER_DIR"
node server.js &
SERVER_PID=$!
cd "$SCRIPT_DIR"

# Wait for server to be ready
echo "Waiting for server to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8080/__admin/health > /dev/null 2>&1; then
        echo "Server is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Error: Server failed to start"
        exit 1
    fi
    sleep 0.5
done

# Reset request log
curl -s -X POST http://localhost:8080/__admin/reset > /dev/null

# Run the Rust tests
echo ""
echo "Running Rust OAuth tests..."
cd "$SCRIPT_DIR"

# Set environment variable to enable wire tests
export RUN_WIRE_TESTS=true
export MOCK_SERVER_URL=http://localhost:8080

# Run specific test or all tests
if [ -n "$1" ]; then
    cargo test "$1" -- --test-threads=1 --nocapture
else
    cargo test test_oauth -- --test-threads=1 --nocapture
fi

TEST_EXIT_CODE=$?

# Show request log
echo ""
echo "=== Request Log ==="
curl -s http://localhost:8080/__admin/requests | jq '.' 2>/dev/null || curl -s http://localhost:8080/__admin/requests

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "=== All tests passed! ==="
else
    echo "=== Some tests failed ==="
fi

exit $TEST_EXIT_CODE
