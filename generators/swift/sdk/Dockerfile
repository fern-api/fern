FROM node:22.12-alpine3.20 AS node

RUN apk --no-cache add bash curl git zip
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

COPY generators/swift/sdk/features.yml /assets/features.yml
COPY generators/swift/sdk/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "swift-sdk"]
