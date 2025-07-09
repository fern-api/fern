#!/bin/bash
set -e

COVERAGE_DIR="coverage-reports"
CI_MODE=0
if [[ "$1" == "--ci" ]]; then
  CI_MODE=1
fi
mkdir -p "$COVERAGE_DIR"

failures=0

# Helper: check if command exists
command_exists() { command -v "$1" >/dev/null 2>&1; }

# JS/TS: Vitest
find . -name package.json | while read -r pkg; do
  if grep -q 'vitest' "$pkg"; then
    proj_dir=$(dirname "$pkg")
    proj_name=$(basename "$proj_dir")
    if [ ! -f "$proj_dir/node_modules/.bin/vitest" ]; then
      echo "[WARN] Skipping $proj_name: vitest not installed. Run 'pnpm install' or 'npm install' in $proj_dir."
      failures=$((failures+1))
      continue
    fi
    if ! grep -q '@vitest/coverage-v8' "$pkg"; then
      echo "[WARN] Skipping $proj_name: @vitest/coverage-v8 not installed. Run 'pnpm add -D @vitest/coverage-v8' in $proj_dir."
      failures=$((failures+1))
      continue
    fi
    echo "[JS/TS] $proj_name: Running vitest coverage..."
    (cd "$proj_dir" && npx vitest run --coverage --outputFile "../$COVERAGE_DIR/${proj_name}.lcov" || failures=$((failures+1)))
    if [ $CI_MODE -eq 1 ]; then
      echo "[JS/TS] $proj_name: Coverage report:"
      cat "$COVERAGE_DIR/${proj_name}.lcov" || true
    fi
  fi
done

# Python: pytest
find . -name pyproject.toml | while read -r pyproj; do
  proj_dir=$(dirname "$pyproj")
  proj_name=$(basename "$proj_dir")
  if grep -q 'pytest' "$pyproj"; then
    if ! command_exists pytest; then
      echo "[WARN] Skipping $proj_name: pytest not installed. Run 'pip install pytest pytest-cov' in $proj_dir."
      failures=$((failures+1))
      continue
    fi
    echo "[Python] $proj_name: Running pytest coverage..."
    (cd "$proj_dir" && pytest --cov=. --cov-report=lcov:"../$COVERAGE_DIR/${proj_name}.lcov" || failures=$((failures+1)))
    if [ $CI_MODE -eq 1 ]; then
      echo "[Python] $proj_name: Coverage report:"
      cat "$COVERAGE_DIR/${proj_name}.lcov" || true
    fi
  fi
done

# Java: Gradle/Jacoco
find . -name build.gradle | while read -r gradle; do
  proj_dir=$(dirname "$gradle")
  proj_name=$(basename "$proj_dir")
  if grep -q 'junit' "$gradle"; then
    if [ ! -f "$proj_dir/gradlew" ] && ! command_exists gradle; then
      echo "[WARN] Skipping $proj_name: gradlew/gradle not found. Run 'gradle wrapper' in $proj_dir."
      failures=$((failures+1))
      continue
    fi
    echo "[Java] $proj_name: Running Gradle Jacoco coverage..."
    (cd "$proj_dir" && ( [ -f gradlew ] && ./gradlew test jacocoTestReport || gradle test jacocoTestReport ) || failures=$((failures+1)))
    jacoco_xml=$(find "$proj_dir" -name jacocoTestReport.xml | head -n1)
    if [ -f "$jacoco_xml" ]; then
      cp "$jacoco_xml" "$COVERAGE_DIR/${proj_name}-jacoco.xml"
      if [ $CI_MODE -eq 1 ]; then
        echo "[Java] $proj_name: Jacoco XML report:"
        cat "$COVERAGE_DIR/${proj_name}-jacoco.xml" || true
      fi
    fi
  fi
done

# Go: go test
find . -name go.mod | while read -r gomod; do
  proj_dir=$(dirname "$gomod")
  proj_name=$(basename "$proj_dir")
  if ! command_exists go; then
    echo "[WARN] Skipping $proj_name: go not installed."
    failures=$((failures+1))
    continue
  fi
  echo "[Go] $proj_name: Running go test coverage..."
  (cd "$proj_dir" && go test -coverprofile="../$COVERAGE_DIR/${proj_name}.out" ./... || failures=$((failures+1)))
  if [ $CI_MODE -eq 1 ]; then
    echo "[Go] $proj_name: Coverage report:"
    cat "$COVERAGE_DIR/${proj_name}.out" || true
  fi
done

echo "[Aggregate] Combine all coverage reports..."
# TODO: Aggregate lcov and XML reports, summarize in coverage-summary.md

if [ $failures -ne 0 ]; then
  echo "[ERROR] Some coverage runs failed or were skipped. See above for details."
  exit 1
fi

echo "Done. See $COVERAGE_DIR and coverage-summary.md for results." 