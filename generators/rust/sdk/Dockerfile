FROM node:22.12-alpine3.20

RUN apk --no-cache add bash curl git zip
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

COPY generators/rust/sdk/dist /dist
COPY generators/rust/sdk/dist/asIs /asIs
COPY generators/rust/sdk/features.yml /assets/features.yml

RUN npm install -f -g @fern-api/generator-cli

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "rust-sdk"]
