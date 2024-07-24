FROM node:18.1.0-alpine

RUN apk --no-cache add git zip \
  && git config --global user.name "fern" \
  && git config --global user.email "hey@buildwithfern.com"

ENV YARN_CACHE_FOLDER=/.yarn

COPY generators/typescript/express/cli/docker/cache_heavy_dependencies.sh /
RUN /cache_heavy_dependencies.sh && rm /cache_heavy_dependencies.sh

COPY generators/typescript/utils/core-utilities/zurg/src/ /assets/zurg
COPY generators/typescript/utils/core-utilities/base/src/ /assets/base-core-utilities

COPY generators/typescript/express/cli/docker/dist/cli.cjs /cli.cjs

ENTRYPOINT ["node", "/cli.cjs"]
