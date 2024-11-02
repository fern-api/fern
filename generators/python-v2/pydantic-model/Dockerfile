FROM node:18.1.0-alpine
COPY generators/python-v2/pydantic-model/dist /dist
ENTRYPOINT ["node", "/dist/cli.cjs"]
