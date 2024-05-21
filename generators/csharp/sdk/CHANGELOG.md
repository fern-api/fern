# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
