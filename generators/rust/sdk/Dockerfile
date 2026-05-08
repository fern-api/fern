# Rust stage: provides the full toolchain (cargo, rustc, rustfmt) needed for
# publishing to crates.io and running tests.
# Using the official Rust image handles multi-arch (amd64/arm64) automatically.
# See: https://hub.docker.com/_/rust
FROM rust:1.82-alpine3.20 AS rust
RUN rustup component add rustfmt

FROM node:22.22-alpine3.23

RUN apk update && apk upgrade --no-cache

# Update bundled npm to refresh transitive dependencies (picomatch, brace-expansion,
# ip-address, etc.) that ship inside /usr/local/lib/node_modules/npm and otherwise
# carry known CVEs into the image. We install into a fresh prefix and swap directories
# because in-place self-upgrade of the bundled npm in node:22.22-alpine3.23 fails with
# a stale module-resolution error.
RUN mkdir -p /tmp/npm-upgrade \
    && npm install --prefix /tmp/npm-upgrade npm@11.13.0 \
    && rm -rf /usr/local/lib/node_modules/npm \
    && mv /tmp/npm-upgrade/node_modules/npm /usr/local/lib/node_modules/npm \
    && rm -rf /tmp/npm-upgrade \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx \
    && ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && npm --version

# Patch npm's transitively bundled ip-address to 10.1.1 to address GHSA-v2v4-37r5-5v8g.
# npm 11.13.0 still ships ip-address@10.1.0 via socks > socks-proxy-agent > @npmcli/agent.
RUN mkdir -p /tmp/ip-address-upgrade \
    && cd /tmp/ip-address-upgrade \
    && npm pack ip-address@10.1.1 \
    && tar -xzf ip-address-10.1.1.tgz \
    && rm -rf /usr/local/lib/node_modules/npm/node_modules/ip-address \
    && mv package /usr/local/lib/node_modules/npm/node_modules/ip-address \
    && rm -rf /tmp/ip-address-upgrade

ARG SENTRY_DSN
ARG SENTRY_ENVIRONMENT=production
ARG SENTRY_RELEASE
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ENVIRONMENT=$SENTRY_ENVIRONMENT
ENV SENTRY_RELEASE=$SENTRY_RELEASE

# Install system dependencies
RUN apk --no-cache add bash curl git zip gcc musl-dev openssl-dev pkgconfig

# Copy the full Rust toolchain from the official image
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH
COPY --from=rust /usr/local/rustup /usr/local/rustup
COPY --from=rust /usr/local/cargo /usr/local/cargo
RUN rustfmt --version && cargo --version

RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

COPY generators/rust/sdk/dist /dist
COPY generators/rust/sdk/dist/asIs /asIs
COPY generators/rust/sdk/features.yml /assets/features.yml

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "rust-sdk"]
