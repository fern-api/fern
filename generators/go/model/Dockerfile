FROM node:22.12-alpine3.20 AS node

FROM golang:1.23.8-alpine3.20

ENV YARN_CACHE_FOLDER=/.yarn

RUN apk --no-cache add bash curl git zip libstdc++
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

# Copy Node from multi-stage build (consistent with go/sdk pattern)
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

COPY generators/go-v2/model/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
