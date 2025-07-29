FROM node:20.18-alpine3.20

RUN apk --no-cache add git zip
RUN git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

RUN yarn init --yes

RUN yarn add \
  typescript@~5.7.2

COPY generators/typescript-mcp/model/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
