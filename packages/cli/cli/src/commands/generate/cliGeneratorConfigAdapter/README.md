# cliGeneratorConfigAdapter

No generator takes SDK Config for the `cli` target, so `fern generate` translates it. When `sdk-config.yml` has a
`cli` target, this folder turns that target into a `generators.yml` for Fern's CLI generator,
`fernapi/fern-cli-generator`, in a temporary folder. It loads the folder as an ordinary workspace and generates it
as a `generators.yml` group. The user runs nothing extra and no file in their project changes.

It is a stopgap until Postman's own CLI generator ships. Everything is in this folder, plus one branch in
`prepareSdkConfigGenerations` (`../generateAPIWorkspaces.ts`).

## How it runs

1. `prepareSdkConfigGenerations` loads `sdk-config.yml` as before and splits off the `cli` target. Other targets keep
   the SDK Config path.
2. `prepareCliTargetWorkspace` expands the `cli` target, reads its specs, classifies every field and maps it
   (`translateCliTarget`).
3. It writes the result as `generators.yml` in a temporary folder. Spec paths and the output path point at the user's
   files.
4. Fern's workspace loader loads the folder, and the `cli` group runs like any group: `--local` runs Docker, the
   default route uses Fiddle, and `FERN_USE_SDK_GEN_API=true` uses sdk-gen-api.
5. The temporary folder is deleted when generation ends.

Details:

- **Selection:** `fern generate`, `fern generate --target cli` and `--sdk-config <path>` select the `cli` target the
  same way they select any SDK Config target. `--group` alone does not.
- **Version:** the SDK version is `sdk-config.yml`'s `sdkVersion` (1.0.0 by default), unless `--version` is passed.
- **Ownership:** the translated group counts as owned by `sdk-config.yml`. A `generators.yml` group that also
  selects `cli` still fails the language ownership check.

## What the user sees

Warnings print as `[warning] [CODE] path: message; action`, and errors stop the `cli` target with every error
listed. Run with `--log-level debug` to see the path of the translated `generators.yml` and the generator defaults
that apply.

## CLI settings, browser login and distribution

The `cli` target's `generation` settings (`binaryName`, `customCommands`, `rootGroup`, `profiles`, `splitTypeCrates`
and `userAgentSuffixFlag`) are written to the generator's `config` under the same names. A setting that is not set
keeps the generator's default, and a debug note lists them:

| Setting | Default |
|---|---|
| `binaryName` | From the API display name. With several specs, every generated name changes; a warning says so |
| `customCommands` | On |
| `profiles` | Off |
| `rootGroup` | None |

Browser login (an OAuth authorization-code flow) maps to `type: authorization-code` with the flow's public
`clientId` as `client-id`. Without `clientId` the flow is rejected, as Fern's validator requires it. The scheme's
`clientId` and `clientSecret` environment variables are not written for it, and a warning says so.

`output.distribution` (GitHub delivery only) is written to `config.distribution`. The `*SecretName` fields become the
generator's `appIdSecret`, `privateKeySecret` and `tokenEnvironmentVariable`, unchanged; they are GitHub Actions
secret names that the generated release workflow reads, so the Fern CLI never resolves them. Generator defaults, such
as `HOMEBREW_TAP_TOKEN`, are not written, so a channel without its own token still uses `githubApp`.

`output.distribution.githubAttestations` (`auto`, `true` or `false`) is written as-is. With `auto`, the generator's
default, the release workflow attests build provenance only on public repositories; `false` drops the step. Generator
versions before 0.54.3 ignore the key and always attest, so for any value other than `true` on those versions a
warning asks for a newer `target.generatorVersion`.

`package.license.type` is written as an SPDX identifier: the canonical types `fern sdk migrate` writes become `MIT`,
`Apache-2.0`, `GPL-3.0-only` and `UNLICENSED`, and any other value is kept. `metadata.license` (the LICENSE file)
accepts only `MIT` and `Apache-2.0`, so other licenses set only `packageIdentity.license`.

If `sdk-config.yml` came from `fern sdk migrate` and has no `api.auth`, migrate may have dropped the whole auth block
(it does so when any scheme cannot be mapped). The CLI then uses the security schemes the spec declares.

