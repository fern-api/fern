FROM ruby:3.3-alpine3.20

RUN apk --no-cache add \
    bash \
    build-base \
    curl \
    git \
    zip \
    nodejs \
    npm
    
RUN gem install rubocop rubocop-minitest

RUN git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

RUN npm install -f -g @fern-api/generator-cli@0.2.0

COPY generators/ruby-v2/sdk/features.yml /assets/features.yml
COPY generators/ruby-v2/sdk/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]