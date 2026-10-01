import type { SdkConfigIrV1 } from "@postman/sdk-config";

import type { RawSpecsManifest, RawSpecsManifestEntry } from "../rawSpecs.js";

type SourceSpec = SdkConfigIrV1["source"]["specs"][number];
type SourceSpecType = SourceSpec["specType"];

/**
 * Fern spec types the on-prem adapter can generate from.
 *
 * Narrower than the IR's own `specType` enum, which also admits `graphql`. The adapter rejects
 * anything outside `openapi | swagger | asyncapi | postman` (`ON_PREM_SPEC_TYPES` in its
 * `sdk-config-ir.ts`), and Fern additionally produces `protobuf` and `openrpc` manifests that have
 * no IR representation at all. Both cases are excluded here so the failure names the offending spec
 * on the host instead of surfacing as a `CONFIG_INVALID` exit from inside the container.
 */
const ON_PREM_SPEC_TYPE_BY_FERN_TYPE: Partial<Record<RawSpecsManifestEntry["type"], SourceSpecType>> = {
    openapi: "openapi",
    asyncapi: "asyncapi"
};

export declare namespace collectOnPremSourceSpecs {
    type Result = { success: true; specs: [SourceSpec, ...SourceSpec[]] } | { success: false; message: string };
}

/**
 * Projects the pre-processed raw specs manifest onto the IR's source specs, in the coordinates the
 * adapter will see.
 *
 * Rejects what the adapter cannot consume rather than passing it through. Supported sources remain
 * in manifest order because that is the generator's precedence contract for multi-spec composition.
 */
export function collectOnPremSourceSpecs(
    manifest: RawSpecsManifest | undefined,
    context: { generatorName: string }
): collectOnPremSourceSpecs.Result {
    const entries = manifest?.specs ?? [];
    if (entries.length === 0) {
        return {
            success: false,
            message:
                `Generator "${context.generatorName}" received no API specs. The Postman adapter generates ` +
                "from the API spec rather than the Fern IR, so the workspace must be an OpenAPI (OSS) workspace."
        };
    }

    const unsupported = entries.filter((entry) => ON_PREM_SPEC_TYPE_BY_FERN_TYPE[entry.type] == null);
    if (unsupported.length > 0) {
        const described = unsupported.map((entry) => `${entry.specPath} (${entry.type})`).join(", ");
        return {
            success: false,
            message:
                `Generator "${context.generatorName}" cannot generate from ${described}. The Postman adapter ` +
                `consumes OpenAPI and AsyncAPI specs; ${[...new Set(unsupported.map((entry) => entry.type))].join(", ")} ` +
                "is not supported on-prem."
        };
    }

    const specs = entries.map(
        (entry): SourceSpec => ({
            specUrl: entry.specPath,
            // Checked above; the filter guarantees a mapping exists for every remaining entry.
            specType: ON_PREM_SPEC_TYPE_BY_FERN_TYPE[entry.type] as SourceSpecType,
            ...(entry.namespace != null ? { namespace: entry.namespace } : {}),
            ...(entry.apiImportSettings != null ? { apiImportSettings: entry.apiImportSettings } : {})
        })
    );

    return { success: true, specs: specs as [SourceSpec, ...SourceSpec[]] };
}
