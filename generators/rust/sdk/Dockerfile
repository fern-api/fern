FROM node:18-alpine3.18

RUN apk --no-cache add git

COPY generators/rust/sdk/dist/cli.cjs /dist/cli.cjs

ENTRYPOINT ["node", "/dist/cli.cjs"] 