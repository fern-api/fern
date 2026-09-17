import { basename } from "node:path";
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

    interface Context {
        generatorName: string;
        /**
         * Whether the image being run generates from every spec rather than only `source.specs[0]`.
         *
         * Defaults to `false`, which is what every image published before the capability label did.
         */
        supportsMultiSpec?: boolean;
    }
}

/**
 * Projects the pre-processed raw specs manifest onto the IR's source specs, in the coordinates the
 * adapter will see.
 *
 * Rejects what the adapter cannot consume rather than passing it through. An image that reads
 * `source.specs[0]` and ignores the rest (`requirePrimarySpec`) would otherwise turn a multi-spec
 * workspace into an SDK covering one spec that exits zero -- a silently wrong SDK, which is worse
 * than a refusal naming the specs involved. An image that declares it consumes all of them gets all
 * of them, in manifest order.
 */
export function collectOnPremSourceSpecs(
    manifest: RawSpecsManifest | undefined,
    context: collectOnPremSourceSpecs.Context
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

    if (entries.length > 1 && !context.supportsMultiSpec) {
        const described = entries.map((entry) => entry.specPath).join(", ");
        return {
            success: false,
            message:
                `Generator "${context.generatorName}" received ${entries.length} API specs (${described}), and this ` +
                "image has not declared multi-spec support. Older adapters resolve only the first spec. " +
                "Upgrade the generator to an image that declares multi-spec support, or reduce the " +
                "workspace to one spec for this generator."
        };
    }

    const specs = entries.map(
        (entry): SourceSpec => ({
            ...(entries.length > 1 ? { id: basename(entry.specPath) } : {}),
            specUrl: entry.specPath,
            // Checked above; the filter guarantees a mapping exists for every remaining entry.
            specType: ON_PREM_SPEC_TYPE_BY_FERN_TYPE[entry.type] as SourceSpecType,
            ...(entry.namespace != null ? { namespace: entry.namespace } : {}),
            ...(entry.apiImportSettings != null ? { apiImportSettings: entry.apiImportSettings } : {})
        })
    );

    return { success: true, specs: specs as [SourceSpec, ...SourceSpec[]] };
}
