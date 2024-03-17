# syntax = edrevo/dockerfile-plus
INCLUDE+ packages/generators/docker/Dockerfile.base

COPY generators/csharp/model/dist /dist

RUN apk update && apk add dotnet7-sdk

ENTRYPOINT ["node", "/dist/cli.cjs", "csharp-model"]
