FROM node:22.12-alpine3.20

# Install system dependencies and Rust toolchain.
# Rust installation follows the pattern from the official Rust Docker images:
# https://github.com/rust-lang/docker-rust/blob/master/stable/alpine3.21/Dockerfile
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH

RUN set -eux; \
    apk --no-cache add bash curl git zip gcc musl-dev openssl-dev pkgconfig wget; \
    url="https://static.rust-lang.org/rustup/archive/1.29.0/x86_64-unknown-linux-musl/rustup-init"; \
    wget "$url"; \
    echo "9cd3fda5fd293890e36ab271af6a786ee22084b5f6c2b83fd8323cec6f0992c1 *rustup-init" | sha256sum -c -; \
    chmod +x rustup-init; \
    ./rustup-init -y --no-modify-path --profile minimal --default-toolchain 1.82.0 --component rustfmt; \
    rm rustup-init; \
    rustfmt --version

RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

COPY generators/rust/sdk/dist /dist
COPY generators/rust/sdk/dist/asIs /asIs
COPY generators/rust/sdk/features.yml /assets/features.yml

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "rust-sdk"]
