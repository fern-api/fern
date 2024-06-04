# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.2] - 2024-06-04

- Improvement: We now generate Exception types for all errors that are defined in the IR. Generated clients with an 
  error discrimination strategy of "status code" will throw one of these typed Exceptions based on the status code of 
  error responses.

## [0.8.1] - 2024-05-30

- Fix: Types without fields are now generated with builders. Previously, they were not, which made them impossible to
  initialize.

## [0.8.0] - 2024-05-28

- Fix: Undiscriminated unions are now generated with de-conflicted method signatures. Previously, certain
  undiscriminated unions would have failed to compile due to Java's type erasure causing conflicts.

## [0.8.0-rc0] - 2024-05-13
- Chore: Bump intermediate representation to v42

## [0.7.1] - 2024-02-04
- Chore: Bump intermediate representation to v31
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

## [0.6.1] - 2024-02-03

- Chore: Intialize this changelog
