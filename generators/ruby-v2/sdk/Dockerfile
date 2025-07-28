FROM node:20.18-alpine3.20

ENV YARN_CACHE_FOLDER=/.yarn

RUN apk --no-cache add \
    bash \
    build-base \
    curl \
    git \
    ruby \
    ruby-dev \
    zip

RUN git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

# Use latest stable versions as of June 2025
RUN gem update --system 3.6.9 && gem install bundler:2.6.9
RUN gem install rubocop:1.75.5
RUN npm install -f -g @fern-api/generator-cli

COPY generators/ruby-v2/sdk/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]