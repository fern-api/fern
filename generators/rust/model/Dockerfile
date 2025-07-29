FROM node:18-alpine3.18

RUN apk --no-cache add git

COPY generators/rust/model/dist/cli.cjs /dist/cli.cjs

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"] 