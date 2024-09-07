FROM node:18-alpine3.18

RUN apk --no-cache add bash curl git zip && git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

ENV YARN_CACHE_FOLDER=/.yarn

COPY generators/php/sdk/dist /dist
COPY generators/php/sdk/features.yml /assets/features.yml

ENTRYPOINT ["node", "/dist/cli.cjs"]
