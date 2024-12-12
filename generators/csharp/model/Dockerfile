FROM node:20.18-alpine3.20 AS node
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine3.18

RUN apk --no-cache add bash curl git zip && git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

RUN dotnet tool install -g csharpier
ENV PATH="$PATH:/root/.dotnet/tools"

COPY generators/csharp/model/dist /dist

# Copy over node contents to be able to run the compiled CLI
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

ENTRYPOINT ["node", "/dist/cli.cjs"]
