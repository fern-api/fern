import { createVenusService } from "@fern-api/core";
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
    const isMemberResponse = await venus.organization.isMember(organization);
    if (isMemberResponse.ok && isMemberResponse.body) {
        return { type: "member" };
    }

    // Either the isMember call failed or the user is not a member.
    // Check whether the org exists at all.
    const getResponse = await venus.organization.get(organization);
    if (getResponse.ok) {
        // Org exists but user is not a member.
        return { type: "no-access" };
    }

    // Org doesn't exist (or we got an auth error checking it).
    let result: OrganizationCheckResult = { type: "unknown-error" };
    getResponse.error._visit({
        unauthorizedError: () => {
            result = { type: "no-access" };
        },
        _other: () => {
            // TODO: We should actually send a 404 to more clearly communicate a not-found error.
            // Otherwise, internal server errors would be mistaken for not-found errors.
            result = { type: "not-found" };
        }
    });
    return result;
}
