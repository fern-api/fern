#!/bin/bash
# Wire Test Runner
# This script handles the full lifecycle of wire tests:
# 1. Starts WireMock container (if not already running)
# 2. Runs cargo test with RUN_WIRE_TESTS=true
# 3. Stops WireMock container after tests complete
#
# First time setup: chmod +x run_wire_tests.sh
#
# Usage: ./run_wire_tests.sh [cargo test args...]
#    or: bash run_wire_tests.sh [cargo test args...]
#
# Example: ./run_wire_tests.sh --test imdb_test
# Example: ./run_wire_tests.sh -- --nocapture

set -e

COMPOSE_FILE="wiremock/docker-compose.test.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting WireMock container...${NC}"
docker compose -f "$COMPOSE_FILE" up -d --wait

# Ensure cleanup happens even if tests fail
cleanup() {
    echo -e "${YELLOW}Stopping WireMock container...${NC}"
    docker compose -f "$COMPOSE_FILE" down
}
trap cleanup EXIT

echo -e "${GREEN}Running wire tests...${NC}"
RUN_WIRE_TESTS=true cargo test -- --test-threads=1 "$@"

echo -e "${GREEN}Wire tests completed!${NC}"
