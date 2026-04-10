FROM ruby:3.3-alpine3.20

RUN apk --no-cache add \
    bash \
    build-base \
    curl \
    git \
    zip \
    nodejs \
    npm
    
RUN gem install 'rubocop:~> 1.21' rubocop-minitest

RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

COPY generators/ruby-v2/model/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
