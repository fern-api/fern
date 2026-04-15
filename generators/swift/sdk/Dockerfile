FROM node:22.12-alpine3.20

RUN apk --no-cache add bash curl git zip
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

ARG GENERATOR_VERSION
ARG GENERATOR_IMAGE
ENV GENERATOR_VERSION=$GENERATOR_VERSION
ENV GENERATOR_IMAGE=$GENERATOR_IMAGE

COPY generators/swift/sdk/features.yml /assets/features.yml
COPY generators/swift/sdk/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "swift-sdk"]
