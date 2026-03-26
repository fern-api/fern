FROM node:22.12-slim
COPY generators/python-v2/sdk/dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
