# Bundled npm globals are removed below so npm's JS dependencies cannot be
# flagged or invoked at runtime — this image only runs the bundled CLI via node.
FROM node:24.15-trixie-slim
# Security update 2026-05-18: trixie's krb5 (1.21.3-5), curl (8.14.1),
# and gnutls28 (3.8.9) are still vulnerable to CVE-2026-40355,
# CVE-2026-40356 (krb5), CVE-2026-1965/4873/5545/6253/6429 (curl),
# CVE-2026-3832 (gnutls28), and
# CVE-2026-28387/28388/28389/28390/31790/2673 (openssl). Pin sid as a
# low-priority source and pull the fixed packages from there.
RUN apt-get update \
    && apt-get -y --no-install-recommends dist-upgrade \
    && apt-get install -y --no-install-recommends ca-certificates curl \
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
       libssl3t64 \
    && rm -f /etc/apt/sources.list.d/sid.sources /etc/apt/preferences.d/sid-low \
    && rm -rf /var/lib/apt/lists/*
RUN rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /opt/yarn-*
RUN curl -LsSf https://astral.sh/ruff/0.15.7/install.sh | sh
ENV PATH="/root/.local/bin:/root/.cargo/bin:${PATH}"
RUN ruff --version
COPY generators/python-v2/pydantic-model/dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
