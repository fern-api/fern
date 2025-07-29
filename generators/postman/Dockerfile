FROM node:18.1.0-alpine
COPY dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
