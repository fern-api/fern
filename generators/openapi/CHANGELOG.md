# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## [0.5.0] - 2026-04-14

- Break: The generator now emits OpenAPI 3.1.0 specifications (previously 3.0.1).
  - Nullability: `nullable: true` is no longer emitted. Optional/nullable primitives
    now emit `type: [T, "null"]`, and nullable references emit
    `anyOf: [{$ref: ...}, {type: "null"}]`. This fixes the silent no-op where
    `$ref` + sibling `nullable` previously had no effect.
  - Examples: Parameters no longer emit both `example` and `examples` on the same
    object (they are mutually exclusive in OAS 3.0 and 3.1). `examples` is
    preferred when present.
  - `info.version` now defaults to a non-empty string (`"0.0.0"`) rather than the
    empty string, which is invalid per the OAS spec.
  - `exclusiveMinimum`/`exclusiveMaximum` now emit as numbers (JSON Schema 2020-12)
    instead of the OAS 3.0 boolean format.
  - Single-element enums and union discriminant properties now use `const` instead of
    `enum: [singleValue]`.
  - Redundant `additionalProperties: true` removed (defaults to true in 3.1).
  - Schema property examples use the 3.1 `examples` array instead of the deprecated
    singular `example` keyword.
  - Response descriptions now have meaningful defaults instead of empty strings.

## [0.0.31] - 2024-03-22

- Fix: Update open api generator to v2 urls.
- Internal: Shared generator notification and config parsing logic.

## [0.0.31-rc0] - 2024-03-20

- Fix: Update open api generator to v2 urls.

## [0.0.30] - 2024-01-21

- Chore: Initialize this changelog