# Rust stage: provides rustfmt for code formatting.
# Using the official Rust image handles multi-arch (amd64/arm64) automatically.
# See: https://hub.docker.com/_/rust
FROM rust:1.82-alpine3.20 AS rust
RUN rustup component add rustfmt \
    && cp "$(rustup which rustfmt)" /usr/local/bin/rustfmt-bin

FROM node:22.12-alpine3.20

COPY --from=rust /usr/local/bin/rustfmt-bin /usr/local/bin/rustfmt
RUN rustfmt --version

COPY generators/rust/model/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "rust-model"]
