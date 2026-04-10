# Rust stage: extract just rustfmt and its shared library (~247MB vs ~667MB full toolchain).
# Using the official Rust image handles multi-arch (amd64/arm64) automatically.
# See: https://hub.docker.com/_/rust
FROM rust:1.82-alpine3.20 AS rust
RUN rustup component add rustfmt \
    && RUSTFMT="$(rustup which rustfmt)" \
    && mkdir -p /rustfmt/lib \
    && cp "$RUSTFMT" /rustfmt/rustfmt \
    && cp "$(dirname "$RUSTFMT")/../lib"/librustc_driver-*.so /rustfmt/lib/

FROM node:22.12-alpine3.20

COPY --from=rust /rustfmt /usr/local/lib/rustfmt
ENV PATH=/usr/local/lib/rustfmt:$PATH \
    LD_LIBRARY_PATH=/usr/local/lib/rustfmt/lib
RUN rustfmt --version

COPY generators/rust/model/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "rust-model"]
