# Test Coverage System

This directory contains scripts to assess and prove test coverage across all subprojects in the monorepo.

## Scripts

### 1. collect-coverage.sh
- Runs coverage for all supported languages and subprojects.
- Aggregates all coverage reports into `coverage-reports/`.
- Produces a unified summary in `coverage-summary.md`.

**Usage:**
```sh
bash scripts/collect-coverage.sh
```

### 2. prove-coverage-accuracy.sh
- Mutates a line/function in each subproject to demonstrate that coverage metrics respond to code changes.
- Outputs before/after metrics to `coverage-reports/proof/`.
- Summarizes the proof in `coverage-summary.md`.

**Usage:**
```sh
bash scripts/prove-coverage-accuracy.sh
```

## Output
- `coverage-reports/`: All raw coverage reports.
- `coverage-summary.md`: Unified, human-readable summary with per-project and overall metrics, and proof of accuracy.
- `coverage-reports/proof/`: Before/after metrics for each project.

## Supported Languages
- JavaScript/TypeScript (Vitest)
- Python (pytest)
- Java (JUnit/Jacoco)
- Go (go test)

## Extending
To add support for more languages or frameworks, edit the scripts and add the appropriate coverage commands and report aggregation steps. 