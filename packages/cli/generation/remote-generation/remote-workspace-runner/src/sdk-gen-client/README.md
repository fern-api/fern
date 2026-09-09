# Generator configuration compatibility

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

// route.payloadKind === "sdk-config-v1"
```

Versions below a generator's cutover require `legacy-fern` and route to a Fern
runtime bundle. Versions at or above cutover require `sdk-config-v1` and route to
SDK Config v1. sdk-gen-api adds source and operational metadata and constructs SDK Config IR v1 downstream.

Failures throw `GeneratorConfigCompatibilityError`, which carries stable input,
expected-value, retryability, and recommended-action fields. Product-specific
CLI guidance belongs at the call site.

The alias and cutover matrix is private. Call `getGeneratorLanguage()` or the
validator instead of importing or copying policy data.

## Output ownership

The sdk-gen-api route currently supports only `downloadFiles`. Fern downloads that artifact to the
configured local output path. It does not perform GitHub or registry delivery after polling the API,
and the API cannot resolve Fern's raw credentials or preserve `verify`, `skipIfNoDiff`, and
`autoMerge` yet. Pre-cutover targets requiring those behaviors remain on Fiddle. Cutover-or-newer
targets fail before source preparation or remote work instead of silently changing behavior.

## Tests

Compatibility tests live in the runner's `src/__test__` directory and cover all
aliases, cutover boundaries, malformed inputs, stable diagnostics, prereleases,
and large SemVer identifiers.
