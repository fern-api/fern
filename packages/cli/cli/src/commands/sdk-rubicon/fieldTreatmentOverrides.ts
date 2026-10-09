import type { FieldTreatment } from "./fieldTreatments.js";
import { HOSTED_FIELD_TREATMENTS } from "./hostedFieldTreatments.js";

const LOCAL_GITHUB_FIELDS = new Set(["output.github.repository", "output.github.mode", "output.github.branch"]);

/** Other GitHub delivery settings have no generators.yml equivalent rubicon writes. */
const GITHUB_WARNINGS: Record<string, FieldTreatment> = Object.fromEntries(
    Object.keys(HOSTED_FIELD_TREATMENTS)
        .filter((path) => path.startsWith("output.github.") && !LOCAL_GITHUB_FIELDS.has(path))
        .map((path) => [
            path,
            {
                treatment: "Warn",
                note: "Not written: rubicon's github output block has repository, mode and branch only."
            }
        ])
);

/**
 * Where rubicon treats a field differently from the hosted bridge (RUBICON-PLAN.md, D10). The hosted
 * table assumes sdk-gen-api owns delivery and that the generator version is pinned; locally, rubicon
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
    "output.fileName": { treatment: "Warn", note: "Zip delivery is hosted-only; rubicon writes files." },
    "api.auth.schemes[].tokenHeader": { treatment: "Map", note: "`token-header` on the OAuth scheme." },
    "api.auth.schemes[].tokenPrefix": { treatment: "Map", note: "`token-prefix` on the OAuth scheme." },
    "api.auth.schemes[].flows[].refreshUrl": {
        treatment: "Map",
        note: "`refresh-token`, matched to a spec POST operation; FCG builds a refresh path when it resolves."
    },
    "api.auth.endpointSecurity": {
        treatment: "Map",
        note: "`api.auth: { endpoint-security: {} }`, with a warning that the CLI loses its auth registration."
    },
    "target.generatorVersion": {
        treatment: "Map",
        note: "Any version fern-cli-generator's versions.yml lists; 0.49.0 by default."
    },
    "target.sdkVersion": { treatment: "Map", note: "Printed as a hint: pass it with `fern generate --version`." },
    "target.apiName": { treatment: "Ignore", note: "Set by rubicon for validation; the Fern CLI names the workspace." }
};
