FROM node:22.12-alpine3.20

RUN apk --no-cache add bash curl git zip
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

ARG SENTRY_DSN
ARG SENTRY_ENVIRONMENT=production
ARG SENTRY_RELEASE
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ENVIRONMENT=$SENTRY_ENVIRONMENT
ENV SENTRY_RELEASE=$SENTRY_RELEASE

COPY generators/swift/sdk/features.yml /assets/features.yml
COPY generators/swift/sdk/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "swift-sdk"]
