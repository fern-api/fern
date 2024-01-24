# syntax = edrevo/dockerfile-plus
INCLUDE+ packages/generators/docker/Dockerfile.base

COPY generators/ruby/model/dist /dist

# Install Ruby and Rubocop for formatting
RUN apk --no-cache add ruby && gem install rubocop

ENTRYPOINT ["node", "/dist/cli.cjs", "ruby-sdk"]