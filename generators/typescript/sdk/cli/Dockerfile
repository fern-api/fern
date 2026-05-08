FROM node:24.14-slim

RUN apt-get update \
    && apt-get -y --no-install-recommends dist-upgrade \
    && apt-get install -y --no-install-recommends ca-certificates git zip \
    && rm -rf /var/lib/apt/lists/*
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

ENV PNPM_STORE_PATH=/.pnpm-cache
ENV YARN_CACHE_FOLDER=/.yarn-cache
ENV PNPM_HOME=/.pnpm
ENV PATH=$PNPM_HOME:$PATH
ARG SENTRY_DSN
ARG SENTRY_ENVIRONMENT=production
ARG SENTRY_RELEASE
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ENVIRONMENT=$SENTRY_ENVIRONMENT
ENV SENTRY_RELEASE=$SENTRY_RELEASE

# Upgrade the bundled npm to pick up patched transitive dependencies
# (minimatch, picomatch, tar, brace-expansion). npm at this version still
# vendors ip-address@10.1.0, so swap in the patched 10.1.1 release that
# fixes GHSA-v2v4-37r5-5v8g (XSS in Address6 HTML-emitting methods).
RUN npm install -g npm@11.13.0 --force && \
    cd /usr/local/lib/node_modules/npm/node_modules && \
    npm pack ip-address@10.1.1 && \
    rm -rf ip-address && \
    mkdir ip-address && \
    tar -xzf ip-address-10.1.1.tgz --strip-components=1 -C ip-address/ && \
    rm ip-address-10.1.1.tgz

# pnpm 10.33.3 bundles patched picomatch, brace-expansion, tar, and ip-address.
RUN npm install -g pnpm@10.33.3 --force
RUN npm install -g yarn@1.22.22 --force
RUN pnpm add -g typescript@~5.9.3 \
  prettier@3.8.1 \
  oxfmt@0.48.0 \
  @biomejs/biome@2.4.10 \
  oxlint@1.63.0 \
  oxlint-tsgolint@0.22.1 \
  @types/node@^20.0.0 \
  ts-loader@^9.5.4 \
  webpack@^5.105.4 \
  msw@2.12.14 \
  vitest@^4.1.1

COPY generators/typescript/sdk/cli/dist/ /

ENTRYPOINT ["node", "--enable-source-maps", "/cli.cjs"]
