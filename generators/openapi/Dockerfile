FROM node:20.18-alpine3.20
COPY dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "openapi"]
