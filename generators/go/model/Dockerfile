FROM node:20.18-alpine3.20 AS node
FROM golang:1.23.8-alpine3.20

ENV YARN_CACHE_FOLDER=/.yarn

RUN apk --no-cache add bash curl git zip nodejs npm
RUN git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

COPY generators/go-v2/model/dist /dist

ENTRYPOINT ["node", "/dist/cli.cjs"]