FROM node:20.18-alpine3.20 AS node

COPY generators/rust/sdk/dist /dist

RUN npm install -f -g @fern-api/generator-cli

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "swift-sdk"]
