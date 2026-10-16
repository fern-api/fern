import type { FieldTreatment } from "./fieldTreatments.js";
import { HOSTED_FIELD_TREATMENTS } from "./hostedFieldTreatments.js";
import { CLI_GENERATION_PATHS, DISTRIBUTION_PATHS } from "./rules/cliConfig.js";

const LOCAL_GITHUB_FIELDS = new Set(["output.github.repository", "output.github.mode", "output.github.branch"]);

/** Other GitHub delivery settings have no equivalent in the translated generators.yml. */
const GITHUB_WARNINGS: Record<string, FieldTreatment> = Object.fromEntries(
    Object.keys(HOSTED_FIELD_TREATMENTS)
        .filter((path) => path.startsWith("output.github.") && !LOCAL_GITHUB_FIELDS.has(path))
        .map((path) => [
            path,
            {
                treatment: "Warn",
                note: "Not written: the translated github output block has repository, mode and branch only."
            }
        ])
);

const NPM_PUBLISH_FIELDS: Record<string, FieldTreatment> = {
    "output.publish.registry": {
        treatment: "Map",
        note: "npm only: a generator `output` block with `location: npm` next to `github`, named by package.packageName."
    },
    "output.publish.trustedPublishing": { treatment: "Map", note: "`token: OIDC` on the npm output block." },
    "output.publish.tokenEnvironmentVariable": {
        treatment: "Map",
        note: "`token: ${NAME}` on the npm output block; `${NPM_TOKEN}` when unset."
    },
    "output.publish.url": { treatment: "Map", note: "`url` on the npm output block." },
    "output.publish.releaseBranch": {
        treatment: "Warn",
        note: "Not written: the generated workflow publishes on version tags, from any branch."
    },
    "output.publish.tolerateRepublish": {
        treatment: "Warn",
        note: "Not written: the generated publish workflow decides how an already-published version is handled."
    },
    "output.publish.publishToJsr": {
        treatment: "Warn",
        note: "Not written: the cli target publishes to npm only, so nothing is published to JSR."
    },
    "output.publish.isPackagePrivate": {
        treatment: "Reject",
        note: "The generated npm packages cannot be marked private, so they would be published publicly."
    },
    "output.publish.version": {
        treatment: "Reject",
        note: "The npm packages take their version from the release tag; a separate npm version cannot be written."
    },
    "output.publish.shouldGeneratePublishWorkflow": {
        treatment: "Reject",
        note: "The publish workflow is generated whenever output.publish is set; remove output.publish to turn it off."
    },
    "output.publish.credentialsRef": {
        treatment: "Reject",
        note: "Credential references are resolved by the hosted path only; set output.publish.token to ${NAME}."
    },
    ...Object.fromEntries(
        ["apiKey", "password", "token", "username"].map((field) => [
            `output.publish.credentials.${field}`,
            {
                treatment: "Reject",
                note: "Literal credentials are not written to generators.yml; set output.publish.token to ${NAME}."
            }
        ])
    )
};

/** Fields of the other registries; SDK Config allows only npm for `cli`. */
const NON_NPM_PUBLISH_REJECTIONS: Record<string, FieldTreatment> = Object.fromEntries(
    Object.keys(HOSTED_FIELD_TREATMENTS)
        .filter((path) => path.startsWith("output.publish.") && NPM_PUBLISH_FIELDS[path] == null)
        .map((path) => [path, { treatment: "Reject", note: "Not an npm field; the cli target publishes to npm only." }])
);

const CLI_GENERATION_SETTINGS: Record<string, FieldTreatment> = Object.fromEntries(
    CLI_GENERATION_PATHS.map((path) => [
        path,
        { treatment: "Map", note: "The fern-cli-generator `config` key of the same name." }
    ])
);

