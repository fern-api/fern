import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Availability, AvailabilityStatus, Declaration } from "@fern-api/ir-sdk";

import { formatDocs } from "../formatDocs";

const DEFAULT_DECLARATION = {
    docs: undefined,
    availability: undefined
};

export function convertDeclaration(declaration: string | RawSchemas.DeclarationSchema): Declaration {
    if (typeof declaration === "string") {
        return DEFAULT_DECLARATION;
    }
    return {
        docs: formatDocs(declaration.docs),
        availability: convertAvailability(declaration.availability)
    };
}

export function convertAvailability(
    availability: RawSchemas.AvailabilitySchema | RawSchemas.AvailabilityStatusSchema | undefined
): Availability | undefined {
    if (availability == null) {
        return undefined;
    }
    return {
        status: convertAvailabilityStatus(typeof availability === "string" ? availability : availability.status),
        message: typeof availability !== "string" ? availability.message : undefined
    };
}

export function getAudiences(schema: RawSchemas.TypeDeclarationSchema): string[] {
    if (typeof schema === "string") {
        return [];
    }
    return schema.audiences ?? [];
}

function convertAvailabilityStatus(status: RawSchemas.AvailabilityStatusSchema): AvailabilityStatus {
    switch (status) {
        case "in-development":
            return AvailabilityStatus.InDevelopment;
        case "pre-release":
            return AvailabilityStatus.PreRelease;
        case "deprecated":
            return AvailabilityStatus.Deprecated;
        case "generally-available":
            return AvailabilityStatus.GeneralAvailability;
        default:
            assertNever(status);
    }
}
