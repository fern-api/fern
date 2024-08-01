# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0 - 2024-07-31]

- Feature: Support text response types.
- Feature: Support inheritance for inlined request bodies.

## [0.7.0 - 2024-07-31]

- Improvement: We now generate Exception types for all errors that are defined in the IR. Generated clients with an
  error discrimination strategy of "status code" will throw one of these typed Exceptions based on the status code of
  error responses. Example error type:
  ```csharp
  public sealed class UnauthorizedRequest(UnauthorizedRequestErrorBody body)
      : MyCompanyApiException("UnauthorizedRequest", 401, body)
  {
      public new UnauthorizedRequestErrorBody Body { get; } = body;
  }
  ```

## [0.6.0 - 2024-07-31]

- Feature: Add support for `RequestOptions`. Users can now specify a variety of request-specific
  option overrides like the following:

  ```csharp
  var user = client.GetUserAsync(
    new GetUserRequest {
      Username = "john.doe"
    },
    new RequestOptions {
        BaseUrl = "https://localhost:3000"
    }).Result;
  ```

## [0.5.0 - 2024-07-30]

- Feature: Add support for `uint`, `ulong`, and `float` types.
- Internal: Bump to IRv53.

## [0.4.0 - 2024-07-30]

- Feature: Add support for `allow-multiple` query parameters, which are sent in the `explode` format.
  Given that optional lists are assigned a default, empty list, we use a simple `LINQ` expression to
  handle the serialization, which is shown below:

  ```csharp
  _query["operand"] = request
      .Operand.Select(_value => JsonSerializer.Serialize(_value))
      .ToList();
  ```

- Improvement: `map<string, unknown>` types are now generated as `Dictionary<string, object?>` types so they
  can support explicit `null` values. Note that this does _not_ affect every `unknown` type to be an `object?`
  since it would otherwise alter its required/optional characteristics.

## [0.3.4 - 2024-07-30]

- Improvement: Make datetime deserialization more lenient, and include milliseconds in datetime serialization.

## [0.3.3 - 2024-07-30]

- Improvement: Types are now generated with `set` accessors rather than `init` accessors to improve
  flexibility of object construction.

## [0.3.2 - 2024-07-29]

- Improvement: The C# generator now supports configuration to match namespaces directly to the full path of a file.
  This can lead to more imports being required to use the SDK, but can be helpful to avoid collisions.

  ```yml
  - name: fernapi/fern-csharp-sdk
    version: 0.3.2
    config:
      explicit-namespaces: true
  ```

## [0.3.1 - 2024-07-25]

- Improvement: Add header suppliers to `RawClient` constructor parameters.

## [0.3.0 - 2024-07-25]

- Break: Convert all usages `Guid` to be `string` since the `Guid` class changes the underlying
  casing.

## [0.2.1 - 2024-07-25]

- Fix: MultURL environment classes now compile, previously there was a fix that broke compilation.

## [0.2.0 - 2024-07-25]

- Break: The `Environments.cs` class is now renamed to be `{OrgName}Environment`. For example, if your
  org name was Imdb then the environment class would be `ImdbEnvironment`.

- Feature: If the SDK has endpoints that each hit different URLs then the following class is generated.

  ```csharp
  public record AWSEnvironment
  {
      public static AWSEnvironment Production = new AWSEnvironment()
      {
          S3 = "https://s3.awsamazon.com",
          EC2 = "https://ec2.awsamazon.com"
      };

      public static AWSEnvironment Staging = new AWSEnvironment()
      {
        S3 = "https://staging.s3.awsamazon.com",
        EC2 = "https://stagng.ec2.awsamazon.com"
      };

      public required string S3 { get; init; }
      public required string EC2 { get; init; }
  }
  ```

## [0.1.4 - 2024-07-23]

- Improvement: More improvements to datetime serialization.

## [0.1.3 - 2024-07-22]

- Fix: Fixed a bug with serializing datetimes.
- Improvement: Stop generating empty serialization unit test files when there are no examples.

## [0.1.2 - 2024-07-17]

