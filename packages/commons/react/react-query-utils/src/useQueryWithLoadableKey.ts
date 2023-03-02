import { flatMapLoadable, isLoaded, Loadable } from "@fern-api/loadable";
import { QueryFunction, UseQueryOptions } from "@tanstack/react-query";
import { TypedQueryKey } from "./TypedQueryKey";
import { useNullableQuery } from "./useNullableQuery";

export function useQueryWithLoadableKey<
    TQueryFnData = unknown,
    TError = unknown,
    TQueryKey extends TypedQueryKey<TQueryFnData> = TypedQueryKey<TQueryFnData>
>(
    queryKey: Loadable<TQueryKey>,
    queryFn: QueryFunction<TQueryFnData, TQueryKey>,
    options?: Omit<UseQueryOptions<TQueryFnData, TError, TQueryFnData, TQueryKey>, "queryKey" | "queryFn">
): Loadable<TQueryFnData> {
    const result = useNullableQuery(isLoaded(queryKey) ? queryKey.value : undefined, queryFn, options);
    return flatMapLoadable(queryKey, () => result);
}
