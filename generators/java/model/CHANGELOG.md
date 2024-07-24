# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.2] - 2024-07-23

* Improvement: Generated builder methods for optional fields can now accept null directly.
  
## [0.9.1-rc0] - 2024-07-02

* Improvement: The generator now adds a class-level `@JsonInclude(JsonInclude.Include.NON_ABSENT)` annotation to
  each generated type in place of the previous `@JsonInclude(JsonInclude.Include.NON_EMPTY)` by default. This is 
  configurable in the `generators.yml` file:
    ```yaml
  generators:
    - name: fernapi/fern-java-model
      config:
        json-include: non-empty # default non-absent
  ```

## [0.9.0] - 2024-06-07

- Feature: The generator now supports BigInteger types.
- Chore: Bump intermediate representation to v46

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
