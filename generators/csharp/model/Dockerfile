FROM node:24.17-alpine3.23 AS node
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

RUN apk update && apk upgrade --no-cache && \
    apk --no-cache add bash curl git zip && \
    git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

# curl 8.23.0 strips credentials from CURLINFO_EFFECTIVE_URL, so git (<= 2.54) treats every
# authenticated https clone as a redirect, drops the token and fails on private repositories
# ("could not read Username"). Keep Alpine 3.22's libcurl until git/curl ship a fix.
RUN apk add --no-cache --repository=https://dl-cdn.alpinelinux.org/alpine/v3.22/main 'curl<8.23' 'libcurl<8.23'

# Copy over node contents to be able to run the compiled CLI
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

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

RUN dotnet tool install -g csharpier --version "1.3.0"

COPY generators/csharp/model/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
