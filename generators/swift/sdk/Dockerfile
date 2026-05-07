# Pinned to 22.22.2-alpine3.22 to fix Node.js binary CVEs picked up by recent
# grype scans and to upgrade npm-bundled deps (picomatch >=4.0.4,
# brace-expansion >=2.0.3, ip-address >=10.1.1).
FROM node:22.22.2-alpine3.22

# `apk --no-cache upgrade` pulls Alpine's backported security fixes on top of
# the base image (e.g. openssl backports addressing CVE-2026-31789,
# CVE-2026-28387/28388/28389/28390, CVE-2026-31790, CVE-2026-2673).
RUN apk --no-cache upgrade && \
    apk --no-cache add bash curl git zip && \
    git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

ARG SENTRY_DSN
ARG SENTRY_ENVIRONMENT=production
ARG SENTRY_RELEASE
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ENVIRONMENT=$SENTRY_ENVIRONMENT
ENV SENTRY_RELEASE=$SENTRY_RELEASE

# Patch ip-address to 10.1.1 to fix GHSA-v2v4-37r5-5v8g
# (XSS in Address6 HTML-emitting methods).
# Location: npm bundles its own copy of ip-address.
RUN for dir in \
      /usr/local/lib/node_modules/npm/node_modules/ip-address; do \
      if [ -d "$dir" ]; then \
        rm -rf "$dir" && \
        cd "$(dirname "$dir")" && \
        curl -sL https://registry.npmjs.org/ip-address/-/ip-address-10.1.1.tgz -o ip-address-10.1.1.tgz && \
        tar -xzf ip-address-10.1.1.tgz && \
        mv package ip-address && \
        rm ip-address-10.1.1.tgz; \
      fi; \
    done

# Patch picomatch to 4.0.4 to fix GHSA-c2c7-rcm5-vvqj (ReDoS via extglob
# quantifiers) and GHSA-3v7f-55p6-f55p (Method Injection in POSIX Character
# Classes). Location: npm's bundled tinyglobby depends on picomatch.
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
    done

# Patch brace-expansion to 2.0.3 to fix GHSA-f886-m6hf-6m8v
# (zero-step sequence causes process hang and memory exhaustion).
# Location: npm bundles its own copy of brace-expansion.
RUN for dir in \
      /usr/local/lib/node_modules/npm/node_modules/brace-expansion; do \
      if [ -d "$dir" ]; then \
        rm -rf "$dir" && \
        cd "$(dirname "$dir")" && \
        curl -sL https://registry.npmjs.org/brace-expansion/-/brace-expansion-2.0.3.tgz -o brace-expansion-2.0.3.tgz && \
        tar -xzf brace-expansion-2.0.3.tgz && \
        mv package brace-expansion && \
        rm brace-expansion-2.0.3.tgz; \
      fi; \
    done

COPY generators/swift/sdk/features.yml /assets/features.yml
COPY generators/swift/sdk/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "swift-sdk"]
