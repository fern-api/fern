import { Loadable } from "@fern-api/loadable";
import { TypedQueryKey, useTypedQuery } from "@fern-api/react-query-utils";
import { FernRegistry } from "@fern-fern/registry";
import * as FernRegistryCore from "@fern-fern/registry/core";
import { REGISTRY_SERVICE } from "../../services/getRegistryService";

const QUERY_KEY = TypedQueryKey.of<
    FernRegistryCore.APIResponse<FernRegistry.GetAllEnvironmentsResponse, FernRegistry.environment.getAll.Error>,
    ["environments"]
>(["environments"]);

export function useAllEnvironments(): Loadable<
    FernRegistryCore.APIResponse<FernRegistry.GetAllEnvironmentsResponse, FernRegistry.environment.getAll.Error>
> {
    return useTypedQuery(QUERY_KEY, () => REGISTRY_SERVICE.environment.getAll());
}
