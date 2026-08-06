import { FernIr } from "@fern-fern/ir-sdk";

type IntermediateRepresentation = FernIr.IntermediateRepresentation;

/** The gem identity carried by a `rubygems` filesystem publish target. */
export interface FilesystemRubyGemsPublishTarget {
    version: string | undefined;
    packageName: string | undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null;
}

/**
 * Extracts the `rubygems` publish target from `ir.publishConfig` when the IR was
 * generated for local-file-system output.
 *
 * The `rubygems` variant of `PublishTarget` was added to the IR schema after the
 * currently pinned `@fern-fern/ir-sdk`, so it is narrowed structurally instead
 * of via the generated union types (`parseIR` passes unrecognized union
 * members through, preserving the raw shape). Once the pinned IR SDK includes
 * the `rubygems` variant, this can switch to the generated types.
 */
export function getFilesystemRubyGemsPublishTarget(
    ir: IntermediateRepresentation
): FilesystemRubyGemsPublishTarget | undefined {
    const publishConfig: unknown = ir.publishConfig;
    if (!isRecord(publishConfig) || publishConfig.type !== "filesystem") {
        return undefined;
    }
    const publishTarget: unknown = publishConfig.publishTarget;
    if (!isRecord(publishTarget) || publishTarget.type !== "rubygems") {
        return undefined;
    }
    return {
        version: typeof publishTarget.version === "string" ? publishTarget.version : undefined,
        packageName: typeof publishTarget.packageName === "string" ? publishTarget.packageName : undefined
    };
}
