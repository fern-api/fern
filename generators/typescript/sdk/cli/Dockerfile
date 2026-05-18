# Stage 1: Rebuild oxlint-tsgolint from source under go1.26.3 so the embedded
# go/stdlib clears the go1.26.2 CVEs (CVE-2026-33811, CVE-2026-33814,
# CVE-2026-39820, CVE-2026-39836, CVE-2026-42499). The published
# @oxlint-tsgolint/linux-{x64,arm64} binaries are still compiled with the
# upstream go1.26.2 toolchain.
FROM golang:1.26.3-trixie AS tsgolint-rebuild
ARG TSGOLINT_VERSION=0.22.1
ENV GOTOOLCHAIN=go1.26.3
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
RUN git config --global user.email "build@example.com" && \
    git config --global user.name "Build" && \
    git clone --depth 1 --branch v${TSGOLINT_VERSION} \
        https://github.com/oxc-project/tsgolint.git /src/tsgolint && \
    cd /src/tsgolint && \
    # Equivalent of `just init`: init the typescript-go submodule
    # (NOT recursively — typescript-go's own microsoft/TypeScript
    # sub-submodule is huge and not needed for tsgolint's build),
    # apply patches, copy internal/collections so internal/utils can
    # import it (the file comment explains the duplication).
    git submodule update --init --depth 1 typescript-go && \
    cd typescript-go && \
    git am --3way --no-gpg-sign ../patches/*.patch && \
    cd .. && \
    mkdir -p internal/collections && \
    find ./typescript-go/internal/collections -type f ! -name '*_test.go' -exec cp {} internal/collections/ \; && \
    CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o /out/tsgolint ./cmd/tsgolint && \
    ls -la /out/tsgolint

FROM node:24.15-trixie-slim

# Apply latest Debian security updates so that grype-tracked OS package
# vulnerabilities (glibc, dpkg, nghttp2, libcap2, systemd, libgcrypt20,
# krb5, etc.) are resolved on top of the base image. trixie ships
# patched versions of these packages that are not available on bookworm
# (bookworm publishes the upstream fixes only via the next-stable
# branch), so the base-image choice — not just dist-upgrade — is what
# clears the AWS Inspector findings.
# Security update 2026-05-18: trixie's krb5 (1.21.3-5), curl (8.14.1),
# and gnutls28 (3.8.9) are still vulnerable to CVE-2026-40355,
# CVE-2026-40356 (krb5), CVE-2026-1965/4873/5545/6253/6429 (curl),
# CVE-2026-3832 (gnutls28), and CVE-2026-45186 (expat). Pin sid as a
# low-priority source and pull the fixed packages from there.
RUN apt-get update \
    && apt-get -y --no-install-recommends dist-upgrade \
    && apt-get install -y --no-install-recommends ca-certificates git zip \
    && apt-get -y autoremove \
    && rm -rf /var/lib/apt/lists/*
RUN echo "Types: deb" > /etc/apt/sources.list.d/sid.sources \
    && echo "URIs: http://deb.debian.org/debian" >> /etc/apt/sources.list.d/sid.sources \
    && echo "Suites: sid" >> /etc/apt/sources.list.d/sid.sources \
    && echo "Components: main" >> /etc/apt/sources.list.d/sid.sources \
    && echo "Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg" >> /etc/apt/sources.list.d/sid.sources \
    && echo 'Package: *\nPin: release n=sid\nPin-Priority: 100' > /etc/apt/preferences.d/sid-low \
    && apt-get update \
    && apt-get install -y --no-install-recommends -t sid \
       libkrb5-3 libkrb5support0 libk5crypto3 libgssapi-krb5-2 \
       curl libcurl4t64 libgnutls30t64 \
       libexpat1 \
    && rm -f /etc/apt/sources.list.d/sid.sources /etc/apt/preferences.d/sid-low \
    && rm -rf /var/lib/apt/lists/*
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

ENV PNPM_STORE_PATH=/.pnpm-cache
ENV YARN_CACHE_FOLDER=/.yarn-cache
ENV PNPM_HOME=/.pnpm
ENV PATH=$PNPM_HOME:$PATH
ARG SENTRY_DSN
ARG SENTRY_ENVIRONMENT=production
ARG SENTRY_RELEASE
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ENVIRONMENT=$SENTRY_ENVIRONMENT
ENV SENTRY_RELEASE=$SENTRY_RELEASE

# Upgrade the bundled npm to pick up patched transitive dependencies
# (minimatch, picomatch, tar, brace-expansion). npm at this version still
# vendors ip-address@10.1.0, so swap in the patched 10.1.1 release that
# fixes GHSA-v2v4-37r5-5v8g (XSS in Address6 HTML-emitting methods).
RUN npm install -g npm@11.13.0 --force && \
    cd /usr/local/lib/node_modules/npm/node_modules && \
    npm pack ip-address@10.1.1 && \
    rm -rf ip-address && \
    mkdir ip-address && \
    tar -xzf ip-address-10.1.1.tgz --strip-components=1 -C ip-address/ && \
    rm ip-address-10.1.1.tgz

# pnpm 10.33.3 bundles patched picomatch, brace-expansion, tar, and ip-address.
RUN npm install -g pnpm@10.33.3 --force
RUN npm install -g yarn@1.22.22 --force
RUN pnpm add -g typescript@~5.9.3 \
  prettier@3.8.1 \
  oxfmt@0.48.0 \
  @biomejs/biome@2.4.10 \
  oxlint@1.63.0 \
  oxlint-tsgolint@0.22.1 \
  @types/node@^20.0.0 \
  ts-loader@^9.5.4 \
  webpack@^5.105.4 \
  msw@2.12.14 \
  vitest@^4.1.1

# Replace the prebuilt @oxlint-tsgolint/linux-* binary with the locally
# rebuilt one (go1.26.3). pnpm installs the platform-specific binary at
# {pnpm-global-store}/.pnpm/@oxlint-tsgolint+linux-{arch}@.../node_modules/@oxlint-tsgolint/linux-{arch}/tsgolint.
COPY --from=tsgolint-rebuild /out/tsgolint /tmp/tsgolint-rebuilt
RUN chmod +x /tmp/tsgolint-rebuilt && \
    set -eux; \
    found=0; \
    for f in $(find / -type f -name tsgolint -path '*@oxlint-tsgolint*' 2>/dev/null); do \
        cp /tmp/tsgolint-rebuilt "$f"; \
        chmod +x "$f"; \
        found=1; \
        echo "Replaced tsgolint binary at $f"; \
    done; \
    if [ "$found" = "0" ]; then \
        echo "::error::Could not find any tsgolint binary to replace"; \
        exit 1; \
    fi; \
    rm /tmp/tsgolint-rebuilt

COPY generators/typescript/sdk/cli/dist/ /

ENTRYPOINT ["node", "--enable-source-maps", "/cli.cjs"]
