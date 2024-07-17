#!/bin/bash

source $HOME/.nvm/nvm.sh

# Initialize a flag to track if any command fails
EXIT_STATUS=0
TEST=generators/typescript/utils/core-utilities/fetcher/src/form-data-utils/__test__/

cd $TEST

# Run the tests with different Node.js versions and update the flag if any command fails
nvm install 20 && nvm use 20 && yarn test || EXIT_STATUS=$?
nvm install 19 && nvm use 19 && yarn test || EXIT_STATUS=$?
nvm install 18 && nvm use 18 && yarn test || EXIT_STATUS=$?
nvm install 17 && nvm use 17 && yarn test || EXIT_STATUS=$?
nvm install 16 && nvm use 16 && yarn test || EXIT_STATUS=$?

# Exit with the appropriate status
exit $EXIT_STATUS