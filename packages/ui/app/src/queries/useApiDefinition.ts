import { assertNever } from "@fern-api/core-utils";
import { Loadable } from "@fern-api/loadable";
import { TypedQueryKey, useTypedQuery } from "@fern-api/react-query-utils";
import { FernRegistry } from "@fern-fern/registry";
import { ParsedEnvironmentId } from "../api-page/routes/useCurrentEnvironment";
import { useCurrentOrganizationIdOrThrow } from "../routes/useCurrentOrganization";
import { useRegistryService } from "../services/useRegistryService";

export function useApiDefinition({
    apiId,
    environmentId,
}: {
    apiId: FernRegistry.ApiId;
    environmentId: ParsedEnvironmentId;
}): Loadable<
    FernRegistry.ApiDefinition,
    FernRegistry.registry.getApiWithEnvironment.Error | FernRegistry.registry.getApiWithoutEnvironments.Error
> {
    const organizationId = useCurrentOrganizationIdOrThrow();
    const registryService = useRegistryService();

    const loadDefinition = () => {
        switch (environmentId.type) {
            case "environment":
                return registryService.registry.getApiWithEnvironment(
                    organizationId,
                    apiId,
                    environmentId.environmentId
                );
            case "latest":
                return registryService.registry.getApiWithoutEnvironments(organizationId, apiId);
            default:
                assertNever(environmentId);
        }
    };

    return useTypedQuery<
        FernRegistry.ApiDefinition,
        FernRegistry.registry.getApiWithEnvironment.Error | FernRegistry.registry.getApiWithoutEnvironments.Error
    >(buildQueryKey({ apiId, environmentId }), async () => {
        const response = await loadDefinition();
        if (response.ok) {
            return response.body;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw response.error;
        }
    });
}

function buildQueryKey({
    apiId,
    environmentId,
}: {
    apiId: FernRegistry.ApiId;
    environmentId: ParsedEnvironmentId;
}): TypedQueryKey<FernRegistry.ApiDefinition> {
    const queryKey = ["api", apiId, "definition"];
    if (environmentId.type === "environment") {
        queryKey.push("environment", environmentId.environmentId);
    }
    return TypedQueryKey.of(queryKey);
}
