import { Loadable } from "@fern-api/loadable";
import { TypedQueryKey, useTypedQuery } from "@fern-api/react-query-utils";
import { FernRegistry } from "@fern-fern/registry";
import { REGISTRY_SERVICE } from "../../services/getRegistryService";

export function useApiDefinition({
    apiId,
    environmentId,
}: {
    apiId: FernRegistry.ApiId;
    environmentId: FernRegistry.EnvironmentId;
}): Loadable<FernRegistry.ApiDefinition, FernRegistry.registry.getApiForEnvironment.Error> {
    return useTypedQuery<FernRegistry.ApiDefinition, FernRegistry.registry.getApiForEnvironment.Error>(
        buildQueryKey({ apiId, environmentId }),
        async () => {
            const response = await REGISTRY_SERVICE.registry.getApiForEnvironment(apiId, environmentId);
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
    apiId,
    environmentId,
}: {
    apiId: FernRegistry.ApiId;
    environmentId: FernRegistry.EnvironmentId;
}): TypedQueryKey<FernRegistry.ApiDefinition> {
    return TypedQueryKey.of(["api", apiId, "environment", environmentId]);
}
