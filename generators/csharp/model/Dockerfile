# syntax = edrevo/dockerfile-plus
INCLUDE+ packages/generators/docker/Dockerfile.base

COPY generators/csharp/model/dist /dist

ENTRYPOINT ["node", "/dist/cli.cjs", "csharp-model"]
