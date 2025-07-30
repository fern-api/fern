FROM node:22.12-alpine3.20

RUN apk --no-cache add git

COPY generators/rust/model/dist/cli.cjs /dist/cli.cjs

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"] 