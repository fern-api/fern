#!/bin/bash

source $HOME/.nvm/nvm.sh

# Initialize a flag to track if any command fails
EXIT_STATUS=0

# Run the tests with different Node.js versions and update the flag if any command fails
nvm use 20 && yarn test multipart.upload.test.ts || EXIT_STATUS=$?
nvm use 19 && yarn test multipart.upload.test.ts || EXIT_STATUS=$?
nvm use 18 && yarn test multipart.upload.test.ts || EXIT_STATUS=$?
nvm use 17 && yarn test multipart.upload.test.ts || EXIT_STATUS=$?
nvm use 16 && yarn test multipart.upload.test.ts || EXIT_STATUS=$?

# Exit with the appropriate status
exit $EXIT_STATUS