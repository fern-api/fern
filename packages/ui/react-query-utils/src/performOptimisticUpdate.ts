import { QueryClient } from "react-query";
import { TypedQueryKey } from "./TypedQueryKey";

export interface OptimisticUpdateOptions<T> {
    queryKey: TypedQueryKey<T>;
    value: T;
    exact?: boolean;
}

export async function performOptimisticUpdate<T>(
    queryClient: QueryClient,
    options: OptimisticUpdateOptions<T>
): Promise<void> {
    await performOptimisticUpdateWithoutInvalidating(queryClient, options);
    await queryClient.invalidateQueries(options.queryKey, { exact: options.exact });
}

export async function performOptimisticUpdateWithoutInvalidating<T>(
    queryClient: QueryClient,
    { queryKey, value, exact = true }: OptimisticUpdateOptions<T>
): Promise<void> {
    await queryClient.cancelQueries(queryKey, { exact });
    queryClient.setQueryData<T>(queryKey, value);
}
