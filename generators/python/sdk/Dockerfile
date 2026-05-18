# Stage 1: Copy Node.js from official image
FROM node:24.15-trixie-slim AS node

# Stage 2: Base Python image with dependencies
FROM python:3.13.7-slim AS python-base

# Copy Node.js and npm from the node stage
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Security update 2026-05-18: trixie's krb5 (1.21.3-5), curl (8.14.1),
# and gnutls28 (3.8.9) are still vulnerable to CVE-2026-40355,
# CVE-2026-40356 (krb5 gss_accept_sec_context integer underflow & NULL
# deref), CVE-2026-1965, CVE-2026-4873, CVE-2026-5545, CVE-2026-6253,
# CVE-2026-6429 (curl), and CVE-2026-3832 (gnutls28). Pin sid as a
# low-priority source and pull the fixed packages from there.
RUN apt-get update \
    && apt-get -y --no-install-recommends dist-upgrade \
    && apt-get install -y --no-install-recommends ca-certificates curl git \
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
    && rm -f /etc/apt/sources.list.d/sid.sources /etc/apt/preferences.d/sid-low \
    && rm -rf /var/lib/apt/lists/*
RUN node --version
RUN npm --version

# Patch npm's bundled picomatch@4.0.3 -> 4.0.4 (GHSA-c2c7-rcm5-vvqj,
# GHSA-3v7f-55p6-f55p) and brace-expansion@5.0.4 -> 5.0.5
# (GHSA-f886-m6hf-6m8v) copied from the node stage.
RUN for dir in \
      /usr/local/lib/node_modules/npm/node_modules/picomatch \
      /usr/local/lib/node_modules/npm/node_modules/tinyglobby/node_modules/picomatch; do \
      if [ -d "$dir" ]; then \
        rm -rf "$dir" && \
        cd "$(dirname "$dir")" && \
        curl -sL https://registry.npmjs.org/picomatch/-/picomatch-4.0.4.tgz -o picomatch-4.0.4.tgz && \
        tar -xzf picomatch-4.0.4.tgz && \
        mv package picomatch && \
        rm picomatch-4.0.4.tgz; \
      fi; \
    done && \
    for dir in \
      /usr/local/lib/node_modules/npm/node_modules/brace-expansion; do \
      if [ -d "$dir" ]; then \
        rm -rf "$dir" && \
        cd "$(dirname "$dir")" && \
        curl -sL https://registry.npmjs.org/brace-expansion/-/brace-expansion-5.0.5.tgz -o brace-expansion-5.0.5.tgz && \
        tar -xzf brace-expansion-5.0.5.tgz && \
        mv package brace-expansion && \
        rm brace-expansion-5.0.5.tgz; \
      fi; \
    done

# Patch ip-address to 10.2.0 to fix CVE-2026-42338 / GHSA-v2v4-37r5-5v8g
# (XSS in Address6 HTML-emitting methods). npm bundles ip-address via socks.
RUN for dir in \
      /usr/local/lib/node_modules/npm/node_modules/ip-address; do \
      if [ -d "$dir" ]; then \
        rm -rf "$dir" && \
        cd "$(dirname "$dir")" && \
        curl -sL https://registry.npmjs.org/ip-address/-/ip-address-10.2.0.tgz -o ip-address-10.2.0.tgz && \
        tar -xzf ip-address-10.2.0.tgz && \
        mv package ip-address && \
        rm ip-address-10.2.0.tgz; \
      fi; \
    done

# Install ruff.
RUN pip install ruff==0.15.7
RUN ruff --version

# Set Python environment
ENV PYTHONPATH=${PYTHONPATH}:${PWD}
ENV _TYPER_STANDARD_TRACEBACK=1

# Upgrade pip to 26.1+ to address CVE-2025-8869, CVE-2026-3219, CVE-2026-6357,
# and CVE-2026-1703 (self-update flaw running after wheel install).
RUN pip3 install --upgrade pip==26.1
# Keep in sync with the poetry-core version in pyproject.toml.
RUN pip3 install poetry==2.4.1
RUN poetry config virtualenvs.create false

# Copy dependency files first to leverage caching
COPY ./generators/python/pyproject.toml ./pyproject.toml
COPY ./generators/python/poetry.lock ./poetry.lock
COPY ./generators/python/src/__init__.py ./src/__init__.py
COPY ./generators/python/src/fern_python/__init__.py ./src/fern_python/__init__.py

RUN poetry install

# Copy Node CLI and make it executable
COPY ./generators/python-v2/sdk/dist/cli.cjs /bin/python-v2
RUN chmod +x /bin/python-v2

# Copy specific assets and source code
COPY ./generators/python/core_utilities/sdk /assets/core_utilities
COPY ./generators/python/core_utilities/shared /assets/core_utilities
COPY ./generators/python/sdk/features.yml /assets/features.yml
COPY ./generators/python/tests /assets/tests
COPY ./generators/python/src ./src

RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

ENTRYPOINT ["python", "-m", "src.fern_python.generators.sdk.cli"]
