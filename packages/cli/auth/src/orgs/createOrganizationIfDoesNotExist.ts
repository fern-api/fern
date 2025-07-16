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
    // if failed response, assume organization does not exist

    const validationError = getOrganizationNameValidationError(organization);
    if (validationError != null) {
        context.failAndThrow(validationError);
    }
    const createOrganizationResponse = await venus.organization.create({
        organizationId: FernVenusApi.OrganizationId(organization)
    });
    if (!createOrganizationResponse.ok) {
        context.failAndThrow(`Failed to create organization: ${organization}`, createOrganizationResponse.error);
    }
    return true;
}
