FROM node:18.1.0-alpine

COPY packages/core-utilities/zurg/src/ /assets/zurg
COPY packages/core-utilities/base/src/ /assets/base-core-utilities
RUN find /assets -name __test__ -exec rm -rf {} \+

COPY packages/generators/express/cli/docker/dist/bundle.js /bundle.js

ENTRYPOINT ["node", "/bundle.js"]
