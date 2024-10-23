FROM node:18.1.0-alpine

RUN apk --no-cache add git zip \
  && git config --global user.name "fern" \
  && git config --global user.email "hey@buildwithfern.com"

ENV YARN_CACHE_FOLDER=/.yarn

COPY generators/typescript/sdk/cli/browser-docker/cache_heavy_dependencies.sh /
RUN /cache_heavy_dependencies.sh && rm /cache_heavy_dependencies.sh

COPY generators/typescript/utils/core-utilities/fetcher/src/ /assets/fetcher
COPY generators/typescript/utils/core-utilities/callback-queue/src/ /assets/callback-queue
COPY generators/typescript/utils/core-utilities/auth/src/ /assets/auth
COPY generators/typescript/utils/core-utilities/zurg/src/ /assets/zurg
COPY generators/typescript/utils/core-utilities/base/src/ /assets/base-core-utilities
COPY generators/typescript/utils/core-utilities/utils/src/ /assets/utils

COPY generators/typescript/sdk/cli/browser-docker/dist/browserCli.cjs /browserCli.cjs

ENTRYPOINT ["node", "/browserCli.cjs"]
