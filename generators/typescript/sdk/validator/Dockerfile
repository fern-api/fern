FROM node:24.16-trixie-slim

# Apply latest Debian security updates so that grype-tracked OS package
# vulnerabilities (glibc, dpkg, nghttp2, libcap2, systemd, libgcrypt20,
# krb5, etc.) are resolved on top of the base image. trixie ships
# patched versions of these packages that are not available on bookworm
# (bookworm publishes the upstream fixes only via the next-stable
# branch), so the base-image choice — not just dist-upgrade — is what
# clears the AWS Inspector findings.
RUN apt-get update \
    && apt-get -y --no-install-recommends dist-upgrade \
    && apt-get install -y --no-install-recommends ca-certificates git \
    && apt-get -y autoremove \
    && rm -rf /var/lib/apt/lists/*
# Security update 2026-06-10: pull libssl3t64 from sid for openssl
# 3.5.6 → 3.6.2 (12 CVEs including CVE-2026-45447, High severity).
RUN echo "Types: deb" > /etc/apt/sources.list.d/sid.sources \
    && echo "URIs: http://deb.debian.org/debian" >> /etc/apt/sources.list.d/sid.sources \
    && echo "Suites: sid" >> /etc/apt/sources.list.d/sid.sources \
    && echo "Components: main" >> /etc/apt/sources.list.d/sid.sources \
    && echo "Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg" >> /etc/apt/sources.list.d/sid.sources \
    && echo 'Package: *\nPin: release n=sid\nPin-Priority: 100' > /etc/apt/preferences.d/sid-low \
    && apt-get update \
    && apt-get install -y --no-install-recommends -t sid libssl3t64 \
    && rm -f /etc/apt/sources.list.d/sid.sources /etc/apt/preferences.d/sid-low \
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

# Patch brace-expansion to 5.0.6 (GHSA-jxxr-4gwj-5jf2; node:24.16 vendors 5.0.5).
RUN cd /usr/local/lib/node_modules/npm/node_modules && \
    npm pack brace-expansion@5.0.6 && \
    rm -rf brace-expansion && \
    mkdir brace-expansion && \
    tar -xzf brace-expansion-5.0.6.tgz --strip-components=1 -C brace-expansion/ && \
    rm brace-expansion-5.0.6.tgz

WORKDIR /workspace
