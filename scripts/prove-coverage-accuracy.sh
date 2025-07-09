#!/bin/bash
set -e

PROOF_DIR="coverage-reports/proof"
COVERAGE_DIR="coverage-reports"
mkdir -p "$PROOF_DIR"

# Helper: comment out first function in a file (JS/TS, Python, Go, Java)
comment_out_first_function() {
  local file="$1"
  local lang="$2"
  case "$lang" in
    js|ts)
      # Comment out first function declaration
      sed -i.bak '0,/^function /s/^function /\/\/function /' "$file"
      ;;
    py)
      # Comment out first def
      sed -i.bak '0,/^def /s/^def /# def /' "$file"
      ;;
    go)
      # Comment out first func
      sed -i.bak '0,/^func /s/^func /\/\/func /' "$file"
      ;;
    java)
      # Comment out first public method
      sed -i.bak '0,/^    public /s/^    public /    \/\/public /' "$file"
      ;;
  esac
}
restore_file() {
  local file="$1"
  if [ -f "$file.bak" ]; then
    mv "$file.bak" "$file"
  fi
}

# JS/TS: Vitest
find . -name package.json | while read -r pkg; do
  if grep -q 'vitest' "$pkg"; then
    proj_dir=$(dirname "$pkg")
    proj_name=$(basename "$proj_dir")
    src_file=$(find "$proj_dir" -type f \( -name '*.ts' -o -name '*.js' \) | head -n1)
    if [ -f "$src_file" ]; then
      echo "[JS/TS] $proj_name: Proving coverage accuracy..."
      (cd "$proj_dir" && npx vitest run --coverage --outputFile "../$COVERAGE_DIR/${proj_name}-before.lcov")
      comment_out_first_function "$src_file" js
      (cd "$proj_dir" && npx vitest run --coverage --outputFile "../$COVERAGE_DIR/${proj_name}-after.lcov")
      restore_file "$src_file"
      echo "[JS/TS] $proj_name: See $PROOF_DIR/${proj_name}.md"
      echo "# $proj_name\n\nBefore: $COVERAGE_DIR/${proj_name}-before.lcov\nAfter: $COVERAGE_DIR/${proj_name}-after.lcov" > "$PROOF_DIR/${proj_name}.md"
    fi
  fi
done

# Python: pytest
find . -name pyproject.toml | while read -r pyproj; do
  proj_dir=$(dirname "$pyproj")
  proj_name=$(basename "$proj_dir")
  if grep -q 'pytest' "$pyproj"; then
    src_file=$(find "$proj_dir" -type f -name '*.py' | grep -v test | head -n1)
    if [ -f "$src_file" ]; then
      echo "[Python] $proj_name: Proving coverage accuracy..."
      (cd "$proj_dir" && pytest --cov=. --cov-report=lcov:"../$COVERAGE_DIR/${proj_name}-before.lcov")
      comment_out_first_function "$src_file" py
      (cd "$proj_dir" && pytest --cov=. --cov-report=lcov:"../$COVERAGE_DIR/${proj_name}-after.lcov")
      restore_file "$src_file"
      echo "[Python] $proj_name: See $PROOF_DIR/${proj_name}.md"
      echo "# $proj_name\n\nBefore: $COVERAGE_DIR/${proj_name}-before.lcov\nAfter: $COVERAGE_DIR/${proj_name}-after.lcov" > "$PROOF_DIR/${proj_name}.md"
    fi
  fi
done

# Java: Gradle/Jacoco
find . -name build.gradle | while read -r gradle; do
  proj_dir=$(dirname "$gradle")
  proj_name=$(basename "$proj_dir")
  if grep -q 'junit' "$gradle"; then
    src_file=$(find "$proj_dir/src/main/java" -type f -name '*.java' | head -n1)
    if [ -f "$src_file" ]; then
      echo "[Java] $proj_name: Proving coverage accuracy..."
      (cd "$proj_dir" && ./gradlew test jacocoTestReport)
      jacoco_xml_before=$(find "$proj_dir" -name jacocoTestReport.xml | head -n1)
      [ -f "$jacoco_xml_before" ] && cp "$jacoco_xml_before" "$COVERAGE_DIR/${proj_name}-before-jacoco.xml"
      comment_out_first_function "$src_file" java
      (cd "$proj_dir" && ./gradlew test jacocoTestReport)
      jacoco_xml_after=$(find "$proj_dir" -name jacocoTestReport.xml | head -n1)
      [ -f "$jacoco_xml_after" ] && cp "$jacoco_xml_after" "$COVERAGE_DIR/${proj_name}-after-jacoco.xml"
      restore_file "$src_file"
      echo "[Java] $proj_name: See $PROOF_DIR/${proj_name}.md"
      echo "# $proj_name\n\nBefore: $COVERAGE_DIR/${proj_name}-before-jacoco.xml\nAfter: $COVERAGE_DIR/${proj_name}-after-jacoco.xml" > "$PROOF_DIR/${proj_name}.md"
    fi
  fi
done

# Go: go test
find . -name go.mod | while read -r gomod; do
  proj_dir=$(dirname "$gomod")
  proj_name=$(basename "$proj_dir")
  src_file=$(find "$proj_dir" -type f -name '*.go' | grep -v _test.go | head -n1)
  if [ -f "$src_file" ]; then
    echo "[Go] $proj_name: Proving coverage accuracy..."
    (cd "$proj_dir" && go test -coverprofile="../$COVERAGE_DIR/${proj_name}-before.out" ./...)
    comment_out_first_function "$src_file" go
    (cd "$proj_dir" && go test -coverprofile="../$COVERAGE_DIR/${proj_name}-after.out" ./...)
    restore_file "$src_file"
    echo "[Go] $proj_name: See $PROOF_DIR/${proj_name}.md"
    echo "# $proj_name\n\nBefore: $COVERAGE_DIR/${proj_name}-before.out\nAfter: $COVERAGE_DIR/${proj_name}-after.out" > "$PROOF_DIR/${proj_name}.md"
  fi
done

echo "[Proof] See $PROOF_DIR for before/after results." 