import { Loadable } from "@fern-api/loadable";
import { QueryFunction, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import { convertUseQueryResultToLoadable } from "./convertUseQueryResultToLoadable";
import { TypedQueryKey } from "./TypedQueryKey";

export function useTypedQuery<
    TQueryFnData = unknown,
    TError = unknown,
    TQueryKey extends TypedQueryKey<TQueryFnData> = TypedQueryKey<TQueryFnData>
>(
    queryKey: TQueryKey,
    queryFn: QueryFunction<TQueryFnData, TQueryKey>,
    options?: Omit<UseQueryOptions<TQueryFnData, TError, TQueryFnData, TQueryKey>, "queryKey" | "queryFn">
): Loadable<TQueryFnData, TError> {
    const result = useQuery(queryKey, queryFn, options);
    return useMemo(() => convertUseQueryResultToLoadable(result), [result]);
}
