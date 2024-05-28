# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.17 - 2024-05-28]

- Fix: enable `nullable` on all csharp files. 

  ```csharp
  # nullable enable
  ```
- Fix: make project `.net6`, `.net7` and `.net8` compatible. 

  ```xml
    <TargetFrameworks>net8.0;net7.0;net6.0</TargetFrameworks>
  ```

## [0.0.16 - 2024-05-23]

- Fix: Misc. fixes including `.csproj` indentation, setting `X-Fern-SDK-Name` to the top level
  namespace, and passing through serializer options when serializing JSON messages.

## [0.0.15 - 2024-05-23]

- Fix: Inlined requests that are strictly bodies should be JSON serializable. To achieve this
  these types of inlined requests now have JSON annotations.

  ```csharp
  public class SearchRequest
  {
      [JsonPropertyName("query")] // added
      public string Query { get; init; }
  }
  ```

## [0.0.14 - 2024-05-23]

- Fix: The SDK now adds a `JsonEnumMemberStringEnumConverter` which reads `EnumMember(Value="...")`
  annotations on enum values and appropriately serializes them as strings.

## [0.0.13 - 2024-05-22]

- Fix: If a LICENSE is specified, the generator now packages the license in the `.csproj` file.

  ```xml
    <ItemGroup>
        <None Include="..\..\LICENSE" Pack="true" PackagePath=""/>
    </ItemGroup>
  ```

## [0.0.12 - 2024-05-22]

- Improvement: The C# generator now generates an `Environments.cs` file which contains
  URLs for the different environments. If a default environment is present, then
  the `BaseURL` in `ClientOptions.cs` will be initialized to this value.

  ```csharp
  class Environments {

    public static string PRODUCTION = "https://api.production.com";

    public static string STAGING = "https://api.staging.com";

  }
  ```

## [0.0.11 - 2024-05-20]

- Fix: The C# generator now generates a proper `.csproj` file with version, GitHub url, and
  a reference to the SDK README.

## [0.0.10 - 2024-05-15]

- Improvement: The generated SDK now publishes Github Actions to build and publish the generated package to Nuget.

## [0.0.9 - 2024-05-10]

- Fix: When an inlined request body is entirely made up of request body properties, then the entire
  request can be serialized as the request body. This case was previously being overlooked.

## [0.0.8 - 2024-05-10]

- Fix: There were several fixes merged including supporting arbitrary nested clients, query parameter serialization,
  propert naming for async methods, and properly formatted solution files.
