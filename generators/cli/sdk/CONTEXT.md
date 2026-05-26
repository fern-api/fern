# Domain Language

Terminology used throughout this SDK's source. When adding new concepts here,
prefer extending this file over scattering definitions across module docs.

## Language

**Null sentinel**:
The literal string `null` passed as a flag value. On a parameter whose IR `nullable` flag is `true`, the CLI converts it to JSON `null` on the wire; on a non-nullable parameter it is passed through as the four-character string `"null"`.
_Avoid_: "null flag", "explicit null"

**Nullable parameter**:
A `MethodParameter` whose schema admits JSON `null` as a valid value, sourced from OpenAPI 3.0 `nullable: true` or 3.1 `type: [..., "null"]`. Determines whether the null sentinel applies.
_Avoid_: "optional" (which refers to whether the flag can be omitted, not whether `null` is a valid value).
