FROM node:18.1.0-alpine

RUN apk --no-cache add git zip && git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

ENV YARN_CACHE_FOLDER=/.yarn

COPY generators/typescript/sdk/cli/node-docker/cache_heavy_dependencies.sh /
RUN /cache_heavy_dependencies.sh && rm /cache_heavy_dependencies.sh

COPY generators/typescript/utils/core-utilities/fetcher/src/ /assets/fetcher
COPY generators/typescript/utils/core-utilities/stream-utils/src/ /assets/stream-utils
COPY generators/typescript/utils/core-utilities/form-data-utils/src/ /assets/form-data-utils
COPY generators/typescript/utils/core-utilities/callback-queue/src/ /assets/callback-queue
COPY generators/typescript/utils/core-utilities/auth/src/ /assets/auth
COPY generators/typescript/utils/core-utilities/zurg/src/ /assets/zurg
COPY generators/typescript/utils/core-utilities/base/src/ /assets/base-core-utilities
COPY generators/typescript/utils/core-utilities/runtime/src/ /assets/runtime
RUN find /assets -name __test__ -exec rm -rf {} \+

COPY generators/typescript/sdk/cli/node-docker/dist/bundle.js /bundle.js

ENTRYPOINT ["node", "/bundle.js"]
