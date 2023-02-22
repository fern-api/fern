import { Loadable } from "@fern-api/loadable";
import { TypedQueryKey, useTypedQuery } from "@fern-api/react-query-utils";
import { FernRegistry } from "@fern-fern/registry";
import { REGISTRY_SERVICE } from "../services/getRegistryService";

const QUERY_KEY = TypedQueryKey.of<FernRegistry.GetAllApisResponse, ["apis"]>(["apis"]);

export function useAllApis(): Loadable<FernRegistry.GetAllApisResponse, FernRegistry.registry.getAllApis.Error> {
    return useTypedQuery(QUERY_KEY, async () => {
        const response = await REGISTRY_SERVICE.registry.getAllApis();
        if (response.ok) {
            return response.body;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw response.error;
        }
    });
}
