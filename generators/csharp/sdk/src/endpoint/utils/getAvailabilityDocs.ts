import { assertNever } from "@fern-api/core-utils";
import { ast, type CSharp } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

type HttpEndpoint = FernIr.HttpEndpoint;

/**
 * Returns a doc comment line that describes the endpoint's availability, or `undefined`
 * when no extra documentation should be emitted.
 *
 * C# uses the native `[Obsolete]` attribute for deprecated endpoints (see
 * {@link getAvailabilityAnnotations}), so the deprecated case intentionally returns
 * `undefined` from this helper. For in-development and pre-release endpoints C# has no
 * equivalent native attribute, so we fall back to free-form doc text that mirrors the
 * wording used by the TypeScript generator.
 */
export function getAvailabilityDocs(endpoint: HttpEndpoint): string | undefined {
    const availability = endpoint.availability;
    if (availability == null) {
        return undefined;
    }

    switch (availability.status) {
        case FernIr.AvailabilityStatus.InDevelopment: {
            const warning = "@beta This endpoint is in development and may change.";
            return availability.message != null ? `${warning} ${availability.message}` : warning;
        }
        case FernIr.AvailabilityStatus.PreRelease: {
            const warning = "@beta This endpoint is in pre-release and may change.";
            return availability.message != null ? `${warning} ${availability.message}` : warning;
        }
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
 */
export function getEndpointSummary(endpoint: HttpEndpoint): string | undefined {
    const availabilityDocs = getAvailabilityDocs(endpoint);
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
 * based on its availability. Currently emits `[System.ObsoleteAttribute]` for deprecated
 * endpoints (with the availability message as its argument when present).
 */
export function getAvailabilityAnnotations({
    csharp,
    endpoint
}: {
    csharp: CSharp;
    endpoint: HttpEndpoint;
}): ast.Annotation[] {
    if (endpoint.availability?.status !== FernIr.AvailabilityStatus.Deprecated) {
        return [];
    }
    const reference = csharp.classReference({
        name: "ObsoleteAttribute",
        namespace: "System"
    });
    const message = endpoint.availability.message;
    const argument = message != null ? `"${escapeCsharpStringLiteral(message)}"` : undefined;
    return [csharp.annotation({ reference, argument })];
}

function escapeCsharpStringLiteral(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r/g, "\\r").replace(/\n/g, "\\n");
}
