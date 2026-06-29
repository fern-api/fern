# Stage 1: Rebuild oxlint-tsgolint from source under go1.26.4 so the embedded
# go/stdlib clears vulnerability scanners. The published binaries are still
# compiled with an older upstream Go toolchain.
FROM golang:1.26.4-trixie AS tsgolint-rebuild
ARG TSGOLINT_VERSION=0.22.1
ENV GOTOOLCHAIN=go1.26.4
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

FROM node:24.17.0-trixie-slim

ENV PNPM_STORE_PATH=/.pnpm-cache
ENV YARN_CACHE_FOLDER=/.yarn-cache
ENV PNPM_HOME=/.pnpm
ENV PATH=$PNPM_HOME/bin:$PNPM_HOME:$PATH

# Apply latest Debian security updates so that grype-tracked OS package
# vulnerabilities (perl-base, liblzma5, libgnutls30, libpam*, libc*, gpgv,
# libsystemd0, libudev1, libcap2, libtasn1-6, login/passwd, etc.) are
# resolved on top of the base image.
RUN apt-get update \
  && apt-get -y upgrade \
  && apt-get -y autoremove \
  && rm -rf /var/lib/apt/lists/*

# Update perl-base from sid to pick up security patches.
RUN echo "Types: deb" > /etc/apt/sources.list.d/sid.sources \
    && echo "URIs: http://deb.debian.org/debian" >> /etc/apt/sources.list.d/sid.sources \
    && echo "Suites: sid" >> /etc/apt/sources.list.d/sid.sources \
    && echo "Components: main" >> /etc/apt/sources.list.d/sid.sources \
    && echo "Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg" >> /etc/apt/sources.list.d/sid.sources \
    && echo 'Package: *\nPin: release n=sid\nPin-Priority: 100' > /etc/apt/preferences.d/sid-low \
    && apt-get update \
    && apt-get install -y --no-install-recommends -t sid \
       perl-base perl \
    && rm -f /etc/apt/sources.list.d/sid.sources /etc/apt/preferences.d/sid-low \
    && rm -rf /var/lib/apt/lists/*

# Upgrade bundled npm and patch vendored dependencies (ip-address,
# brace-expansion) to versions that clear vulnerability scanners.
RUN npm install -g npm@11.17.0 --force && \
    cd /usr/local/lib/node_modules/npm/node_modules && \
    npm pack ip-address@10.1.1 && \
    rm -rf ip-address && \
    mkdir ip-address && \
    tar -xzf ip-address-10.1.1.tgz --strip-components=1 -C ip-address/ && \
    rm ip-address-10.1.1.tgz && \
    npm pack undici@6.27.0 && \
    rm -rf undici && \
    mkdir undici && \
    tar -xzf undici-6.27.0.tgz --strip-components=1 -C undici/ && \
    rm undici-6.27.0.tgz && \
    npm pack brace-expansion@5.0.6 && \
    rm -rf brace-expansion && \
    mkdir brace-expansion && \
    tar -xzf brace-expansion-5.0.6.tgz --strip-components=1 -C brace-expansion/ && \
    rm brace-expansion-5.0.6.tgz

# Patch tar to 7.5.16 to fix CVE-2026-53655 / GHSA-vmf3-w455-68vh
# (PAX size override applied to intermediary GNU long-name/long-link headers,
# causing tar parser interpretation differential / file smuggling).
RUN cd /usr/local/lib/node_modules/npm/node_modules && \
    npm pack tar@7.5.16 && \
    rm -rf tar && \
    mkdir tar && \
    tar -xzf tar-7.5.16.tgz --strip-components=1 -C tar/ && \
    rm tar-7.5.16.tgz

# pnpm 11.5.3+ clears CVE-2026-55697, GHSA-fr4h-3cph-29xv, GHSA-qrv3-253h-g69c,
# GHSA-72r4-9c5j-mj57, and bundles tar 7.5.16 (GHSA-vmf3-w455-68vh).
RUN npm install -g pnpm@11.5.3 --force
RUN corepack prepare pnpm@11.5.3
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
  vitest@^4.1.1

# Replace the prebuilt @oxlint-tsgolint/linux-* binary with the locally
# rebuilt one so it embeds the patched Go stdlib.
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
