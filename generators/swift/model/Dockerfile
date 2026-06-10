FROM node:24.16-alpine3.23

# Security update 2026-06-10: openssl 3.5.6 → 3.5.7 (12 CVEs including
# CVE-2026-45447 heap use-after-free in PKCS7_verify, High severity).
RUN apk update && apk upgrade --no-cache \
    && apk add --no-cache --upgrade libssl3 libcrypto3 \
    && apk --no-cache add curl

# Patch npm's bundled picomatch@4.0.3 -> 4.0.4 (GHSA-c2c7-rcm5-vvqj,
# GHSA-3v7f-55p6-f55p) and brace-expansion@5.0.4 -> 5.0.6
# (GHSA-jxxr-4gwj-5jf2) in node:24.16's bundled npm 11.12.1.
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
        curl -sL https://registry.npmjs.org/brace-expansion/-/brace-expansion-5.0.6.tgz -o brace-expansion-5.0.6.tgz && \
        tar -xzf brace-expansion-5.0.6.tgz && \
        mv package brace-expansion && \
        rm brace-expansion-5.0.6.tgz; \
      fi; \
    done

ARG SENTRY_DSN
ARG SENTRY_ENVIRONMENT=production
ARG SENTRY_RELEASE
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ENVIRONMENT=$SENTRY_ENVIRONMENT
ENV SENTRY_RELEASE=$SENTRY_RELEASE

COPY generators/swift/model/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
