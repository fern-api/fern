#!/bin/bash

# Script to comprehensively test all Java SDK fixtures
FIXTURES="pagination exhaustive examples unions basic-auth oauth-client-credentials custom-auth client-side-params file-upload"

echo "=== Testing Java SDK Wire Test Fixtures ==="
echo ""

TOTAL=0
PASSED=0
FAILED=0

for fixture in $FIXTURES; do
    echo "Testing fixture: $fixture"
    echo "----------------------------"

    # Find the wire-tests directory for this fixture
    WIRE_TEST_DIR=$(find seed/java-sdk/$fixture -type d -name "wire-tests" 2>/dev/null | head -1)

    if [ -z "$WIRE_TEST_DIR" ]; then
        echo "  ⚠️  No wire-tests directory found for $fixture"
        echo ""
        continue
    fi

    TOTAL=$((TOTAL + 1))

    echo "  Found wire-tests at: $WIRE_TEST_DIR"

    # Navigate to the wire test directory
    cd "$WIRE_TEST_DIR" || continue

    # Try to compile and run tests
    echo "  Compiling and running tests..."
    if ./gradlew test --tests "*WireTest" --quiet 2>&1 | grep -q "BUILD SUCCESSFUL"; then
        echo "  ✅ Tests passed for $fixture"
        PASSED=$((PASSED + 1))
    else
        echo "  ❌ Tests failed for $fixture"

        # Try to see what went wrong
        echo "  Checking compilation errors..."
        ./gradlew compileTestJava -x compileJava 2>&1 | grep "error:" | head -5

        FAILED=$((FAILED + 1))
    fi

    # Go back to root
    cd - > /dev/null
    echo ""
done

echo "=== Summary ==="
echo "Total fixtures tested: $TOTAL"
echo "Passed: $PASSED"
echo "Failed: $FAILED"