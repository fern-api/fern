import { assertNever } from "@fern-api/core-utils";
import { ast, type CSharp } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { getDiagnosticId } from "./getAvailabilityDiagnosticId.js";

type HttpEndpoint = FernIr.HttpEndpoint;

/**
 * Returns a doc line to prepend to the XML `<summary>` for an endpoint's availability,
 * or `undefined` when no extra summary text should be emitted.
 *
 * All currently-recognized availability tiers are surfaced via attributes rather than
 * doc text ({@link getAvailabilityAnnotations}), so this helper returns `undefined` for
 * every tier and is kept for future availability-related summary annotations.
 *
 * Gated behind the `generateAvailabilityAnnotations` custom config flag — when disabled,
 * always returns `undefined` so the generator's output is unchanged.
 */
export function getAvailabilityDocs({
    endpoint,
    enabled
}: {
    endpoint: HttpEndpoint;
    enabled: boolean;
}): string | undefined {
    if (!enabled) {
        return undefined;
    }
    const availability = endpoint.availability;
    if (availability == null) {
        return undefined;
    }

    switch (availability.status) {
        case FernIr.AvailabilityStatus.InDevelopment:
        case FernIr.AvailabilityStatus.PreRelease:
        case FernIr.AvailabilityStatus.Deprecated:
        case FernIr.AvailabilityStatus.GeneralAvailability:
            return undefined;
        default:
            assertNever(availability.status);
    }
}

/**
 * Combines the endpoint's existing docs (if any) with any additional availability-related
 * doc text that should be surfaced in the generated XML doc summary.
 *
 * When the `generateAvailabilityAnnotations` flag is disabled, this returns the endpoint's
 * existing docs unchanged (i.e. the generator's pre-flag behavior).
 */
export function getEndpointSummary({
    endpoint,
    enabled
}: {
    endpoint: HttpEndpoint;
    enabled: boolean;
}): string | undefined {
    const availabilityDocs = getAvailabilityDocs({ endpoint, enabled });
    if (availabilityDocs == null) {
        return endpoint.docs;
    }
    if (endpoint.docs == null) {
        return availabilityDocs;
    }
    return `${availabilityDocs}\n\n${endpoint.docs}`;
}

/**
 * Returns annotations that should be applied to the generated method for this endpoint
 * based on its availability:
 * - `Deprecated` → `[System.ObsoleteAttribute(message)]`
 * - `InDevelopment` / `PreRelease` →
 *   `[System.Diagnostics.CodeAnalysis.ExperimentalAttribute("{prefix}{NNNN}")]`
 *
 * Type names are emitted fully-qualified so the output is robust against customers that
 * disable implicit usings.
 *
 * Gated behind the `generateAvailabilityAnnotations` custom config flag — when disabled,
 * always returns `[]` so the generator's output is unchanged.
 */
export function getAvailabilityAnnotations({
    csharp,
    endpoint,
    enabled,
    diagnosticPrefix
}: {
    csharp: CSharp;
    endpoint: HttpEndpoint;
    enabled: boolean;
    diagnosticPrefix: string;
}): ast.Annotation[] {
    if (!enabled) {
        return [];
    }
    const availability = endpoint.availability;
    if (availability == null) {
        return [];
    }
    switch (availability.status) {
        case FernIr.AvailabilityStatus.Deprecated: {
            const reference = csharp.classReference({
                name: "ObsoleteAttribute",
                namespace: "System",
                fullyQualified: true
            });
            const argument =
                availability.message != null ? `"${escapeCsharpStringLiteral(availability.message)}"` : undefined;
            return [csharp.annotation({ reference, argument })];
        }
        case FernIr.AvailabilityStatus.InDevelopment:
        case FernIr.AvailabilityStatus.PreRelease: {
            const diagnosticId = getDiagnosticId({ status: availability.status, prefix: diagnosticPrefix });
            if (diagnosticId == null) {
                return [];
            }
            const reference = csharp.classReference({
                name: "ExperimentalAttribute",
                namespace: "System.Diagnostics.CodeAnalysis",
                fullyQualified: true
            });
            return [csharp.annotation({ reference, argument: `"${diagnosticId}"` })];
        }
        case FernIr.AvailabilityStatus.GeneralAvailability:
            return [];
        default:
            assertNever(availability.status);
    }
}

function escapeCsharpStringLiteral(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r/g, "\\r").replace(/\n/g, "\\n");
}
