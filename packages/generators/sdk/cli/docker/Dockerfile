FROM node:18.1.0-alpine

COPY packages/generators/sdk/cli/docker/cache_heavy_dependencies.sh /

COPY packages/core-utilities/fetcher/src/ /assets/fetcher
COPY packages/core-utilities/auth/src/ /assets/auth
COPY packages/core-utilities/zurg/src/ /assets/zurg

COPY packages/generators/sdk/cli/docker/dist/bundle.js /bundle.js

RUN find /assets -name __test__ -exec rm -rf {} \+
RUN /cache_heavy_dependencies.sh

ENTRYPOINT ["node", "/bundle.js"]