- Chore: Bump IR to 51.
- Feature: Generate serialization unit tests for models, as well as GH workflow to run them. These tests do not include instantiated object equality assertions, which should be included at a later time.

## [0.1.1 - 2024-07-10]

- Improvement: Enable generating unions with up to 32 types by adding the OneOf.Extended package.
- Fix: The generator now handles double optional fields properly and only adds a single `?` to the type.

## [0.1.0 - 2024-07-09]

- Feature: Add targets of .NET Standard 2.0 and .NET Framework 4.6.2.
- Fix: The generated `StringEnumSerializer` now avoids duplicate key errors.
- Fix: Fixed a bug where generating root client requests causes generation to fail.
- Fix: Fixed forgotten closed parentheses when getting values from the environment.
- Fix: Fixed a bug where literal header names were generated incorrectly (as safe names rather than wire names).
- Fix: Other small fixes.
- Improvement: Constructor parameters initialized to `null` are now typed as nullable.
- Improvement: Other small improvements.

## [0.0.35 - 2024-07-02]

- Fix: Base client requests are now generated, whereas previously they were skipped.

## [0.0.34 - 2024-07-02]

- Fix: Base client methods are now implemented rather than being empty.
- Fix: All `Core` files are now generated to the corresponding `Core` namespace.

## [0.0.33 - 2024-06-21]

- Improvement: The C# generator now supports configuration to specify extra dependencies. Below
  is an example of the `generators.yml` configuration:

  ```yml
  - name: fernapi/fern-csharp-sdk
    version: 0.0.33
    config:
      extra-dependencies:
        moq: "0.23.4"
  ```

## [0.0.32 - 2024-06-21]

- Fix: Enum values are JSON serialized before they are sent to the server. For example, if the
  json value of an enum.

## [0.0.31 - 2024-06-21]

- Fix: The underlying HTTP client safely joins endpoint path with base url.

## [0.0.30 - 2024-06-20]

- Fix: The SDK now supports making bytes requests with Content Type `application/octet-stream`.
- Fix: The SDK now supports api wide path parameters and joining them safely in `RawClient.cs`.

## [0.0.29 - 2024-06-20]

- Fix: The generated SDK now respects service base paths. Previously they were omitted.

## [0.0.28 - 2024-06-19]

- Improvement: Query parameter and header parameters with optional datetimes are
  now ISO 8601 encoded before making a request.

## [0.0.25 - 2024-06-20]

- Fix: Discriminated unions are generated as `object`. Eventually these will be more type safe, but
  that will require partnering with existing customers to understand what a better DX looks like.

- Improvement: Header parameters are no longer required in the constructor so that the user
  doesn't have to provide redundant information.

## [0.0.24 - 2024-06-19]

- Improvement: Query parameter and header parameters are now ISO 8601 encoded before
  making a request.

## [0.0.23 - 2024-06-07]

- Improvement: Only publish a `.NET 6` compatible SDK. There are larger code changes that
  need to be made to be `.NET 4+` compatible.

## [0.0.22 - 2024-06-07]

- Improvement: Publish a `.NET 4` compatible SDK

## [0.0.21 - 2024-05-31]

- Fix: Array and List fields are now generated as `IEnumerable<>`. Additionally, if the
  item type is a `OneOf`, then a new core class called `CollectionItemSerializer` is used
  to deserialize the values.

## [0.0.20 - 2024-05-29]

- Fix: Enum serializer is now added to enum declarations instead of enum references. This
  means that using a `JsonSerializer.serialize(myEnum)` will also provide the correct value.

- Fix: `OneOf` serializer is now added as a `Core` class. It uses reflection to scan all the
  generic classes and see if there is an opportunity to deserialize into that particular class.

## [0.0.19 - 2024-05-29]

- Fix: Enum serializer hands reading + writing enum string values. There is now no need to pass
  in a custom JsonSerializer option but instead the custom serialization will automatically be
  invoked with any JSONSerializaer.

- Fix: Non-success status code errors are thrown with the stringified response body.

## [0.0.18 - 2024-05-28]

- Fix: generated GitHub workflows now run on `dotnet-version` 8.x.

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
