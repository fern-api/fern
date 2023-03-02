import { Loadable } from "@fern-api/loadable";
import { TypedQueryKey, useNullableQuery, useTypedQuery } from "@fern-api/react-query-utils";
import { FernVenusApi } from "@fern-api/venus-api-sdk";
import { useCurrentOrganizationId } from "../routes/useCurrentOrganization";
import { useVenus } from "../services/useVenus";

export function useCurrentOrganization(): Loadable<FernVenusApi.Organization, FernVenusApi.organization.get.Error> {
    const organizationId = useCurrentOrganizationId();
    const venus = useVenus();
    return useNullableQuery<FernVenusApi.Organization, FernVenusApi.organization.get.Error>(
        organizationId != null ? buildQueryKey({ organizationId }) : undefined,
        async () => {
            if (organizationId == null) {
                throw new Error("organizationId is not defined.");
            }
            const response = await venus.organization.get(organizationId);
            if (response.ok) {
                return response.body;
            } else {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw response.error;
            }
        }
    );
}

export function useOrganization(
    organizationId: FernVenusApi.OrganizationId
): Loadable<FernVenusApi.Organization, FernVenusApi.organization.get.Error> {
    const venus = useVenus();
    return useTypedQuery<FernVenusApi.Organization, FernVenusApi.organization.get.Error>(
        buildQueryKey({ organizationId }),
        async () => {
            const response = await venus.organization.get(organizationId);
            if (response.ok) {
                return response.body;
            } else {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw response.error;
            }
        }
    );
}

function buildQueryKey({
    organizationId,
}: {
    organizationId: FernVenusApi.OrganizationId;
}): TypedQueryKey<FernVenusApi.Organization> {
    return TypedQueryKey.of(["organization", organizationId]);
}
