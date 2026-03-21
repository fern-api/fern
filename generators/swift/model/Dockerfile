FROM node:22.12-alpine3.20

COPY generators/swift/model/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
