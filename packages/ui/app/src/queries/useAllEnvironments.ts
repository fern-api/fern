import { Loadable } from "@fern-api/loadable";
import { TypedQueryKey, useTypedQuery } from "@fern-api/react-query-utils";
import { FernRegistry } from "@fern-fern/registry";
import { useRegistryService } from "../services/useRegistryService";

const QUERY_KEY = TypedQueryKey.of<FernRegistry.GetAllEnvironmentsResponse, ["environments"]>(["environments"]);

export function useAllEnvironments(): Loadable<
    FernRegistry.GetAllEnvironmentsResponse,
    FernRegistry.environment.getAll.Error
> {
    const registryService = useRegistryService();
    return useTypedQuery(QUERY_KEY, async () => {
        const response = await registryService.environment.getAll(FernRegistry.OrgId("fern"));
        if (response.ok) {
            return response.body;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw response.error;
        }
    });
}
