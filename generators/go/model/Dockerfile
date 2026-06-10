FROM node:24.16-alpine3.23 AS node

FROM golang:1.26.4-alpine3.23

# Patch src/go.mod to bump x/net so SBOM scanners no longer flag a stale
# pseudo-version.
RUN sed -i 's|golang.org/x/net v0.47.1-[^ ]*|golang.org/x/net v0.53.0|' \
        /usr/local/go/src/go.mod /usr/local/go/src/vendor/modules.txt && \
    sed -i '/golang.org\/x\/net v0.47.1-/d' /usr/local/go/src/go.sum

ENV YARN_CACHE_FOLDER=/.yarn
ARG SENTRY_DSN
ARG SENTRY_ENVIRONMENT=production
ARG SENTRY_RELEASE
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ENVIRONMENT=$SENTRY_ENVIRONMENT
ENV SENTRY_RELEASE=$SENTRY_RELEASE

# Security update 2026-06-10: openssl 3.5.6 → 3.5.7 (12 CVEs including
# CVE-2026-45447 heap use-after-free in PKCS7_verify, High severity).
RUN apk update && apk upgrade --no-cache \
    && apk add --no-cache --upgrade libssl3 libcrypto3
RUN apk --no-cache add bash curl git zip libstdc++
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

# Copy Node from multi-stage build (consistent with go/sdk pattern)
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Patch npm's bundled picomatch and brace-expansion to versions that clear
# vulnerability scanners.
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

COPY generators/go-v2/model/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
