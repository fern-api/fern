FROM node:22.12-alpine3.20
COPY generators/python-v2/fastapi/dist /dist
ENTRYPOINT ["node", "/dist/cli.cjs"]
