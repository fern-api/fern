FROM node:24.15-trixie-slim
# Security update 2026-05-18: explicitly upgrade libkrb5-3 and curl to fix
# CVE-2026-40355, CVE-2026-40356 (krb5 gss_accept_sec_context) and
# CVE-2026-1965, CVE-2026-4873, CVE-2026-5545, CVE-2026-6253,
# CVE-2026-6429 (curl)
RUN apt-get update \
    && apt-get -y --no-install-recommends dist-upgrade \
    && apt-get install -y --no-install-recommends ca-certificates curl \
       libkrb5-3 libcurl4 \
    && rm -rf /var/lib/apt/lists/*
RUN curl -LsSf https://astral.sh/ruff/0.15.7/install.sh | sh
ENV PATH="/root/.local/bin:${PATH}"
RUN ruff --version
COPY generators/python-v2/sdk/dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
