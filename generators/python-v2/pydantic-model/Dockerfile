# Updated Node.js base from 22.22.2-bookworm-slim to 22.22.2-alpine3.22 to address container CVEs
# flagged by the 2026-05-07 AWS Inspector / grype scan of dev/pydantic-model-v2-generator:
# - openssl 3.5.5 (Critical, 7 CVEs); Alpine 3.22 ships a patched libssl3/libcrypto3 build, pulled
#   in via `apk --no-cache upgrade`.
# - Debian Bookworm package CVEs in glibc, dpkg, nghttp2, libcap2, systemd, libgcrypt20, krb5
#   (eliminated by switching from Debian to Alpine; these packages are absent or replaced by
#   musl/apk equivalents).
# Bundled npm globals are removed below so the npm-bundled JS dependencies (cross-spawn, glob,
# minimatch, tar, brace-expansion, ip-address, diff) cannot be flagged or invoked at runtime — this
# image only runs the bundled CLI directly via node.
FROM node:22.22.2-alpine3.22
RUN apk --no-cache upgrade \
    && apk add --no-cache ca-certificates curl
RUN rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /opt/yarn-*
RUN curl -LsSf https://astral.sh/ruff/0.15.7/install.sh | sh
ENV PATH="/root/.local/bin:/root/.cargo/bin:${PATH}"
RUN ruff --version
COPY generators/python-v2/pydantic-model/dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
