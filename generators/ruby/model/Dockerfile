# syntax = edrevo/dockerfile-plus
INCLUDE+ packages/generators/docker/Dockerfile.base

COPY generators/ruby/model/dist /dist

# Install Ruby and Rubocop for formatting
RUN apk update && apk add --no-cache build-base ruby ruby-dev && gem install rubocop

ENTRYPOINT ["node", "/dist/cli.cjs", "ruby-model"]