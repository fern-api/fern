import { Loadable } from "@fern-api/loadable";
import { useMemo } from "react";
import { QueryFunction, useQuery, UseQueryOptions } from "react-query";
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
): Loadable<TQueryFnData> {
    const result = useQuery(queryKey, queryFn, options);
    return useMemo(() => convertUseQueryResultToLoadable(result), [result]);
}
