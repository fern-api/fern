import { Loadable } from "@fern-api/loadable";
import { TypedQueryKey, useTypedQuery } from "@fern-api/react-query-utils";
import { FernRegistry } from "@fern-fern/registry";
import { useParams } from "react-router-dom";
import { FernRoutes } from "../../routes";
import { REGISTRY_SERVICE } from "../../services/getRegistryService";

export function useCurrentApiDefinition(): Loadable<
    FernRegistry.ApiDefinition,
    FernRegistry.registry.getApiForEnvironment.Error
> {
    const {
        [FernRoutes.API_DEFINITION.parameters.API_ID]: apiIdParam,
        [FernRoutes.API_DEFINITION.parameters.ENVIRONMENT_ID]: environmentIdParam,
    } = useParams();

    if (apiIdParam == null) {
        throw new Error("API ID is not defined");
    }
    if (environmentIdParam == null) {
        throw new Error("Environment ID is not defined");
    }

    const apiId = FernRegistry.ApiId(apiIdParam);
    const environmentId = FernRegistry.EnvironmentId(environmentIdParam);

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
