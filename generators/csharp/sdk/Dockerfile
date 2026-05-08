# Stage 1: Node.js
# Pinned to 22.22-alpine3.23 to fix Node.js binary CVEs picked up by the
# 2026-05-06 grype scan (CVE-2025-23166, CVE-2025-23083, CVE-2025-59465,
# CVE-2026-21637, CVE-2025-55131, CVE-2026-21710, CVE-2025-59466,
# CVE-2025-23085, CVE-2026-21717, CVE-2026-21713, CVE-2026-21714,
# CVE-2025-55132, CVE-2025-23165, CVE-2026-21715, CVE-2026-21716,
# CVE-2025-55130) and to upgrade npm-bundled deps cross-spawn (>=7.0.5),
# minimatch (>=9.0.7), glob (>=10.5.0), tar (>=7.5.11), and diff (>=5.2.2).
FROM node:22.22-alpine3.23 AS node

FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine

ENV YARN_CACHE_FOLDER=/.yarn
ENV PATH="$PATH:/root/.dotnet/tools"
ENV DOTNET_NOLOGO=1
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1
ARG SENTRY_DSN
ARG SENTRY_ENVIRONMENT=production
ARG SENTRY_RELEASE
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ENVIRONMENT=$SENTRY_ENVIRONMENT
ENV SENTRY_RELEASE=$SENTRY_RELEASE

# `apk upgrade` pulls the latest Alpine 3.23 package fixes (e.g. nghttp2-libs
# 1.69.0-r0 to address CVE-2026-27135) on top of what ships in the base image.
RUN apk --no-cache upgrade && \
    apk --no-cache add bash curl git zip && \
    git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

# PowerShell is bundled with the .NET SDK image but is unused by the C# SDK
# generator (the generator only needs `dotnet format` and the `csharpier`
# tool). Removing it drops the vulnerable
# /usr/share/powershell/.../System.Security.Cryptography.Xml.dll 10.0.5
# (GHSA-37gx-xxp4-5rgx and GHSA-w3x6-4m5h-cxqf) without affecting the SDK
# itself.
RUN rm -rf /usr/share/powershell /usr/bin/pwsh

RUN dotnet tool install -g csharpier --version "1.2.6"

# Copy over node contents to be able to run the compiled CLI
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

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

COPY generators/csharp/sdk/features.yml /assets/features.yml
COPY generators/csharp/sdk/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "csharp-sdk"]
