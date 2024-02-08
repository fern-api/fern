# syntax = edrevo/dockerfile-plus
INCLUDE+ packages/generators/docker/Dockerfile.base

COPY generators/csharp/sdk/dist /dist

ENTRYPOINT ["node", "/dist/cli.cjs", "csharp-sdk"]
