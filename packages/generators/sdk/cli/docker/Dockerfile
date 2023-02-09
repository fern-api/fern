FROM node:18.1.0-alpine

ENV YARN_ENABLE_GLOBAL_CACHE=true

COPY packages/generators/sdk/cli/docker/cache_heavy_dependencies.sh /
RUN /cache_heavy_dependencies.sh && rm /cache_heavy_dependencies.sh

COPY packages/core-utilities/fetcher/src/ /assets/fetcher
COPY packages/core-utilities/auth/src/ /assets/auth
COPY packages/core-utilities/zurg/src/ /assets/zurg
COPY packages/core-utilities/base/src/ /assets/base-core-utilities
RUN find /assets -name __test__ -exec rm -rf {} \+

COPY packages/generators/sdk/cli/docker/dist/bundle.js /bundle.js

ENTRYPOINT ["node", "/bundle.js"]
