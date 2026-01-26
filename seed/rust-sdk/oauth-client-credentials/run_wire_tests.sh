#!/bin/bash
# Wire test runner script for OAuth Client Credentials SDK
#
# This script manages the WireMock container lifecycle and runs wire tests.
#
# Usage:
#   ./run_wire_tests.sh              # Run all wire tests
#   ./run_wire_tests.sh --test foo   # Run specific test
#   ./run_wire_tests.sh --help       # Show help
#
# This is automatically generated and should not be modified manually.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/wiremock/docker-compose.test.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

show_help() {
    echo "Wire Test Runner for OAuth Client Credentials SDK"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --test <name>    Run specific test by name"
    echo "  --no-cleanup     Don't stop WireMock after tests"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Run all wire tests"
    echo "  $0 --test oauth_token_fetch  # Run specific test"
}

cleanup() {
    if [ "$NO_CLEANUP" != "true" ]; then
        echo -e "${YELLOW}Stopping WireMock container...${NC}"
        docker compose -f "$COMPOSE_FILE" down 2>/dev/null || true
    fi
}

# Parse arguments
TEST_FILTER=""
NO_CLEANUP="false"

while [[ $# -gt 0 ]]; do
    case $1 in
        --test)
            TEST_FILTER="$2"
            shift 2
            ;;
        --no-cleanup)
            NO_CLEANUP="true"
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Set up cleanup trap
trap cleanup EXIT

# Check if docker compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}Error: Docker compose file not found at $COMPOSE_FILE${NC}"
    exit 1
fi

# Start WireMock
echo -e "${GREEN}Starting WireMock container...${NC}"
docker compose -f "$COMPOSE_FILE" up -d --wait

# Run tests
echo -e "${GREEN}Running wire tests...${NC}"
cd "$SCRIPT_DIR"

if [ -n "$TEST_FILTER" ]; then
    RUN_WIRE_TESTS=true cargo test "$TEST_FILTER" -- --test-threads=1 --nocapture
else
    RUN_WIRE_TESTS=true cargo test -- --test-threads=1 --nocapture
fi

echo -e "${GREEN}Wire tests completed successfully!${NC}"
