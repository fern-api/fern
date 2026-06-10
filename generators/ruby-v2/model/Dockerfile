FROM ruby:3.3-alpine3.23

# Security update 2026-06-10: openssl 3.5.6 → 3.5.7 (12 CVEs including
# CVE-2026-45447 heap use-after-free in PKCS7_verify, High severity).
RUN apk --no-cache upgrade && \
    apk add --no-cache --upgrade libssl3 libcrypto3 && \
    apk --no-cache add \
    bash \
    build-base \
    curl \
    git \
    zip \
    nodejs \
    npm
    
RUN gem install 'rubocop:~> 1.21' rubocop-minitest

RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

ARG SENTRY_DSN
ARG SENTRY_ENVIRONMENT=production
ARG SENTRY_RELEASE
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ENVIRONMENT=$SENTRY_ENVIRONMENT
ENV SENTRY_RELEASE=$SENTRY_RELEASE

COPY generators/ruby-v2/model/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
