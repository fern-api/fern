FROM node:22.22-alpine3.23

RUN apk update && apk upgrade --no-cache

ARG SENTRY_DSN
ARG SENTRY_ENVIRONMENT=production
ARG SENTRY_RELEASE
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ENVIRONMENT=$SENTRY_ENVIRONMENT
ENV SENTRY_RELEASE=$SENTRY_RELEASE

COPY generators/swift/model/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
