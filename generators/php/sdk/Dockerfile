FROM node:24.15-alpine3.23 AS node
FROM composer:2.9.7

ENV YARN_CACHE_FOLDER=/.yarn
ARG SENTRY_DSN
ARG SENTRY_ENVIRONMENT=production
ARG SENTRY_RELEASE
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ENVIRONMENT=$SENTRY_ENVIRONMENT
ENV SENTRY_RELEASE=$SENTRY_RELEASE

RUN apk update && apk upgrade --no-cache --available
RUN apk --no-cache add bash curl git zip
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

# Copy over node contents to be able to run the compiled CLI
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Patch npm's bundled picomatch@4.0.3 -> 4.0.4 (GHSA-c2c7-rcm5-vvqj,
# GHSA-3v7f-55p6-f55p) and brace-expansion@5.0.4 -> 5.0.5
# (GHSA-f886-m6hf-6m8v) in the node_modules copied from the node stage.
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

RUN curl -fsSL https://github.com/PHP-CS-Fixer/PHP-CS-Fixer/releases/download/v3.94.2/php-cs-fixer.phar -o /usr/local/bin/php-cs-fixer \
    && chmod +x /usr/local/bin/php-cs-fixer \
    && php-cs-fixer --version

# Copy generator files (these change frequently, so keep them last)
COPY generators/php/sdk/features.yml /assets/features.yml
COPY generators/php/sdk/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
