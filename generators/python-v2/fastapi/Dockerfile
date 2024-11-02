FROM node:18.1.0-alpine
COPY generators/python-v2/fastapi/dist /dist
ENTRYPOINT ["node", "/dist/cli.cjs"]
