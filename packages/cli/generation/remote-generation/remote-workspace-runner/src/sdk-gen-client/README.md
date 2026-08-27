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

## Tests

Compatibility tests live in the runner's `src/__test__` directory and cover all
aliases, cutover boundaries, malformed inputs, stable diagnostics, prereleases,
and large SemVer identifiers.
