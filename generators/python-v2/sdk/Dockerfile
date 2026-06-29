FROM node:24.17-trixie-slim
# Security update 2026-05-18: trixie's krb5 (1.21.3-5), curl (8.14.1),
# and gnutls28 (3.8.9) are still vulnerable to CVE-2026-40355,
# CVE-2026-40356 (krb5), CVE-2026-1965/4873/5545/6253/6429 (curl),
# CVE-2026-3832 (gnutls28). Pin sid as a
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
       libssh2-1t64 libtasn1-6 \
       perl-base perl \
    && rm -f /etc/apt/sources.list.d/sid.sources /etc/apt/preferences.d/sid-low \
    && rm -rf /var/lib/apt/lists/*
# Patch brace-expansion to 5.0.6 (GHSA-jxxr-4gwj-5jf2; node:24.17 vendors 5.0.5).
RUN cd /usr/local/lib/node_modules/npm/node_modules && \
    npm pack brace-expansion@5.0.6 && \
    rm -rf brace-expansion && \
    mkdir brace-expansion && \
    tar -xzf brace-expansion-5.0.6.tgz --strip-components=1 -C brace-expansion/ && \
    rm brace-expansion-5.0.6.tgz

# Patch undici to 6.27.0 to fix CVE-2026-12151.
RUN cd /usr/local/lib/node_modules/npm/node_modules && \
    npm pack undici@6.27.0 && \
    rm -rf undici && \
    mkdir undici && \
    tar -xzf undici-6.27.0.tgz --strip-components=1 -C undici/ && \
    rm undici-6.27.0.tgz

# Patch tar to 7.5.16 to fix CVE-2026-53655 / GHSA-vmf3-w455-68vh
# (PAX size override applied to intermediary GNU long-name/long-link headers,
# causing tar parser interpretation differential / file smuggling).
RUN cd /usr/local/lib/node_modules/npm/node_modules && \
    npm pack tar@7.5.16 && \
    rm -rf tar && \
    mkdir tar && \
    tar -xzf tar-7.5.16.tgz --strip-components=1 -C tar/ && \
    rm tar-7.5.16.tgz

RUN curl -LsSf https://astral.sh/ruff/0.15.7/install.sh | sh
ENV PATH="/root/.local/bin:${PATH}"
RUN ruff --version
COPY generators/python-v2/sdk/dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
