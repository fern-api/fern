# Updated Node.js base from 22.12-slim to 22.22-bookworm-slim to address container CVEs:
# - Node binary CVEs (CVE-2025-23083, CVE-2025-23166, CVE-2025-23085, CVE-2025-23165, CVE-2025-55131,
#   CVE-2025-55132, CVE-2025-59465, CVE-2025-59466, CVE-2026-21637, CVE-2026-21710, CVE-2026-21712,
#   CVE-2026-21713, CVE-2026-21714, CVE-2026-21715, CVE-2026-21716, CVE-2026-21717)
# - Debian package CVEs in perl-base, liblzma5, libgnutls30, libpam*, libc-bin, libc6, libtasn1-6,
#   libsystemd0, libudev1, libcap2, login, passwd, gpgv (all carried by the newer bookworm-slim base)
# Bundled npm globals are removed below so the npm-bundled JS dependencies (cross-spawn, glob,
# minimatch, tar, brace-expansion, ip-address, diff) cannot be flagged or invoked at runtime — this
# image only runs the bundled CLI directly via node.
FROM node:22.22-bookworm-slim
RUN apt-get update \
    && apt-get -y --no-install-recommends dist-upgrade \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*
RUN rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /opt/yarn-*
RUN curl -LsSf https://astral.sh/ruff/0.15.7/install.sh | sh
ENV PATH="/root/.local/bin:/root/.cargo/bin:${PATH}"
RUN ruff --version
COPY generators/python-v2/pydantic-model/dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
