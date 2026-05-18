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

FROM node:24.15.0-trixie-slim

ENV PNPM_STORE_PATH=/.pnpm-cache
ENV YARN_CACHE_FOLDER=/.yarn-cache
ENV PNPM_HOME=/.pnpm
ENV PATH=$PNPM_HOME:$PATH

# Apply latest Debian security updates so that grype-tracked OS package
# vulnerabilities (perl-base, liblzma5, libgnutls30, libpam*, libc*, gpgv,
# libsystemd0, libudev1, libcap2, libtasn1-6, login/passwd, etc.) are
# resolved on top of the base image.
# Security update 2026-05-18: trixie's openssl (3.5.5) is vulnerable to
# CVE-2026-28387/28388/28389/28390/31790/2673. Pin sid as a low-priority
# source and pull the fixed package from there.
RUN apt-get update \
  && apt-get -y upgrade \
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
       libssl3t64 \
    && rm -f /etc/apt/sources.list.d/sid.sources /etc/apt/preferences.d/sid-low \
    && rm -rf /var/lib/apt/lists/*

# Upgrade bundled npm to 11.14.1 to pick up patched transitive dependencies
# (picomatch 4.0.4, brace-expansion 5.0.5, minimatch 10.2.5, tar 7.5.13).
# node:24.15.0 ships npm 11.12.1 which still vendors picomatch 4.0.3 and
# brace-expansion 5.0.4. Replace ip-address with 10.1.1 to fix
# GHSA-v2v4-37r5-5v8g (still bundled at 10.1.0 even in npm 11.14.1).
RUN npm install -g npm@11.14.1 --force && \
    cd /usr/local/lib/node_modules/npm/node_modules && \
    npm pack ip-address@10.1.1 && \
    rm -rf ip-address && \
    mkdir ip-address && \
    tar -xzf ip-address-10.1.1.tgz --strip-components=1 -C ip-address/ && \
    rm ip-address-10.1.1.tgz

RUN npm install -g pnpm@10.33.3 --force
RUN corepack prepare pnpm@10.33.3
RUN npm install -g yarn@1.22.22 --force
RUN corepack prepare yarn@1.22.22

RUN pnpm add -g typescript@~5.7.2 \
  prettier@3.7.4 \
  oxfmt@0.48.0 \
  @biomejs/biome@2.4.3 \
  oxlint@1.63.0 \
  oxlint-tsgolint@0.22.1 \
  @types/node@^18.19.70 \
  webpack@^5.97.1 \
  msw@2.11.2 \
  vitest@^3.2.4

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

WORKDIR /

ENTRYPOINT ["tail", "-f", "/dev/null"]
