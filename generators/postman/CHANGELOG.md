# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2024-08-30

- Feat: Introduces a `collection-name` configuration that allows you to control 
  the name of the collection in the generated Postman collection. 

  ```yml
  groups: 
    generators: 
      postman: 
        - name: fernapi/fern-postman
          version: 0.4.0
          config: 
            collection-name: My collection name
  ```

## [0.3.2] - 2024-08-30

- Fix: Increase timeout to 180 seconds when pubishing to postman. 

## [0.3.1] - 2024-08-30

- Fix: Improve the error messages thrown by the postman generator. 

## [0.3.0] - 2024-08-29

- Feature: Support updating a postman collection by collection ID.

## [0.2.1] - 2024-08-21

- Fix: The Postman generator now respects an API wide base-path. The base path will be prefixed on 
  all endpoints in the collection. 

## [0.2.0] - 2024-08-21

- Internal: Upgrade the Postman generator to use IR version 53.

## [0.1.1] - 2024-03-22

- Internal: Shared generator notification and config parsing logic.

## [0.1.0] - 2024-02-11
- Fix: The Postman generator no longer times out on the latest CLI version. 
  
  The generator would previously throw on additional fields being present in the IR, which would prevent
  Fern from adding new fields. Now, the generator does not throw if additional fields are present.

## [0.0.46] - 2024-02-09

- Chore: Intialize this changelog
