FROM ruby:3.3-alpine3.23

RUN apk --no-cache upgrade && \
    apk --no-cache add \
    bash \
    build-base \
    curl \
    git \
    zip \
    nodejs \
    npm

# curl 8.23.0 strips credentials from CURLINFO_EFFECTIVE_URL, so git (<= 2.54) treats every
# authenticated https clone as a redirect, drops the token and fails on private repositories
# ("could not read Username"). Keep Alpine 3.22's libcurl until git/curl ship a fix.
RUN apk add --no-cache --repository=https://dl-cdn.alpinelinux.org/alpine/v3.22/main 'curl<8.23' 'libcurl<8.23'

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
