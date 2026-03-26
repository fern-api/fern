FROM node:22.12-slim
COPY generators/python-v2/pydantic-model/dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
