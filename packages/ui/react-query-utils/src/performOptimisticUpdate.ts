import { QueryClient } from "react-query";
import { TypedQueryKey } from "./TypedQueryKey";

export interface OptimisticUpdateOptions<T> {
    queryKey: TypedQueryKey<T>;
    value: T;
    exact?: boolean;
}

export function performOptimisticUpdate<T>(queryClient: QueryClient, options: OptimisticUpdateOptions<T>): void {
    performOptimisticUpdateWithoutInvalidating(queryClient, options);
    queryClient.invalidateQueries(options.queryKey, { exact: options.exact });
}

export function performOptimisticUpdateWithoutInvalidating<T>(
    queryClient: QueryClient,
    { queryKey, value, exact = true }: OptimisticUpdateOptions<T>
): void {
    queryClient.cancelQueries(queryKey, { exact });
    queryClient.setQueryData<T>(queryKey, value);
}