## npm publication

With `output.delivery: github`, `output.publish` (npm only) is written as a generator-level `output` block next to
`github:`; the Fern CLI turns the pair into the github output mode's npm `publishInfo`, and the generated workflow
publishes on version tags:

| SDK Config | `output` block |
|---|---|
| `registry: npm` | `location: npm`, `package-name: <package.packageName>` |
| `trustedPublishing: true` | `token: OIDC` (trusted publishing) |
| `token: ${NAME}` | `token: ${NAME}`; `${NPM_TOKEN}` when unset |
| `url` | `url` |
| `releaseBranch`, `tolerateRepublish` | Not written, with a warning |

A literal `token`, or `token` with `trustedPublishing: true`, is an error. IR-only publish fields that would change
what is published (`isPackagePrivate`, `version`, `shouldGeneratePublishWorkflow`, credentials) are rejected, and
`publishToJsr` warns.

With npm publication, `package.packageName` is the npm package name, such as `@acme/cli`. It is also the crate name
(`packageIdentity.name`) if it is a valid crate name (a letter, then letters, digits, `-` or `_`, at most 64
characters). Otherwise the crate is named from the first of these that is a valid crate name, and a debug note says
which:

1. The binary name, computed as fern-cli-generator does (kebab-cased): `generation.language.cli.binaryName`, or
   without it the spec's `info.title` when there is one spec. With several specs the binary name is not computed.
2. The kebab-cased npm name: `@acme/cli` becomes `acme-cli`.

If neither is valid (for example `@1password/cli`), the generator names the crate. Without npm publication,
`package.packageName` is the crate name.

## How fields are treated

Every field that differs from its default gets one treatment:

- **Map**: a rule writes it to `generators.yml`.
- **Warn**: it has no effect on the CLI, and a warning says so.
- **Reject**: it cannot be honored, and the `cli` target stops.
- **Ignore**: it has no effect, and no warning is needed.

The table starts from the hosted bridge's table (`hostedFieldTreatments.ts`, copied from sdk-gen-api). The local
differences are in `fieldTreatmentOverrides.ts`. A field the table does not know is an error, so a newer SDK Config
field cannot slip through unreviewed.

The table covers only the fields a `cli` target can carry: the shared fields and `generation.language.cli`. The
expanded IR never holds another language's settings, so `generation.language.typescript`, `mcp` and the rest are
left out, and a new setting for another language needs no entry.

Specs are read with Fern's own loader, so overrides, overlays and references to other files apply exactly as in
`fern generate`. The facts are used to skip headers the spec already declares, and to find OAuth token operations.

When the `cli` target pins no `generatorVersion`, the generator is written as `version: latest`, like an unpinned
generator in `generators.yml`: with `FERN_USE_SDK_GEN_API=true`, sdk-gen-api's version discovery
(`/v1/fern/generator-versions/discover`) picks the newest version it can run; Fiddle and `--local` use the newest
published version. A pinned version must be exact; anything else is an error.

## Diagnostic codes

Paths are SDK Config paths, such as `api.auth.schemes[0].location`.

