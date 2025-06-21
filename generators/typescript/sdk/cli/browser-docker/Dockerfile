FROM node:20.18-alpine3.20

RUN apk --no-cache add git zip
RUN git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

ENV YARN_CACHE_FOLDER=/.yarn

COPY generators/typescript/sdk/cli/browser-docker/cache_heavy_dependencies.sh /
RUN /cache_heavy_dependencies.sh
RUN rm /cache_heavy_dependencies.sh

COPY generators/typescript/asIs/ /assets/asIs
COPY generators/typescript/utils/core-utilities/ /assets/core-utilities
COPY generators/typescript/sdk/cli/browser-docker/dist/browserCli.cjs /browserCli.cjs

RUN npm install -f -g @fern-api/generator-cli

ENTRYPOINT ["node", "/browserCli.cjs"]
