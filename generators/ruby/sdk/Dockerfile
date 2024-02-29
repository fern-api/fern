# syntax = edrevo/dockerfile-plus
INCLUDE+ packages/generators/docker/Dockerfile.base

COPY generators/ruby/sdk/dist /dist

# Install Ruby and Rubocop for formatting
RUN apk --no-cache add ruby ruby-dev && gem install rubocop

ENTRYPOINT ["node", "/dist/cli.cjs", "ruby-sdk"]