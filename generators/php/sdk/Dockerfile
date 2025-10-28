FROM node:22.12-alpine3.20 AS node
FROM composer:2.7.9

ENV YARN_CACHE_FOLDER=/.yarn

RUN apk --no-cache add bash curl git zip
RUN git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

# Copy over node contents to be able to run the compiled CLI
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

RUN curl -L https://cs.symfony.com/download/php-cs-fixer-v3.phar -o /usr/local/bin/php-cs-fixer \
    && chmod +x /usr/local/bin/php-cs-fixer

COPY generators/php/sdk/features.yml /assets/features.yml
COPY generators/php/sdk/dist /dist

RUN npm install -f -g @fern-api/generator-cli@0.2.0

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
