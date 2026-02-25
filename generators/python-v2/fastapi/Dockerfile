FROM node:22.13-alpine3.20
COPY generators/python-v2/fastapi/dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
