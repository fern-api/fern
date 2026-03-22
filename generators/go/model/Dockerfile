FROM node:22.12-alpine3.20 AS node
FROM golang:1.23.8-alpine3.20

ENV YARN_CACHE_FOLDER=/.yarn

RUN apk --no-cache add bash curl git zip nodejs npm
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

COPY generators/go-v2/model/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
