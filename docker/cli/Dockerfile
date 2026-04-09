FROM node:lts-slim

ARG FERN_PACKAGE=fern-api
ARG FERN_VERSION=latest

RUN npm install -g ${FERN_PACKAGE}@${FERN_VERSION}

WORKDIR /app

ENTRYPOINT ["sh", "-c"]