const DISTRIBUTION_FIELDS: Record<string, FieldTreatment> = Object.fromEntries(
    DISTRIBUTION_PATHS.map((path) => [
        path,
        {
            treatment: "Map",
            note: "`config.distribution`; *SecretName fields are written to the generator's secret-name keys unchanged, and githubAttestations as-is."
        }
    ])
);

/**
 * Where the translation treats a field differently from the hosted bridge (see README.md). The hosted
 * table assumes sdk-gen-api owns delivery and that the generator version is pinned; locally, the translation
 * writes the output block, reads local spec paths and maps a few auth fields the hosted path cannot.
 */
export const FIELD_TREATMENT_OVERRIDES: Record<string, FieldTreatment> = {
    "source.specs[].specUrl": { treatment: "Map", note: "A local path, written relative to generators.yml." },
    "output.delivery": { treatment: "Map", note: "The generator's output block: local files or GitHub." },
    "output.path": { treatment: "Map", note: "`output.path` of the local-file-system output block." },
    "output.github.repository": { treatment: "Map", note: "GitHub output block (untested)." },
    "output.github.mode": { treatment: "Map", note: "GitHub output block (untested)." },
    "output.github.branch": { treatment: "Map", note: "GitHub output block (untested)." },
    ...GITHUB_WARNINGS,
    "output.fileName": { treatment: "Warn", note: "Zip delivery is hosted-only; the cli target writes files." },
    ...NON_NPM_PUBLISH_REJECTIONS,
    ...NPM_PUBLISH_FIELDS,
    "api.auth.schemes[].flows[].authorizationUrl": {
        treatment: "Map",
        note: "`authorization-url` on an authorization-code OAuth scheme."
    },
    "api.auth.schemes[].tokenHeader": { treatment: "Map", note: "`token-header` on the OAuth scheme." },
    "api.auth.schemes[].tokenPrefix": { treatment: "Map", note: "`token-prefix` on the OAuth scheme." },
    "api.auth.schemes[].flows[].refreshUrl": {
        treatment: "Map",
        note: "Client credentials: `refresh-token`, matched to a spec POST operation. Authorization code: `refresh-url`."
    },
    "api.auth.endpointSecurity": {
        treatment: "Map",
        note: "`api.auth: { endpoint-security: {} }`, with a warning that the CLI loses its auth registration."
    },
    "target.generatorVersion": {
        treatment: "Map",
        note: "Any version fern-cli-generator's versions.yml lists; 0.49.0 by default."
    },
    "target.sdkVersion": { treatment: "Ignore", note: "Passed to the generation as its version." },
    "target.apiName": { treatment: "Ignore", note: "Set for validation; the Fern CLI names the workspace." }
};

/** Fields newer than the hosted table's @postman/sdk-config version, which the hosted copy does not list. */
export const LOCAL_FIELD_ADDITIONS: Record<string, FieldTreatment> = {
    ...CLI_GENERATION_SETTINGS,
    ...DISTRIBUTION_FIELDS,
    "api.auth.schemes[].flows[].clientId": {
        treatment: "Map",
        note: "`client-id` on an authorization-code OAuth scheme: the public client ID browser login sends."
    },
    "package.extraPeerDependenciesMeta.*": { treatment: "Reject", note: "npm-only; no Cargo equivalent." },
    ...Object.fromEntries(
        ["source.apiImportSettings", "source.specs[].apiImportSettings"].map((prefix) => [
            `${prefix}.inferDiscriminatedUnionBaseProperties`,
            { treatment: "Map", note: "`infer-discriminated-union-base-properties` in the spec and root `settings`." }
        ])
    ),
    "package.bugs.url": {
        treatment: "Warn",
        note: "Not written: fern-cli-generator's packageIdentity has no bugs field."
    },
    "package.bugs.email": {
        treatment: "Warn",
        note: "Not written: fern-cli-generator's packageIdentity has no bugs field."
    },
    "output.github.workflows": {
        treatment: "Warn",
        note: "Not written: the translated github output block has repository, mode and branch only."
    }
};
