FROM node:22.12-alpine3.20

# Install system dependencies and Rust toolchain
RUN apk --no-cache add bash curl git zip gcc musl-dev openssl-dev pkgconfig
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain 1.82.0 --profile minimal --component rustfmt
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustfmt --version  # Verify rustfmt is available

RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

COPY generators/rust/sdk/dist /dist
COPY generators/rust/sdk/dist/asIs /asIs
COPY generators/rust/sdk/features.yml /assets/features.yml

RUN npm install -f -g @fern-api/generator-cli@0.2.0

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "rust-sdk"]
