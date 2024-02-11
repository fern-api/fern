FROM node:18.1.0-alpine

RUN apk --no-cache add git zip && git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

ENV YARN_CACHE_FOLDER=/.yarn

COPY packages/generators/sdk/cli/node-docker/cache_heavy_dependencies.sh /
RUN /cache_heavy_dependencies.sh && rm /cache_heavy_dependencies.sh

COPY packages/core-utilities/fetcher/src/ /assets/fetcher
COPY packages/core-utilities/stream-utils/src/ /assets/stream-utils
COPY packages/core-utilities/form-data-utils/src/ /assets/form-data-utils
COPY packages/core-utilities/callback-queue/src/ /assets/callback-queue
COPY packages/core-utilities/auth/src/ /assets/auth
COPY packages/core-utilities/zurg/src/ /assets/zurg
COPY packages/core-utilities/base/src/ /assets/base-core-utilities
RUN find /assets -name __test__ -exec rm -rf {} \+

COPY packages/generators/sdk/cli/node-docker/dist/bundle.js /bundle.js

ENTRYPOINT ["node", "/bundle.js"]
