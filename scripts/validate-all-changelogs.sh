#!/bin/bash

# Validates the CLI changelog.
# Usage: ./validate-all-changelogs.sh

set -euo pipefail

pnpm seed validate cli --log-level debug
echo "All changelogs passed validation!"
