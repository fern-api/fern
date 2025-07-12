FROM node:20.18-bullseye-slim AS node
FROM rust:1.88.0

RUN apt-get update && apt-get install -y bash curl git zip

RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

# ✅ Copy full Node installation from Node image
COPY --from=node /usr/local /usr/local

ENV PATH="/usr/local/bin:${PATH}"

COPY generators/rust/sdk/features.yml /assets/features.yml
COPY generators/rust/sdk/dist /dist

# ✅ Check Node is working
RUN node -v && npm -v

# ✅ Install global Fern CLI
RUN npm install -f -g @fern-api/generator-cli

ENTRYPOINT ["node", "/dist/cli.cjs"]
