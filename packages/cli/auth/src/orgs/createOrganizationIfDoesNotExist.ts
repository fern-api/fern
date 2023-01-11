import { createVenusService } from "@fern-api/services";
import { TaskContext } from "@fern-api/task-context";
import { FernUserToken } from "../FernToken";
import { getOrganizationNameValidationError } from "./getOrganizationNameValidationError";

export async function createOrganizationIfDoesNotExist({
    organization,
    token,
    context,
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
    // if failed response, assume organization does not exist

    const validationError = getOrganizationNameValidationError(organization);
    if (validationError != null) {
        context.failAndThrow(validationError);
    }
    const createOrganizationResponse = await venus.organization.create({
        organizationId: organization,
    });
    if (!createOrganizationResponse.ok) {
        context.failAndThrow(`Failed to create organization: ${organization}`, createOrganizationResponse.error);
    }
    return true;
}
