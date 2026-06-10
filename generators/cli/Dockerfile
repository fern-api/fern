FROM node:24.16-trixie-slim
RUN apt-get update \
    && apt-get -y --no-install-recommends dist-upgrade \
    && apt-get -y --no-install-recommends install rustfmt \
    && apt-get -y autoremove \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
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
COPY dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
