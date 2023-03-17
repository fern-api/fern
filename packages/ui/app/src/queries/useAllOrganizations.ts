import { Loadable } from "@fern-api/loadable";
import { TypedQueryKey, useTypedQuery } from "@fern-api/react-query-utils";
import { FernVenusApi } from "@fern-api/venus-api-sdk";
import { useVenus } from "../services/useVenus";

const QUERY_KEY = TypedQueryKey.of<FernVenusApi.OrganizationsPage, ["organizations"]>(["organizations"]);

export function useAllOrganizations(): Loadable<
    FernVenusApi.OrganizationsPage,
    FernVenusApi.user.getMyOrganizations.Error
> {
    const venus = useVenus();
    return useTypedQuery(QUERY_KEY, async () => {
        const response = await venus.user.getMyOrganizations({
            pageId: 0,
        });
        if (response.ok) {
            return response.body;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw response.error;
        }
    });
}
