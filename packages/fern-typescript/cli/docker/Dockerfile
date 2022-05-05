FROM node:18.1.0-alpine

RUN mkdir /scripts
COPY scripts /scripts
COPY monorepo /fern
RUN /scripts/init.sh

ENTRYPOINT ["npx", "/fern/packages/fern-typescript/cli"]
