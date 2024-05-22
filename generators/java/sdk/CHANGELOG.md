# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.1] - 2024-05-14

- Feature: Support OAuth without token refresh. Example of initializing a client with OAuth:

```java
ExampleApiClient client = ExampleApiClient
    .builder()
    .clientId("4bf2a37d-8512-44a2-af50-28a7701d9f2e")
    .clientSecret("b3b187b0-ef48-49ba-9d99-80d89fd11c4a")
    .build();
```

## [0.9.0-rc0] - 2024-05-13

- Chore: Bump intermediate representation to v42

## [0.8.11] - 2024-05-08

- Fix: Corrects the fix in 0.8.10 to check null value as opposed to a .isPresent check, given the header is
  not `Optional`, it's always `String`

## [0.8.10] - 2024-05-08

- Fix: Fixes regression from 0.8.8, headers are no longer added to the header map unless they are non-null.

## [0.8.9] - 2024-05-07

- Fix: Generated SDK clients now handle null response bodies and avoid NPEs when they receive error responses.

## [0.8.8] - 2024-05-07

- Fix: The generated SDKs no longer require global headers that are not directly related to auth if auth is mandatory
  within the SDK. Previously, the generator would require all global headers if auth was mandatory.

## [0.8.7] - 2024-03-21

- Fix: numerous fixes to Maven Central publishing
- Improvement: You can now specify publishing metadata to populate your POM on publish:
  ```yaml
  generators:
    - name: fernapi/fern-java-sdk
      version: 0.X.Y
      output:
        location: maven
        registryUrl: ""
        publish-metadata:
          author: ""
          email: ""
          package-description: ""
          reference-url: ""
  ```

## [0.8.6] - 2024-03-20

- Fix: the SDK now generates RequestOptions functions for timeouts with IdempotentRequestOptions correctly, previously
  timeout functions were only taking in regular RequestOptions. This also addresses a JavaPoet issue where fields were
  being initialized twice across RequestOptions and IdempotentRequestOptions classes, preventing the SDK from generating
  at all.

## [0.8.5] - 2024-03-18

- Feat: add in publishing config that allows for signing published artifacts, this is required for publishing to Maven
  Central.
  To sign your artifacts, you must add the below to your publishing config:
  ```yaml
  generators:
    - name: fernapi/fern-java-sdk
      version: 0.X.Y
      output:
        location: maven
        registryUrl: ""
        signature:
          keyId: ""
          password: ""
          secretKey: ""
  ```
  and secrets can be used, similar to how API keys are specified today:
  ```yaml
  generators:
    - name: fernapi/fern-java-sdk
      version: 0.X.Y
      output:
        location: maven
        registryUrl: ""
        signature:
          keyId: ${MY_KID_ENVVAR}
          password: ${MY_SECRET_ENVVAR}
          secretKey: ${MY_SECRET_KEY_ENVVAR}
  ```

## [0.8.5-rc0] - 2024-02-23

- Internal: Use gradle:jdk11-jammy instead of bitnami/gradle:latest for the base
  docker image.
- Internal: Set file encoding to UTF-8 (JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF8")

## [0.8.4] - 2024-02-23

- Improvement: The timeout specified on the RequestOptions object now sets the timeout on the entire call, not just the
  read timeout of the request.
  As a refresher, a timeout can be added per request like so:
  ```java
  RequestOptions ro = RequestOptions.builder().timeout(90).build(); // Creates a timeout of 90 seconds for the request
  //  You could also specify the timeunit, similar to as if you were using OkHttp directly
  //  RequestOptions ro = RequestOptions.builder().timeout(2, TimeUnit.MINUTES).build();
  client.films.list(ro);
  ```

## [0.8.3] - 2024-02-23

- Fix: The SDK generator now always creates a valid name for union discriminator wrapper classes.

## [0.8.2] - 2024-02-21

- Fix: File upload endpoints no longer fail to compile because the reference to
  the mime type variable is present.

  ```java
  // Code that failed to compile
  String fileMimeType = Files.probeContentType(file.toPath());
  MediaType fileMediaType = fileMimeType != null ? MediaType.parse(mimeType) : null; // mimeType undefined
  // Code that now compiles
  MediaType fileMediaType = fileMimeType != null ? MediaType.parse(fileMimeType) : null;
  ```

## [0.8.1] - 2024-02-14

- Feature: The RequestOptions object now supports configuring an optional timeout to apply per-request.
  ```java
  RequestOptions ro = RequestOptions.builder().timeout(90).build(); // Creates a timeout of 90 seconds for the request
  //  You could also specify the timeunit, similar to as if you were using OkHttp directly
  //  RequestOptions ro = RequestOptions.builder().timeout(2, TimeUnit.MINUTES).build();
  client.films.list(ro);
  ```

## [0.8.0] - 2024-02-11

- Feature: The SDK generator now supports whitelabelling. When this is turned on,
  there will be no mention of Fern in the generated code.

  **Note**: You must be on the enterprise tier to enable this mode.

## [0.7.1] - 2024-02-04

- Chore: Bump intermediate representation to v31
- Feature: The SDK generator now supports idempotency headers. Users
  will be able to specify the idempotency headers in RequestOptions.

  ```java
  Imdb imdb = Imdb.builder()
    .apiKey("...")
    .build();

  var response = imdb.ticket.purchase("theatre-id", IdempotentRequestOptions.builder()
    .idempotencyKey("...")
    .build());
  ```

- Feature: The SDK generator now supports scanning API credentials
  via environment varaibles.
  ```java
  Imdb imdb = Imdb.builder()
    .apiKey("...") // defaults to System.getenv("IMDB_API_KEY")
    .build();
  ```
- Feature: The generated models now support boolean literals and users
  do not have to specify them in the builder.
  For example, for the following object
  ```yaml
  Actor:
    properties:
      name: string
      isMale: literal<true>
  ```
  the user will not need to specify the literal properties when building
  the object.
  ```java
  var actor = Actor.builder()
    .name("Brad Pitt")
    .build();
  ```

## [0.6.1] - 2024-02-03

- Chore: Intialize this changelog
