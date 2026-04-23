import { createVenusService } from "@fern-api/core";
import { TaskContext } from "@fern-api/task-context";
import { FernUserToken } from "../FernToken.js";
import { getOrganizationNameValidationError } from "./getOrganizationNameValidationError.js";

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
    const getOrganizationResponse = await venus.organization.get(organization);

    if (getOrganizationResponse.ok) {
        return false;
    }

    // Only treat HTTP 404 as "organization does not exist". Any other failure
    // (unauthorized, 5xx, timeout) means we can't tell — surfacing the real
    // error is better than attempting a create that will fail with a
    // misleading OrganizationAlreadyExistsError when the org already exists.
    let organizationIsMissing = false;
    getOrganizationResponse.error._visit({
        unauthorizedError: () => {
            context.failAndThrow(
                `You do not have access to organization "${organization}". ` +
                    `Run 'fern auth login' as a user with access, or contact an admin.`
            );
        },
        _other: (fetcherError) => {
            if (fetcherError.reason === "status-code" && fetcherError.statusCode === 404) {
                organizationIsMissing = true;
                return;
            }
            let detail: string;
            switch (fetcherError.reason) {
                case "status-code":
                case "non-json":
                case "body-is-null":
                    detail = `status ${fetcherError.statusCode}`;
                    break;
                case "timeout":
                    detail = "request timed out";
                    break;
                case "unknown":
                    detail = fetcherError.errorMessage;
                    break;
            }
            context.failAndThrow(
                `Failed to check whether organization "${organization}" exists (${detail}). ` +
                    `Please retry, and contact support@buildwithfern.com if the issue persists.`,
                fetcherError
            );
        }
    });

    if (!organizationIsMissing) {
        // Any non-404 error path already called failAndThrow above.
        return false;
    }

    const validationError = getOrganizationNameValidationError(organization);
    if (validationError != null) {
        context.failAndThrow(validationError);
    }
    const createOrganizationResponse = await venus.organization.create({
        organizationId: organization
    });
    if (!createOrganizationResponse.ok) {
        context.failAndThrow(`Failed to create organization: ${organization}`, createOrganizationResponse.error);
    }
    return true;
}
