# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.5] - 2024-07-26

* Fix: Fixed a bug where local generation custom config doesn't pick up some values, including exception naming. 

## [1.0.4] - 2024-07-24

* Fix: Fixed a bug where OkHttp responses could be closed prematurely.

## [1.0.3] - 2024-07-23

* Improvement: Generated builder methods for optional fields can now accept null directly.

## [1.0.2-rc0] - 2024-07-02

* Improvement: The SDK generator now adds a class-level `@JsonInclude(JsonInclude.Include.NON_ABSENT)` annotation to 
  each generated type in place of the previous `@JsonInclude(JsonInclude.Include.NON_EMPTY)` by default. This ensures 
  that required empty collection fields are not removed from request or response json. This is configurable in the 
  `generators.yml` file:
    ```yaml
  generators:
    - name: fernapi/fern-java-sdk
      config:
        json-include: non-empty # default non-absent
  ```

## [1.0.1] - 2024-06-26

- Break: The Java SDK is now on major version 1. To take this upgrade without any breaks, please add the below 
  configuration to your `generators.yml` file:
  ```yaml
  generators:
  - name: fernapi/fern-java-sdk
    config:
      base-api-exception-class-name: ApiError
      base-exception-class-name: CompanyException # Optional: This should only be set if default naming is undesirable
  ```
- Improvement: We now generate Exception types for all errors that are defined in the IR. Generated clients with an
  error discrimination strategy of "status code" will throw one of these typed Exceptions based on the status code of
  error responses. Example error type:
  ```java
  public final class BadRequest extends MyCompanyApiError {
    public BadRequest(Object body) {
        super("BadRequest", 400, body);
    }
  }
  ```

## [0.10.1] - 2024-06-13

- Feature: Add support for cursor and offset pagination. 

  For example, consider the following endpoint `/users` endpoint:

  ```yaml
  types:
    User:
      properties:
        name: string

    ListUserResponse:
      properties:
        next: optional<string>
        data: list<User>

  service:
    auth: false
    base-path: /users
    endpoints:
      list:
        path: ""
        method: GET
        pagination:
          cursor: $request.starting_after
          next_cursor: $response.next
          results: $response.data
        request:
          name: ListUsersRequest
          query-parameters:
            starting_after: optional<string>
        response: ListUsersResponse
  ```
  
  The generated `SyncPagingIterable<User>` can then be used to traverse through the `User` objects:
  ```java
  for (User user : client.users.list(...)) {
      System.out.println(user);
  }
  ```
  
  Or stream them:
  ```java
  client.users.list(...).streamItems().map(user -> ...);
  ```
  
  Or statically calling `nextPage()` to perform the pagination manually:
  ```java
  SyncPagingIterable<User> pager = client.users.list(...);
  // First page
  System.out.println(pager.getItems());
  // Second page
  pager = pager.nextPage();
  System.out.println(pager.getItems());
  ```

## [0.10.0] - 2024-06-07

- Feature: The generator now supports BigInteger types.
- Chore: Bump intermediate representation to v46

## [0.9.8] - 2024-06-06

- Fix: `RequestOptions` are now generated with the `timeout` field initialized to `Optional.empty()` instead of `null` 
  to avoid NPEs if `timeout` is not set in the builder.

## [0.9.7] - 2024-06-06

- Feature: The SDK generator now generates `@java.lang.Override` over `@Override` in all files to avoid clashes with any
  `Override.java` class that may have been generated in the same package. The former was used most places, but not all, 
  until this release.

## [0.9.6] - 2024-06-05

- Feature: The SDK generator now supports returning response properties from client methods rather than just the 
  responses themselves.

## [0.9.5] - 2024-05-30

- Fix: Types without fields are now generated with builders. Previously, they were not, which made them impossible to
  initialize.

## [0.9.4] - 2024-05-28

- Fix: The SDK now generates undiscriminated unions with de-conflicted method signatures. Previously, certain
  undiscriminated unions would have failed to compile due to Java's type erasure causing conflicts.

## [0.9.3] - 2024-05-23

- Feature: Generated SDK clients with an OAuth security scheme will now automatically refresh access tokens before they
  expire.

## [0.9.2] - 2024-05-21

- Fix: Java 8 Compatibility.

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
