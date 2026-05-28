# Rust stage: extract just rustfmt and its shared library (~247MB vs ~667MB full toolchain).
# Using the official Rust image handles multi-arch (amd64/arm64) automatically.
# See: https://hub.docker.com/_/rust
FROM rust:1.91-alpine3.23 AS rust
RUN rustup component add rustfmt \
    && RUSTFMT="$(rustup which rustfmt)" \
    && mkdir -p /rustfmt/lib \
    && cp "$RUSTFMT" /rustfmt/rustfmt \
    && cp "$(dirname "$RUSTFMT")/../lib"/librustc_driver-*.so /rustfmt/lib/

FROM node:24.16-alpine3.23

RUN apk update && apk upgrade --no-cache

ARG SENTRY_DSN
ARG SENTRY_ENVIRONMENT=production
ARG SENTRY_RELEASE
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ENVIRONMENT=$SENTRY_ENVIRONMENT
ENV SENTRY_RELEASE=$SENTRY_RELEASE

COPY --from=rust /rustfmt /usr/local/lib/rustfmt
ENV PATH=/usr/local/lib/rustfmt:$PATH \
    LD_LIBRARY_PATH=/usr/local/lib/rustfmt/lib
RUN rustfmt --version

# Patch brace-expansion to 5.0.6 (GHSA-jxxr-4gwj-5jf2; node:24.16 vendors 5.0.5).
RUN cd /usr/local/lib/node_modules/npm/node_modules && \
    npm pack brace-expansion@5.0.6 && \
    rm -rf brace-expansion && \
    mkdir brace-expansion && \
    tar -xzf brace-expansion-5.0.6.tgz --strip-components=1 -C brace-expansion/ && \
    rm brace-expansion-5.0.6.tgz

COPY generators/rust/model/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "rust-model"]
