FROM node:20.18-alpine3.20 AS node
FROM ruby:3.2.6-alpine3.20

RUN apk --no-cache add bash curl git zip && git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

RUN curl -L https://cs.symfony.com/download/php-cs-fixer-v3.phar -o /usr/local/bin/php-cs-fixer \
    && chmod +x /usr/local/bin/php-cs-fixer
ENV YARN_CACHE_FOLDER=/.yarn

COPY generators/ruby/sdk/dist /dist

# Copy over node contents to be able to run the compiled CLI
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Cache generator files and create entry point within an extended Dockerfile
ENTRYPOINT ["node", "/dist/cli.cjs"]
