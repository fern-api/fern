FROM node:22.12-alpine3.20 AS node

COPY generators/swift/sdk/features.yml /assets/features.yml
COPY generators/swift/sdk/dist /dist

RUN npm install -f -g @fern-api/generator-cli

ENTRYPOINT ["node", "/dist/cli.cjs", "swift-sdk"]
