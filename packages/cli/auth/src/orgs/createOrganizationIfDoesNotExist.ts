import { createVenusService } from "@fern-api/core";
import { TaskContext } from "@fern-api/task-context";
import { FernVenusApi } from "@fern-api/venus-api-sdk";

import { FernUserToken } from "../FernToken";
import { getOrganizationNameValidationError } from "./getOrganizationNameValidationError";

export async function createOrganizationIfDoesNotExist({
    organization,
    token,
    context
}: {
    organization: string;
    token: FernUserToken;
    context: TaskContext;
}): Promise<boolean> {
    const venus = createVenusService({ token: token.value });
    const getOrganizationResponse = await venus.organization.get(FernVenusApi.OrganizationId(organization));

    if (getOrganizationResponse.ok) {
        return false;
    }

    if (!getOrganizationResponse.ok) {
        const error = getOrganizationResponse.error;
        if (error.error === "UnauthorizedError") {
            context.failAndThrow("Failed to check if organization exists: Unauthorized");
        } else if (error.error === undefined && error.content != null) {
            // Handle network-level errors from the fetcher
            // fetcherError.reason can be: "status-code" | "non-json" | "timeout" | "unknown"
            const fetcherError = error.content;
            if (fetcherError.reason === "timeout") {
                // Network timeout - fail fast with clear message
                context.failAndThrow("Failed to check if organization exists: Request timed out");
            } else if (fetcherError.reason === "unknown") {
                // Other network errors (e.g., DNS failures, connection refused) - fail fast
                context.failAndThrow(`Failed to check if organization exists: ${fetcherError.errorMessage}`);
            }
            // For "status-code" and "non-json" errors, we continue to attempt org creation
            // since these indicate server responses rather than connectivity issues
        }
    }

    const validationError = getOrganizationNameValidationError(organization);
    if (validationError != null) {
        context.failAndThrow(validationError);
    }

    const createOrganizationResponse = await venus.organization.create({
        organizationId: FernVenusApi.OrganizationId(organization)
    });

    if (!createOrganizationResponse.ok) {
        const error = createOrganizationResponse.error;

        if (error.error === "UnauthorizedError") {
            context.failAndThrow("Failed to create organization: Unauthorized");
        } else if (error.error === "OrganizationAlreadyExistsError") {
            // Organization already exists (possibly created by another process) - treat as success
            return false;
        } else if (error.error === undefined && error.content != null) {
            // Handle network-level errors from the fetcher
            const fetcherError = error.content;
            if (fetcherError.reason === "timeout") {
                // Network timeout - fail fast with clear message
                context.failAndThrow("Failed to create organization: Request timed out");
            } else if (fetcherError.reason === "unknown") {
                // Other network errors (e.g., DNS failures, connection refused) - fail fast
                context.failAndThrow(`Failed to create organization: ${fetcherError.errorMessage}`);
            } else {
                // For "status-code" and "non-json" errors, report the full error
                context.failAndThrow(
                    `Failed to create organization: ${organization}`,
                    createOrganizationResponse.error
                );
            }
        } else {
            context.failAndThrow(`Failed to create organization: ${organization}`, createOrganizationResponse.error);
        }
    }
    return true;
}
