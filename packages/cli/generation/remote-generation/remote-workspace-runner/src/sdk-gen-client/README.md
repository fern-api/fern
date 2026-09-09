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

## SDK Config input

The remote workspace runner accepts an optional explicit SDK Config path plus the Fern project root.
When sdk-gen-api is enabled, an explicit path is loaded first and never falls back to discovery if it
is missing or invalid. Otherwise, `sdk-config.yml` at the project root is loaded only when at least one
selected known generator is at or above its cutover. Explicit paths are resolved from the invocation
working directory.

The loader parses YAML, validates it with `validateSdkConfigV1()`, and serializes that validated sparse
document as the request payload. It calls `parseSdkConfigV1()` only to resolve effective root and target
SDK versions and package metadata for request fields. An explicitly supplied CLI SDK version takes
precedence over the matching target SDK version and root SDK version. Every cutover target must have a
matching SDK Config language.

Route selection remains per target. Below-cutover targets always retain Fern runtime bundles even when
an SDK Config is loaded. A legacy `fern generate` group can therefore submit one sdk-gen-api batch that
contains both `fern-runtime-bundle` and `sdk-config-v1` payloads. CLI-v2 retains its existing per-target
remote calls and supports either payload kind without introducing group batching.

When no SDK Config is available for a cutover target, compatibility validation reports both supported
actions: select an exact generator version below the cutover, or run `fern sdk migrate` and generate with
the resulting SDK Config. Invalid explicit files and missing matching language targets are configuration
errors before source preparation or remote work.

Automatic discovery is disabled when sdk-gen-api is disabled and on local generation paths. An explicit
`--sdk-config` is rejected before Docker starts for local generation, including custom local runner and
self-hosted local target modes. Unflagged local generation is unchanged. SDK Config routes do not create
an FDR client, probe FDR health, register an API definition, or upload dynamic IR.

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
