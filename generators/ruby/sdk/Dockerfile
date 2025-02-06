# syntax = edrevo/dockerfile-plus
INCLUDE+ packages/generators/docker/Dockerfile.base

# Install Ruby and Rubocop for formatting
RUN apk update && apk add --no-cache build-base ruby ruby-dev && gem install rubocop

COPY generators/ruby/sdk/dist /dist

ENTRYPOINT ["node", "/dist/cli.cjs", "ruby-sdk"]