import { Loadable } from "@fern-api/loadable";
import { TypedQueryKey, useTypedQuery } from "@fern-api/react-query-utils";
import { FernRegistry } from "@fern-fern/registry";
import { useCurrentOrganizationIdOrThrow } from "../routes/useCurrentOrganization";
import { useRegistryService } from "../services/useRegistryService";

const QUERY_KEY = TypedQueryKey.of<FernRegistry.GetAllApisResponse, ["apis"]>(["apis"]);

export function useAllApis(): Loadable<FernRegistry.GetAllApisResponse, FernRegistry.registry.getAllApiMetadata.Error> {
    const organizationId = useCurrentOrganizationIdOrThrow();
    const registryService = useRegistryService();
    return useTypedQuery(QUERY_KEY, async () => {
        const response = await registryService.registry.getAllApiMetadata(organizationId);
        if (response.ok) {
            return response.body;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw response.error;
        }
    });
}
