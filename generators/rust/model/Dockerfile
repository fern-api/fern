# Rust stage: provides rustfmt for code formatting.
# Using the official Rust image handles multi-arch (amd64/arm64) automatically.
# See: https://hub.docker.com/_/rust
FROM rust:1.78-alpine3.20 AS rust
RUN rustup component add rustfmt

FROM node:22.12-alpine3.20

ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH
COPY --from=rust /usr/local/rustup /usr/local/rustup
COPY --from=rust /usr/local/cargo /usr/local/cargo
RUN rustfmt --version

COPY generators/rust/model/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "rust-model"]
