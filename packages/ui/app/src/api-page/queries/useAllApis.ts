import { Loadable } from "@fern-api/loadable";
import { TypedQueryKey, useTypedQuery } from "@fern-api/react-query-utils";
import { FernRegistry } from "@fern-fern/registry";
import * as FernRegistryCore from "@fern-fern/registry/core";
import { REGISTRY_SERVICE } from "../../services/getRegistryService";

const QUERY_KEY = TypedQueryKey.of<
    FernRegistryCore.APIResponse<FernRegistry.GetAllApisResponse, FernRegistry.registry.getAllApis.Error>,
    ["apis"]
>(["apis"]);

export function useAllApis(): Loadable<
    FernRegistryCore.APIResponse<FernRegistry.GetAllApisResponse, FernRegistry.registry.getAllApis.Error>
> {
    return useTypedQuery(QUERY_KEY, () => REGISTRY_SERVICE.registry.getAllApis());
}
