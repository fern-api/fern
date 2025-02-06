FROM node:20.18-alpine3.20 AS node
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine3.21

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

RUN dotnet tool install -g csharpier

WORKDIR /dotnet-warmup

# Warm up the SDK and runtime
# Create a temporary project and build it to populate the package cache
RUN dotnet new console --output cli --no-restore && \
    dotnet new classlib --output lib --no-restore && \
    dotnet new nunit --output test --no-restore

# Restore packages for all project types to warm up NuGet cache
RUN dotnet restore cli && \
    dotnet restore lib && \
    dotnet restore test

# Build the temporary projects to warm up the compilation cache
RUN dotnet build cli && \
    dotnet build lib && \
    dotnet build test && \
    dotnet run --project cli && \
    dotnet test test

RUN rm -rf cli lib test

WORKDIR /

# Cache common dependencies
COPY generators/csharp/shared/dependencies.csproj /dependencies.csproj
RUN dotnet restore /dependencies.csproj
RUN rm /dependencies.csproj

COPY generators/csharp/sdk/features.yml /assets/features.yml
COPY generators/csharp/sdk/dist /dist

ENTRYPOINT ["node", "/dist/cli.cjs", "csharp-sdk"]
