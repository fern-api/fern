FROM node:22.12-alpine3.20

COPY generators/rust/sdk/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "rust-sdk"]
