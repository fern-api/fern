FROM node:18.1.0-alpine
COPY packages/generators/sdk/cli/docker/dist/bundle.js /bundle.js

COPY packages/fetcher/src/ /assets/fetcher
COPY packages/fetcher/src/ /assets/fetcher
COPY packages/zurg/src/ /assets/zurg
RUN find /assets -name __test__ -exec rm -rf {} \+

ENTRYPOINT ["node", "/bundle.js"]
