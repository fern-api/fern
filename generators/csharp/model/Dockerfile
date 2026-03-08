FROM node:22.12-alpine3.20 AS node
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine

ENV YARN_CACHE_FOLDER=/.yarn
ENV PATH="$PATH:/root/.dotnet/tools"
ENV DOTNET_NOLOGO=1
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1

RUN apk --no-cache add bash curl git zip && \
    git config --global user.name "fern" && \
    git config --global user.email "hey@buildwithfern.com"

# Copy over node contents to be able to run the compiled CLI
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Cache common NuGet dependencies so generated SDK restores are fast
RUN dotnet tool install -g csharpier --version "1.2.6" && \
    echo '<Project Sdk="Microsoft.NET.Sdk"> \
  <PropertyGroup> \
      <TargetFrameworks>net462;net8.0;netstandard2.0</TargetFrameworks> \
  </PropertyGroup> \
  <ItemGroup> \
      <PackageReference Include="Portable.System.DateTimeOnly" Version="8.0.2" /> \
      <PackageReference Include="PolySharp" Version="1.15.0" /> \
      <PackageReference Include="OneOf" Version="3.0.271" /> \
      <PackageReference Include="OneOf.Extended" Version="3.0.271" /> \
      <PackageReference Include="System.Text.Json" Version="8.0.5" /> \
      <PackageReference Include="System.Net.Http" Version="[4.3.4,)" /> \
      <PackageReference Include="System.Text.RegularExpressions" Version="[4.3.1,)" /> \
      <PackageReference Include="Google.Protobuf" Version="3.27.2" /> \
      <PackageReference Include="Grpc.Net.Client" Version="2.63.0" /> \
      <PackageReference Include="Grpc.Net.ClientFactory" Version="2.63.0" /> \
      <PackageReference Include="Grpc.Tools" Version="2.64.0" /> \
      <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.13.0"/> \
      <PackageReference Include="NUnit" Version="4.3.2"/> \
      <PackageReference Include="NUnit3TestAdapter" Version="5.0.0"/> \
      <PackageReference Include="NUnit.Analyzers" Version="4.6.0" /> \
      <PackageReference Include="coverlet.collector" Version="6.0.4" /> \
      <PackageReference Include="WireMock.Net" Version="1.7.4" /> \
      <PackageReference Include="Microsoft.Extensions.Logging.Abstractions" Version="8.0.2" /> \
      <PackageReference Include="Microsoft.IO.RecyclableMemoryStream" Version="3.0.1" /> \
      <PackageReference Include="System.Net.ServerSentEvents" Version="9.0.9" /> \
  </ItemGroup> \
</Project>' > /dependencies.csproj && \
    dotnet restore /dependencies.csproj && \
    rm /dependencies.csproj

COPY generators/csharp/model/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
