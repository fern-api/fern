import { assertNever } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

export interface SwiftAvailabilityAnnotations {
    /**
     * A Swift attribute (for example, `@available(*, deprecated, message: "...")`)
     * that should be attached to the generated method declaration.
     */
    attribute?: swift.Method.Attribute;
    /**
     * A free-form doc comment line describing the availability status. Used when
     * Swift does not have a built-in attribute for a given status (for example,
     * `IN_DEVELOPMENT` and `PRE_RELEASE`).
     */
    docs?: string;
}

/**
 * Returns the annotations that should be emitted on a generated Swift method
 * for an endpoint's availability.
 *
 * - `DEPRECATED` -> `@available(*, deprecated, message: "...")` attribute.
 * - `IN_DEVELOPMENT` -> `@beta` doc comment warning.
 * - `PRE_RELEASE` -> `@beta` doc comment warning.
 * - `GENERAL_AVAILABILITY` (or undefined) -> no annotations.
 */
export function getAvailabilityAnnotations(
    availability: FernIr.Availability | undefined
): SwiftAvailabilityAnnotations | undefined {
    if (availability == null) {
        return undefined;
    }

    switch (availability.status) {
        case FernIr.AvailabilityStatus.Deprecated: {
            const args: swift.FunctionArgument[] = [
                swift.functionArgument({ value: swift.Expression.rawValue("*") }),
                swift.functionArgument({ value: swift.Expression.rawValue("deprecated") })
            ];
            if (availability.message != null) {
                args.push(
                    swift.functionArgument({
                        label: "message",
                        value: swift.Expression.stringLiteral(escapeSwiftStringLiteral(availability.message))
                    })
                );
            }
            return {
                attribute: {
                    name: "available",
                    arguments: args
                }
            };
        }
        case FernIr.AvailabilityStatus.InDevelopment: {
            const warning = "@beta This endpoint is in development and may change.";
            return {
                docs: availability.message != null ? `${warning} ${availability.message}` : warning
            };
        }
        case FernIr.AvailabilityStatus.PreRelease: {
            const warning = "@beta This endpoint is in pre-release and may change.";
            return {
                docs: availability.message != null ? `${warning} ${availability.message}` : warning
            };
        }
        case FernIr.AvailabilityStatus.GeneralAvailability:
            return undefined;
        default:
            assertNever(availability.status);
    }
}

function escapeSwiftStringLiteral(value: string): string {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t")
        .replace(/\0/g, "\\0");
}
