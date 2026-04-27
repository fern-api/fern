import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";

import { IrMigrationContext } from "../../IrMigrationContext.js";
import { IrSerialization } from "../../ir-serialization/index.js";
import { IrVersions } from "../../ir-versions/index.js";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration.js";

export const V67_TO_V66_MIGRATION: IrMigration<
    IrVersions.V67.ir.IntermediateRepresentation,
    IrVersions.V66.ir.IntermediateRepresentation
> = {
    laterVersion: "v67",
    earlierVersion: "v66",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V66.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "passthrough",
            skipValidation: true
        }),
    migrateBackwards: (
        v67: IrVersions.V67.ir.IntermediateRepresentation,
        _context: IrMigrationContext
    ): IrVersions.V66.ir.IntermediateRepresentation => {
        return downcastAvailabilityRecursive(v67) as unknown as IrVersions.V66.ir.IntermediateRepresentation;
    }
};

// V66 does not know about ALPHA, BETA, PREVIEW, or LEGACY, so map them to the closest
// pre-existing v66 availability status for backward compatibility with older generators.
function downcastAvailabilityStatus(status: IrVersions.V67.AvailabilityStatus): IrVersions.V66.AvailabilityStatus {
    switch (status) {
        case "IN_DEVELOPMENT":
        case "ALPHA":
            return IrVersions.V66.AvailabilityStatus.InDevelopment;
        case "PRE_RELEASE":
        case "BETA":
        case "PREVIEW":
            return IrVersions.V66.AvailabilityStatus.PreRelease;
        case "GENERAL_AVAILABILITY":
            return IrVersions.V66.AvailabilityStatus.GeneralAvailability;
        case "DEPRECATED":
        case "LEGACY":
            return IrVersions.V66.AvailabilityStatus.Deprecated;
        default:
            return assertNever(status);
    }
}

const V67_AVAILABILITY_STATUSES = new Set<string>([
    "IN_DEVELOPMENT",
    "PRE_RELEASE",
    "GENERAL_AVAILABILITY",
    "DEPRECATED",
    "ALPHA",
    "BETA",
    "PREVIEW",
    "LEGACY"
]);

// Restricted to the known V67 enum values so we do not match user JSON payloads
// (e.g. raw `jsonExample` fields) that happen to contain an `availability` key
// with an unrelated `status` string.
function isAvailabilityShape(value: unknown): value is { status: IrVersions.V67.AvailabilityStatus; message?: string } {
    if (value == null || typeof value !== "object") {
        return false;
    }
    const status = (value as { status?: unknown }).status;
    return typeof status === "string" && V67_AVAILABILITY_STATUSES.has(status);
}

// The only structural difference between V67 and V66 is the AvailabilityStatus enum
// (V67 added ALPHA, BETA, PREVIEW, LEGACY). Walk the IR tree and downcast every
// availability value so the resulting object is a structurally valid V66 IR.
function downcastAvailabilityRecursive<T>(value: T): T {
    if (value == null || typeof value !== "object") {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((item) => downcastAvailabilityRecursive(item)) as unknown as T;
    }
    if (value instanceof Set) {
        return new Set(Array.from(value, (item) => downcastAvailabilityRecursive(item))) as unknown as T;
    }
    if (value instanceof Map) {
        return new Map(Array.from(value, ([k, v]) => [k, downcastAvailabilityRecursive(v)] as const)) as unknown as T;
    }
    // Preserve non-plain objects (Date, Buffer, URL, etc.) as-is so that downstream
    // serialization keeps their runtime type rather than turning them into `{}`.
    const proto = Object.getPrototypeOf(value);
    if (proto !== null && proto !== Object.prototype) {
        return value;
    }
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        if (key === "availability" && isAvailabilityShape(child)) {
            result[key] = {
                ...child,
                status: downcastAvailabilityStatus(child.status)
            };
        } else {
            result[key] = downcastAvailabilityRecursive(child);
        }
    }
    return result as T;
}
