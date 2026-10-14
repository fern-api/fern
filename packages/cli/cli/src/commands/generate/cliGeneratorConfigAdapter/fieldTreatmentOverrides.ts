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

/** SDK Config allows npm publication for `cli` targets with GitHub delivery; the translation does not write it yet. */
const PUBLISH_REJECTIONS: Record<string, FieldTreatment> = Object.fromEntries(
    Object.keys(HOSTED_FIELD_TREATMENTS)
        .filter((path) => path.startsWith("output.publish."))
        .map((path) => [
            path,
            {
                treatment: "Reject",
                note: "CLI npm publication is not translated to generators.yml yet."
            }
        ])
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
            note: "`config.distribution`; *SecretName fields are written to the generator's secret-name keys unchanged."
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
    ...PUBLISH_REJECTIONS,
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
    "package.extraPeerDependenciesMeta.*": { treatment: "Reject", note: "npm-only; no Cargo equivalent." }
};
