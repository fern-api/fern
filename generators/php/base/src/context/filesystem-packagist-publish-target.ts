import { FernIr } from "@fern-fern/ir-sdk";

type IntermediateRepresentation = FernIr.IntermediateRepresentation;

/** The Composer package identity carried by a `packagist` filesystem publish target. */
export interface FilesystemPackagistPublishTarget {
    version: string | undefined;
    packageName: string | undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null;
}

/**
 * Extracts the `packagist` publish target from `ir.publishConfig` when the IR was
 * generated for local-file-system output.
 *
 * The `packagist` variant of `PublishTarget` was added to the IR schema after the
 * currently pinned `@fern-fern/ir-sdk`, so it is narrowed structurally instead
 * of via the generated union types (`parseIR` passes unrecognized union
 * members through, preserving the raw shape). Once the pinned IR SDK includes
 * the `packagist` variant, this can switch to the generated types.
 */
export function getFilesystemPackagistPublishTarget(
    ir: IntermediateRepresentation
): FilesystemPackagistPublishTarget | undefined {
    const publishConfig: unknown = ir.publishConfig;
    if (!isRecord(publishConfig) || publishConfig.type !== "filesystem") {
        return undefined;
    }
    const publishTarget: unknown = publishConfig.publishTarget;
    if (!isRecord(publishTarget) || publishTarget.type !== "packagist") {
        return undefined;
    }
    return {
        version: typeof publishTarget.version === "string" ? publishTarget.version : undefined,
        packageName: typeof publishTarget.packageName === "string" ? publishTarget.packageName : undefined
    };
}
