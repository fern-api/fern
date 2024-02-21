`# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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