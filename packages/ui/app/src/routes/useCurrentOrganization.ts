import { FernVenusApi } from "@fern-api/venus-api-sdk";
import { FernRegistry } from "@fern-fern/registry";
import { matchPath, useLocation } from "react-router-dom";
import { FernRoutes } from ".";

export function useCurrentOrganizationId(): (FernRegistry.OrgId & FernVenusApi.OrganizationId) | undefined {
    const location = useLocation();
    const match = matchPath(`${FernRoutes.ORGANIZATION.absolutePath}/*`, location.pathname);
    if (match?.params.ORGANIZATION_ID == null) {
        return undefined;
    }
    return match.params.ORGANIZATION_ID as FernRegistry.OrgId & FernVenusApi.OrganizationId;
}

export function useCurrentOrganizationIdOrThrow(): FernRegistry.OrgId & FernVenusApi.OrganizationId {
    const organizationId = useCurrentOrganizationId();
    if (organizationId == null) {
        throw new Error("No organization in URL");
    }
    return organizationId;
}
