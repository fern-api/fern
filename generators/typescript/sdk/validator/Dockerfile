FROM node:22.22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates git \
    && rm -rf /var/lib/apt/lists/*

# Enable corepack so both pnpm and yarn resolve from each project's
# `package.json#packageManager` field at runtime. The validator image
# is intentionally package-manager-agnostic — `.fern/verify.sh` drives
# the install/build/test commands using the SDK's pinned package manager.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# Warm the package cache with common devDependencies emitted into Fern
# generated SDKs. This lets `pnpm install` complete in seconds inside the
# container even without network access to a registry.
ENV PNPM_HOME=/.pnpm
ENV PNPM_STORE_PATH=/.pnpm-cache
ENV YARN_CACHE_FOLDER=/.yarn-cache
ENV PATH=$PNPM_HOME:$PATH

COPY generators/typescript/sdk/validator/warm-cache-package.json /tmp/warm-cache/package.json
RUN cd /tmp/warm-cache \
    && corepack prepare pnpm@10.33.0 --activate \
    && pnpm config set store-dir "$PNPM_STORE_PATH" \
    && pnpm install --ignore-scripts --prefer-offline \
    && rm -rf /tmp/warm-cache/node_modules

WORKDIR /workspace
