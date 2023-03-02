import { Loadable } from "@fern-api/loadable";
import { performOptimisticUpdateWithoutInvalidating, TypedQueryKey, useTypedQuery } from "@fern-api/react-query-utils";
import { FernRegistry } from "@fern-fern/registry";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useCurrentOrganizationIdOrThrow } from "../routes/useCurrentOrganization";
import { useRegistryService } from "../services/useRegistryService";
import { useInvalidateAllApis, useUpdateApiMetadataInAllApisQueryCache } from "./useAllApis";

export function useApiMetadata(
    apiId: FernRegistry.ApiId
): Loadable<FernRegistry.ApiMetadata, FernRegistry.registry.getApiMetadata.Error> {
    const organizationId = useCurrentOrganizationIdOrThrow();
    const registryService = useRegistryService();
    return useTypedQuery<FernRegistry.ApiMetadata, FernRegistry.registry.getApiMetadata.Error>(
        buildQueryKey({ apiId }),
        async () => {
            const response = await registryService.registry.getApiMetadata(organizationId, apiId);
            if (response.ok) {
                return response.body;
            } else {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw response.error;
            }
        }
    );
}

export function useUpdateApiMetadata(
    apiId: FernRegistry.ApiId
): (update: Partial<FernRegistry.UpdateApiMetadataRequest>) => Promise<void> {
    const organizationId = useCurrentOrganizationIdOrThrow();
    const registryService = useRegistryService();
    const existingMetadata = useApiMetadata(apiId);
    const queryClient = useQueryClient();
    const queryKey = buildQueryKey({ apiId });
    const updateApiMetadataInAllApisQueryCache = useUpdateApiMetadataInAllApisQueryCache(apiId);
    const invalidateAllApis = useInvalidateAllApis();

    return useCallback(
        async (update: Partial<FernRegistry.UpdateApiMetadataRequest>) => {
            if (existingMetadata.type !== "loaded") {
                return;
            }

            const optimisticMetadata: FernRegistry.ApiMetadata = {
                id: existingMetadata.value.id,
                name: update.name ?? existingMetadata.value.name,
                description: update.description ?? existingMetadata.value.description,
                image: update.image ?? existingMetadata.value.image,
                gitRepo: update.gitRepo ?? existingMetadata.value.gitRepo,
                environments: existingMetadata.value.environments,
            };
            await performOptimisticUpdateWithoutInvalidating(queryClient, {
                queryKey,
                value: optimisticMetadata,
            });
            await updateApiMetadataInAllApisQueryCache(optimisticMetadata);

            await registryService.registry.updateApiMetadata(organizationId, apiId, {
                name: update.name ?? existingMetadata.value.name,
                description: update.description ?? existingMetadata.value.description,
                gitRepo: update.gitRepo ?? existingMetadata.value.gitRepo,
                image: update.image ?? existingMetadata.value.image,
            });

            await queryClient.invalidateQueries(queryKey, { exact: true });
            await invalidateAllApis();
        },
        [
            apiId,
            existingMetadata,
            organizationId,
            queryClient,
            queryKey,
            registryService.registry,
            invalidateAllApis,
            updateApiMetadataInAllApisQueryCache,
        ]
    );
}

function buildQueryKey({ apiId }: { apiId: FernRegistry.ApiId }): TypedQueryKey<FernRegistry.ApiMetadata> {
    return TypedQueryKey.of(["api", apiId, "metadata"]);
}
