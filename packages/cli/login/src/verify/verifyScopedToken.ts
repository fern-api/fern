import { createVenusService } from "@fern-api/services";

export async function verifyScopedToken(token: string): Promise<boolean> {
    const venus = createVenusService({ token });
    const response = await venus.organization.getMyOrganizationFromScopedToken();
    return response.ok;
}
