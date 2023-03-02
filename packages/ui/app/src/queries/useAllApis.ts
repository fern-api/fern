import { Loadable } from "@fern-api/loadable";
import { performOptimisticUpdateWithoutInvalidating, TypedQueryKey, useTypedQuery } from "@fern-api/react-query-utils";
import { FernRegistry } from "@fern-fern/registry";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useCurrentOrganizationIdOrThrow } from "../routes/useCurrentOrganization";
import { useRegistryService } from "../services/useRegistryService";

const QUERY_KEY = TypedQueryKey.of<FernRegistry.GetAllApisResponse, ["apis"]>(["apis"]);

export function useAllApis(): Loadable<FernRegistry.GetAllApisResponse, FernRegistry.registry.getAllApiMetadata.Error> {
    const organizationId = useCurrentOrganizationIdOrThrow();
    const registryService = useRegistryService();
    return useTypedQuery(QUERY_KEY, async () => {
        const response = await registryService.registry.getAllApiMetadata(organizationId);
        if (response.ok) {
            return response.body;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw response.error;
        }
    });
}

export function useUpdateApiMetadataInAllApisQueryCache(
    apiId: FernRegistry.ApiId
): (apiMetadata: FernRegistry.ApiMetadata) => Promise<void> {
    const queryClient = useQueryClient();
    const allApis = useAllApis();

    return useCallback(
        async (apiMetadata) => {
            if (allApis.type !== "loaded") {
                return;
            }
            await performOptimisticUpdateWithoutInvalidating(queryClient, {
                queryKey: QUERY_KEY,
                value: {
                    apis: allApis.value.apis.map((otherApiMetadata) =>
                        otherApiMetadata.id === apiId ? apiMetadata : otherApiMetadata
                    ),
                },
            });
        },
        [allApis, apiId, queryClient]
    );
}

export function useInvalidateAllApis(): () => Promise<void> {
    const queryClient = useQueryClient();

    return useCallback(async () => {
        await queryClient.invalidateQueries(QUERY_KEY, { exact: true });
    }, [queryClient]);
}
