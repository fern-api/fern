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

export function convertDeclaration(schema: string | RawSchemas.DeclarationSchema): Declaration {
    if (typeof schema === "string") {
        return DEFAULT_DECLARATION;
    }
    return {
        docs: schema.docs,
        availability: {
            status: convertAvailabilityStatus(
                typeof schema.availability === "string" ? schema.availability : schema.availability?.status
            ),
            message: typeof schema.availability !== "string" ? schema.availability?.message : undefined,
        },
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
