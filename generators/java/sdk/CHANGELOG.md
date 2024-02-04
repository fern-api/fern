`# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0-rc2] - 2024-02-04
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

## [0.6.1] - 2024-02-03

- Chore: Intialize this changelog