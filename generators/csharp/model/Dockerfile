FROM node:22.12-alpine3.20 AS node
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine

ENV YARN_CACHE_FOLDER=/.yarn
ENV PATH="$PATH:/root/.dotnet/tools"
ENV DOTNET_NOLOGO=1
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1

RUN apk --no-cache add bash curl git zip
RUN git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

# Copy over node contents to be able to run the compiled CLI
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

RUN dotnet tool install -g csharpier --version "1.1.2"

COPY generators/csharp/model/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
