import { Loadable } from "@fern-api/loadable";
import {
    performOptimisticUpdate,
    performOptimisticUpdateWithoutInvalidating,
    TypedQueryKey,
    useTypedQuery,
} from "@fern-api/react-query-utils";
import { FernRegistry } from "@fern-fern/registry";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useCurrentOrganizationIdOrThrow } from "../routes/useCurrentOrganization";
import { useRegistryService } from "../services/useRegistryService";

const QUERY_KEY = TypedQueryKey.of<FernRegistry.GetAllEnvironmentsResponse, ["environments"]>(["environments"]);

export function useAllEnvironments(): Loadable<
    FernRegistry.GetAllEnvironmentsResponse,
    FernRegistry.environment.getAll.Error
> {
    const organizationId = useCurrentOrganizationIdOrThrow();
    const registryService = useRegistryService();
    return useTypedQuery(QUERY_KEY, async () => {
        const response = await registryService.environment.getAll(organizationId);
        if (response.ok) {
            return response.body;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw response.error;
        }
    });
}

export function useAddEnvironmentToQueryCache(): (environment: FernRegistry.Environment) => Promise<void> {
    const queryClient = useQueryClient();
    const allEnvironments = useAllEnvironments();

    return useCallback(
        async (environment: FernRegistry.Environment) => {
            if (allEnvironments.type !== "loaded") {
                await queryClient.invalidateQueries(QUERY_KEY, { exact: true });
            } else {
                await performOptimisticUpdate(queryClient, {
                    queryKey: QUERY_KEY,
                    value: {
                        environments: [...allEnvironments.value.environments, environment],
                    },
                });
            }
        },
        [allEnvironments, queryClient]
    );
}

export function useDeleteEnvironment(): (environmentId: FernRegistry.EnvironmentId) => Promise<void> {
    const queryClient = useQueryClient();
    const allEnvironments = useAllEnvironments();
    const organizationId = useCurrentOrganizationIdOrThrow();
    const registryService = useRegistryService();

    return useCallback(
        async (environmentId: FernRegistry.EnvironmentId) => {
            if (allEnvironments.type !== "loaded") {
                await registryService.environment.delete(organizationId, environmentId);
                await queryClient.invalidateQueries(QUERY_KEY, { exact: true });
            } else {
                await performOptimisticUpdateWithoutInvalidating(queryClient, {
                    queryKey: QUERY_KEY,
                    value: {
                        environments: allEnvironments.value.environments.filter(
                            (environment) => environment.id !== environmentId
                        ),
                    },
                });
                await registryService.environment.delete(organizationId, environmentId);
                await queryClient.invalidateQueries(QUERY_KEY, { exact: true });
            }
        },
        [allEnvironments, organizationId, queryClient, registryService.environment]
    );
}
