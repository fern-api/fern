import { createVenusService } from "@fern-api/core";

import { FernOrganizationToken } from "../FernToken";

export async function verifyAccessToken(token: FernOrganizationToken): Promise<boolean> {
    const venus = createVenusService({ token: token.value });
    const response = await venus.organization.getMyOrganizationFromScopedToken();
    return response.ok;
}
