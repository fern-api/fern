FROM node:22.12-alpine3.20

ENV YARN_CACHE_FOLDER=/.yarn

RUN apk --no-cache add git zip
RUN git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

COPY generators/typescript/express/cli/docker/cache_heavy_dependencies.sh /
RUN /cache_heavy_dependencies.sh
RUN rm /cache_heavy_dependencies.sh

COPY generators/typescript/express/cli/docker/dist /

ENTRYPOINT ["node", "--enable-source-maps", "/cli.cjs"]
