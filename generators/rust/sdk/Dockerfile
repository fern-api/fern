FROM node:22.12-alpine3.20

COPY generators/rust/sdk/dist /dist

RUN npm install -f -g @fern-api/generator-cli

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "swift-sdk"]
