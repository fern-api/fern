import { createVenusService } from "@fern-api/core";
import { FernVenusApi } from "@fern-api/venus-api-sdk";

import { FernUserToken } from "../FernToken";

export type OrganizationCheckResult =
    | { type: "member" }
    | { type: "not-found" }
    | { type: "no-access" }
    | { type: "unknown-error" };

export async function checkOrganizationMembership({
    organization,
    token
}: {
    organization: string;
    token: FernUserToken;
}): Promise<OrganizationCheckResult> {
    const venus = createVenusService({ token: token.value });

    // First check if the user is a member of the organization.
    const isMemberResponse = await venus.organization.isMember(FernVenusApi.OrganizationId(organization));
    if (isMemberResponse.ok) {
        if (isMemberResponse.body) {
            return { type: "member" };
        }
        return { type: "no-access" };
    }

    // If the isMember call failed, check whether the org exists at all.
    const getResponse = await venus.organization.get(FernVenusApi.OrganizationId(organization));
    if (getResponse.ok) {
        // Org exists but isMember failed; treat as no access.
        return { type: "no-access" };
    }

    // Org doesn't exist (or we got an auth error checking it).
    let result: OrganizationCheckResult = { type: "unknown-error" };
    getResponse.error._visit({
        unauthorizedError: () => {
            result = { type: "no-access" };
        },
        _other: () => {
            result = { type: "not-found" };
        }
    });
    return result;
}