| Code | Severity | Meaning |
|---|---|---|
| `CLI_TARGET_NO_CLI_TARGET` | error | The SDK Config has no `cli` target |
| `CLI_TARGET_SEVERAL_CLI_TARGETS` | error | It has more than one |
| `CLI_TARGET_EXPANSION` | error | The `cli` target does not expand to a valid SDK Config IR |
| `CLI_TARGET_UNKNOWN_FIELD` | error | A field the treatment table does not know |
| `CLI_TARGET_UNSUPPORTED_FIELD` | error | A field the CLI generator cannot honor (Reject) |
| `CLI_TARGET_IGNORED_FIELD` | warning | A field with no effect on the CLI (Warn) |
| `CLI_TARGET_UNOWNED_FIELD` | error | A Map field no rule writes (a bug in this folder) |
| `CLI_TARGET_URL_SOURCE` | error | A spec given by URL; download it and use `path` |
| `CLI_TARGET_SPEC_TYPE` | error | An AsyncAPI or GraphQL spec; the generator needs OpenAPI |
| `CLI_TARGET_PROTOBUF_SOURCE` | error | A protobuf (`proto`) source; the generator needs OpenAPI |
| `CLI_TARGET_SPEC_MISSING` | error | A spec, override or overlay file does not exist |
| `CLI_TARGET_SPEC_PARSE` | error | A spec does not load |
| `CLI_TARGET_EXTERNAL_REF` | error | A reference to another file survived loading |
| `CLI_TARGET_API_KEY_LOCATION` | error | An API key outside a header |
| `CLI_TARGET_BEARER_PREFIX` | error | A bearer prefix; Fern's bearer scheme has none |
| `CLI_TARGET_BEARER_HEADER` | error | A custom bearer header; Fern's bearer scheme has none |
| `CLI_TARGET_AUTH_ALL` | error | A requirement naming several schemes at once; Fern has no `all:` |
| `CLI_TARGET_ENDPOINT_SECURITY` | warning | Per-endpoint security drops the CLI's auth registration |
| `CLI_TARGET_TOKEN_ENDPOINT` | error | No spec POST operation matches the OAuth token URL |
| `CLI_TARGET_TOKEN_RESPONSE` | error | The token operation returns no `access_token` |
| `CLI_TARGET_INFERRED` | warning | `get-token` properties were inferred by RFC 6749 names |
| `CLI_TARGET_REFRESH_ENDPOINT` | warning | No spec POST operation matches the refresh URL |
| `CLI_TARGET_OAUTH_FLOW` | error | An implicit or password flow |
| `CLI_TARGET_OAUTH_SECOND_FLOW` | error | A second flow on one OAuth scheme |
| `CLI_TARGET_PUBLIC_CLIENT_ID` | error | A browser-login (authorization-code) flow without `clientId` |
| `CLI_TARGET_PUBLIC_CLIENT_CREDENTIALS` | warning | Browser login with scheme `clientId`/`clientSecret` environment variables, which are not written |
| `CLI_TARGET_HEADER_IS_SCHEME_KEY` | warning | A header named after an API-key scheme key (written by `fern sdk migrate`); skipped |
| `CLI_TARGET_MULTI_URL_ENVIRONMENT` | error | An environment with several URLs |
| `CLI_TARGET_LICENSE` | error | A custom license without a file path |
| `CLI_TARGET_NPM_PUBLISH` | error | npm publication the `cli` target cannot write: a literal or conflicting token, no GitHub delivery, or another registry |
| `CLI_TARGET_UNTESTED` | warning | Several overrides files, or GitHub output |
| `CLI_TARGET_ZIP_AS_FILES` | warning | Zip delivery; the `cli` target writes files |
| `CLI_TARGET_MULTI_SPEC_BINARY_NAME` | warning | Several specs and no `binaryName`, so the binary name comes from the API display name |
| `CLI_TARGET_ROOT_SETTING_CONFLICT` | warning | A spec's `pathParameterOrder` differs from root's; Fern reads it only at root |
| `CLI_TARGET_GENERATOR_VERSION` | error | A pinned generator version that is not an exact version, such as `latest` |
| `CLI_TARGET_ATTESTATIONS_VERSION` | warning | `githubAttestations` other than `true` with a generator version that ignores it |

## Tests

```
pnpm --filter @fern-api/cli exec vitest --run src/commands/generate/cliGeneratorConfigAdapter
```

The round trip over Fern's own `cli` fixtures has a fast variant in the normal run and a Docker variant behind
`CLI_TARGET_ROUNDTRIP=1`; see `__test__/fixtures/roundtrip/README.md`. It is the gate for bumping the Fern CLI, the
generator version or `@postman/sdk-config`.

## Removal

When Postman's CLI generator ships:

1. Delete this folder and the `cli` branch in `prepareSdkConfigGenerations`, with the `ownerKind`, `ownerLabel` and
   `version` fields it added to `WorkspaceGeneration`.
2. Add a changelog entry under `packages/cli/cli/changes/unreleased/`.
