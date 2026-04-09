FROM node:22-slim

ARG FERN_CLI_PACKAGE=fern-api
ARG FERN_CLI_VERSION

RUN test -n "${FERN_CLI_VERSION}" || (echo "ERROR: FERN_CLI_VERSION build arg is required" && exit 1)

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

RUN npm install -g ${FERN_CLI_PACKAGE}@${FERN_CLI_VERSION} && \
    npm cache clean --force

ENTRYPOINT []
