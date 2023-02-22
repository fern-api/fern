import { Loadable } from "@fern-api/loadable";
import { TypedQueryKey, useTypedQuery } from "@fern-api/react-query-utils";
import { FernRegistry } from "@fern-fern/registry";
import { REGISTRY_SERVICE } from "../services/getRegistryService";

export function useApiMetadata(
    apiId: FernRegistry.ApiId
): Loadable<FernRegistry.ApiMetadata, FernRegistry.registry.getApiMetadata.Error> {
    return useTypedQuery<FernRegistry.ApiMetadata, FernRegistry.registry.getApiMetadata.Error>(
        buildQueryKey({ apiId }),
        async () => {
            const response = await REGISTRY_SERVICE.registry.getApiMetadata(apiId);
            if (response.ok) {
                return response.body;
            } else {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw response.error;
            }
        }
    );
}

function buildQueryKey({ apiId }: { apiId: FernRegistry.ApiId }): TypedQueryKey<FernRegistry.ApiMetadata> {
    return TypedQueryKey.of(["api", apiId]);
}
