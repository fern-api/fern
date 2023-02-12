import { Loadable } from "@fern-api/loadable";
import { TypedQueryKey, useNullableQuery } from "@fern-api/react-query-utils";
import { FernRegistry } from "@fern-fern/registry";
import * as FernRegistryCore from "@fern-fern/registry/core";
import { useParams } from "react-router-dom";
import { Routes } from "../../routes";
import { REGISTRY_SERVICE } from "../../services/getRegistryService";

export function useCurrentApiDefinition(): Loadable<
    FernRegistryCore.APIResponse<FernRegistry.ApiDefinition, FernRegistry.registry.getApiForEnvironment.Error>
> {
    const {
        [Routes.API_DEFINITION.parameters.API_ID]: apiIdParam,
        [Routes.API_DEFINITION.parameters.ENVIRONMENT]: environmentIdParam,
    } = useParams();

    const apiId = apiIdParam != null ? FernRegistry.ApiId(apiIdParam) : undefined;
    const environmentId = environmentIdParam != null ? FernRegistry.EnvironmentId(environmentIdParam) : undefined;

    return useNullableQuery(
        apiId != null && environmentId != null ? buildQueryKey({ apiId, environmentId }) : undefined,
        () => {
            if (apiId == null) {
                throw new Error("Cannot fetch API definition because API ID is not defined.");
            }
            if (environmentId == null) {
                throw new Error("Cannot fetch API definition because Environment ID is not defined.");
            }
            return REGISTRY_SERVICE.registry.getApiForEnvironment(apiId, environmentId);
        }
    );
}

function buildQueryKey({
    apiId,
    environmentId,
}: {
    apiId: FernRegistry.ApiId;
    environmentId: FernRegistry.EnvironmentId;
}): TypedQueryKey<
    FernRegistryCore.APIResponse<FernRegistry.ApiDefinition, FernRegistry.registry.getApiForEnvironment.Error>
> {
    return TypedQueryKey.of(["api", apiId, "environment", environmentId]);
}
