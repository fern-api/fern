# syntax = edrevo/dockerfile-plus
INCLUDE+ packages/generators/docker/Dockerfile.base

RUN apk --no-cache add bash curl git zip && git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

COPY generators/swift/model/dist /dist

ENTRYPOINT ["node", "/dist/cli.cjs"]
