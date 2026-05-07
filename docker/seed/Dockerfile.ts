FROM node:24.15.0-trixie-slim

ENV PNPM_STORE_PATH=/.pnpm-cache
ENV YARN_CACHE_FOLDER=/.yarn-cache
ENV PNPM_HOME=/.pnpm
ENV PATH=$PNPM_HOME:$PATH

# Apply latest Debian security updates so that grype-tracked OS package
# vulnerabilities (openssl/libssl3, perl-base, liblzma5, libgnutls30,
# libpam*, libc*, gpgv, libsystemd0, libudev1, libcap2, libtasn1-6,
# login/passwd, etc.) are resolved on top of the base image. Explicitly
# upgrade openssl to ensure the libssl3/libcrypto3 CVE fixes (CVE-2026-2673,
# CVE-2026-28387, CVE-2026-28388, CVE-2026-28389, CVE-2026-28390,
# CVE-2026-31789, CVE-2026-31790) are picked up when Debian publishes them.
RUN apt-get update \
  && apt-get -y upgrade \
  && apt-get -y install --only-upgrade openssl libssl3 \
  && apt-get -y autoremove \
  && rm -rf /var/lib/apt/lists/*

# Upgrade the bundled npm so its vendored transitive dependencies pick up
# the patched picomatch (CVE-2026-33671), ip-address (GHSA-v2v4-37r5-5v8g),
# and brace-expansion (CVE-2026-33750) versions, which are the same
# vulnerabilities pnpm.overrides remediates for the global package tree below.
RUN npm install -g npm@latest --force

RUN npm install -g pnpm@10.33.3 --force
RUN corepack prepare pnpm@10.33.3
RUN npm install -g yarn@1.22.22 --force
RUN corepack prepare yarn@1.22.22

# Pre-seed the global pnpm package.json with overrides so that `pnpm add -g`
# resolves transitive npm dependencies flagged by grype to their patched
# versions: picomatch >=4.0.4 (CVE-2026-33671 ReDoS, GHSA-3v7f-55p6-f55p),
# brace-expansion >=5.0.5 (CVE-2026-33750 zero-step DoS), and
# ip-address >=10.1.1 (GHSA-v2v4-37r5-5v8g XSS).
RUN mkdir -p $PNPM_HOME/global/5 \
  && printf '%s\n' \
    '{' \
    '  "name": "@pnpm/global",' \
    '  "version": "1.0.0",' \
    '  "private": true,' \
    '  "pnpm": {' \
    '    "overrides": {' \
    '      "picomatch": "^4.0.4",' \
    '      "brace-expansion": "^5.0.5",' \
    '      "ip-address": "^10.1.1"' \
    '    }' \
    '  }' \
    '}' \
    > $PNPM_HOME/global/5/package.json

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

WORKDIR /

ENTRYPOINT ["tail", "-f", "/dev/null"]
