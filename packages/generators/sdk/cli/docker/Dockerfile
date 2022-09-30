FROM node:18.1.0-alpine
COPY packages/generators/sdk/cli/docker/dist/bundle.js /bundle.js

COPY packages/core-utilities/fetcher/src/ /assets/fetcher
COPY packages/core-utilities/auth/src/ /assets/auth
COPY packages/core-utilities/zurg/src/ /assets/zurg
RUN find /assets -name __test__ -exec rm -rf {} \+

ENTRYPOINT ["node", "/bundle.js"]
