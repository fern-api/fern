# SDK generation client

Internal Fern-first client logic for cloud SDK generation. It lives beside the
remote workspace runner because that runner owns sdk-gen-api request preparation,
submission, polling, and result handling.

This is not a separately published package. Keep its API private to the remote
workspace runner unless another concrete Fern consumer requires it.

## Current API

`validateGeneratorConfigCompatibility()` is the authority for known first-party
generator aliases, language agreement, exact-version cutovers, accepted
configuration kinds, and payload routes.

```ts
import { validateGeneratorConfigCompatibility } from "./sdk-gen-client/index.js";

const route = validateGeneratorConfigCompatibility({
    generatorId: "fernapi/fern-typescript-sdk",
    language: "typescript",
    requestedVersion: "4.0.0",
    configKind: "sdk-config-v1"
});

// route.payloadKind === "sdk-config-ir-v1"
```

Versions below a generator's cutover require `legacy-fern` and route to a Fern
runtime bundle. Versions at or above cutover require `sdk-config-v1` and route to
SDK Config IR v1.

Failures throw `GeneratorConfigCompatibilityError`, which carries stable input,
expected-value, retryability, and recommended-action fields. Product-specific
CLI guidance belongs at the call site.

The alias and cutover matrix is private. Call `getGeneratorLanguage()` or the
validator instead of importing or copying policy data.

## Direction

This directory is the expansion point for Fern's sdk-gen-api client behavior:

- authentication adaptation without owning Fern's login flow;
- multipart request construction and source upload;
- polling, timeout policy, target results, and lifecycle events;
- stable API errors, redaction, and artifact handoff; and
- fallback decisions before either backend creates side effects.

Add behavior here only when it can replace duplicated logic in the remote runner.
Do not introduce fixed rollout cohorts by language, generator, or version.

## Tests

Compatibility tests live in the runner's `src/__test__` directory and cover all
aliases, cutover boundaries, malformed inputs, stable diagnostics, prereleases,
and large SemVer identifiers.
