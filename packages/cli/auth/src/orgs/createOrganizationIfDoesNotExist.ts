import { assertNever } from "@fern-api/core-utils";
import { createVenusService } from "@fern-api/services";
import { TaskContext } from "@fern-api/task-context";
import { FernToken } from "../FernToken";
import { getOrganizationNameValidationError } from "./getOrganizationNameValidationError";

export async function createOrganizationIfDoesNotExist({
    organization,
    token,
    context,
}: {
    organization: string;
    token: FernToken;
    context: TaskContext;
}): Promise<boolean> {
    const venus = createVenusService({ token: token.value });
    const getOrganizationResponse = await venus.organization.get(organization);

    if (getOrganizationResponse.ok) {
        return false;
    }
    // if failed response, assume organization does not exist

    switch (token.type) {
        case "organization":
            return context.failAndThrow("Cannot create organization using an access token.");
        case "user": {
            const validationError = getOrganizationNameValidationError(organization);
            if (validationError != null) {
                context.failAndThrow(validationError);
            }
            const createOrganizationResponse = await venus.organization.create({
                organizationId: organization,
            });
            if (!createOrganizationResponse.ok) {
                context.failAndThrow(
                    `Failed to create organization: ${organization}`,
                    createOrganizationResponse.error
                );
            }
            return true;
        }
        default:
            assertNever(token);
    }
}
