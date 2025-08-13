FROM node:22.12-alpine3.20

COPY generators/rust/sdk/dist /dist
COPY generators/rust/sdk/dist/asIs /asIs
COPY generators/rust/sdk/features.yml /assets/features.yml

RUN npm install -f -g @fern-api/generator-cli

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "rust-sdk"]
