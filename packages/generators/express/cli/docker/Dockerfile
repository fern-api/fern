FROM node:18.1.0-alpine

COPY packages/generators/express/cli/docker/cache_heavy_dependencies.sh /
RUN /cache_heavy_dependencies.sh && rm /cache_heavy_dependencies.sh

COPY packages/core-utilities/zurg/src/ /assets/zurg
COPY packages/core-utilities/base/src/ /assets/base-core-utilities
RUN find /assets -name __test__ -exec rm -rf {} \+

COPY packages/generators/express/cli/docker/dist/bundle.js /bundle.js

ENTRYPOINT ["node", "/bundle.js"]
