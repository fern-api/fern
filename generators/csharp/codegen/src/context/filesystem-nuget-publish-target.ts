import { FernIr } from "@fern-fern/ir-sdk";

type IntermediateRepresentation = FernIr.IntermediateRepresentation;

/** The package identity carried by a `nuget` filesystem publish target. */
export interface FilesystemNugetPublishTarget {
    version: string | undefined;
    packageName: string | undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null;
}

/**
 * Extracts the `nuget` publish target from `ir.publishConfig` when the IR was
 * generated for local-file-system output.
 *
 * The `nuget` variant of `PublishTarget` was added to the IR schema after the
 * currently pinned `@fern-fern/ir-sdk`, so it is narrowed structurally instead
 * of via the generated union types (`parseIR` passes unrecognized union
 * members through, preserving the raw shape). Once the pinned IR SDK includes
 * the `nuget` variant, this can switch to the generated types.
 */
export function getFilesystemNugetPublishTarget(
    ir: IntermediateRepresentation
): FilesystemNugetPublishTarget | undefined {
    const publishConfig: unknown = ir.publishConfig;
    if (!isRecord(publishConfig) || publishConfig.type !== "filesystem") {
        return undefined;
    }
    const publishTarget: unknown = publishConfig.publishTarget;
    if (!isRecord(publishTarget) || publishTarget.type !== "nuget") {
        return undefined;
    }
    return {
        version: typeof publishTarget.version === "string" ? publishTarget.version : undefined,
        packageName: typeof publishTarget.packageName === "string" ? publishTarget.packageName : undefined
    };
}
