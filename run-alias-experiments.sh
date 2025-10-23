#!/bin/bash
set -e

# Run alias test configurations

pnpm seed test --generator python-sdk --fixture alias --skip-scripts
pnpm seed test --generator python-sdk --fixture alias --outputFolder pydantic-v2-wrapped --skip-scripts
pnpm seed test --generator python-sdk --fixture alias --outputFolder pydantic-v1-wrapped --skip-scripts
pnpm seed test --generator pydantic-v2 --fixture alias --skip-scripts
