import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { AvailabilityStatus, Declaration } from "@fern-fern/ir-model/declaration";

const DEFAULT_DECLARATION = {
    docs: undefined,
    availability: {
        status: convertAvailabilityStatus(undefined),
        message: undefined,
    },
};

export function convertDeclaration(schema: string | RawSchemas.DeclarationSchema): {
    declaration: Declaration;
    audiences?: string[];
} {
    if (typeof schema === "string") {
        return {
            declaration: DEFAULT_DECLARATION,
        };
    }
    return {
        declaration: {
            docs: schema.docs,
            availability: {
                status: convertAvailabilityStatus(
                    typeof schema.availability === "string" ? schema.availability : schema.availability?.status
                ),
                message: typeof schema.availability !== "string" ? schema.availability?.message : undefined,
            },
        },
        audiences: schema.audiences,
    };
}

function convertAvailabilityStatus(status: RawSchemas.AvailabilityStatusSchema | undefined): AvailabilityStatus {
    if (status == null) {
        return AvailabilityStatus.GeneralAvailability;
    }
    switch (status) {
        case "in-development":
            return AvailabilityStatus.InDevelopment;
        case "pre-release":
            return AvailabilityStatus.PreRelease;
        case "deprecated":
            return AvailabilityStatus.Deprecated;
        default:
            assertNever(status);
    }
}
