import { createVenusService } from "@fern-api/services";
import { TaskContext } from "@fern-api/task-context";
import { FernUserToken } from "./FernToken";

export async function createOrganizationIfDoesNotExist({
    organization,
    token,
    context,
}: {
    organization: string;
    token: FernUserToken;
    context: TaskContext;
}): Promise<void> {
    const venus = createVenusService({ token: token.value });
    const getOrganizationResponse = await venus.organization.get({
        orgId: organization,
    });

    if (getOrganizationResponse.ok) {
        return;
    }
    // if failed response, assume organization does not exist

    const createOrganizationResponse = await venus.organization.create({
        organizationId: organization,
    });
    if (!createOrganizationResponse.ok) {
        context.failAndThrow(`Failed to create organization: ${organization}`);
    }
}
