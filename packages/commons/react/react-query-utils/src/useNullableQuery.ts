import { flatMapLoadable, Loadable, loaded, notStartedLoading } from "@fern-api/loadable";
import { Query, QueryFunction, QueryKey, UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import { TypedQueryKey } from "./TypedQueryKey";
import { useTypedQuery } from "./useTypedQuery";

export function useNullableQuery<
    TQueryFnData = unknown,
    TError = unknown,
    TQueryKey extends TypedQueryKey<TQueryFnData> = TypedQueryKey<TQueryFnData>
>(
    queryKey: TQueryKey | undefined,
    queryFn: QueryFunction<TQueryFnData, TQueryKey>,
    options?: Omit<UseQueryOptions<TQueryFnData, TError, TQueryFnData, TQueryKey>, "queryKey" | "queryFn">
): Loadable<TQueryFnData, TError> {
    const {
        enabled: isEnabledProp = true,
        refetchInterval,
        // eslint-disable-next-line deprecation/deprecation
        onSettled,
        // eslint-disable-next-line deprecation/deprecation
        onSuccess,
        isDataEqual,
        select,
    } = options ?? {};

    const result = useTypedQuery<TQueryFnData | NullableQueryResult, TError>(
        queryKey ?? createNullableQueryKey(),
        (context) => {
            if (isNullableQueryKey(context.queryKey)) {
                return Promise.resolve(NULLABLE_QUERY_RESULT);
            }
            return queryFn({ ...context, queryKey: context.queryKey as TQueryKey });
        },
        {
            ...options,

            // TODO wrap these
            structuralSharing: undefined,
            queryKeyHashFn: undefined,
            behavior: undefined,
            getPreviousPageParam: undefined,
            getNextPageParam: undefined,
            useErrorBoundary: undefined,
            refetchOnWindowFocus: undefined,
            refetchOnReconnect: undefined,
            refetchOnMount: undefined,

            enabled: isEnabledProp && queryKey != null,
            refetchInterval:
                typeof refetchInterval === "function"
                    ? (data, query) => {
                          if (isNullableQueryResult(data)) {
                              return false;
                          }
                          return refetchInterval(
                              data,
                              query as unknown as Query<TQueryFnData, TError, TQueryFnData, TQueryKey>
                          );
                      }
                    : refetchInterval,
            onSettled:
                onSettled != null
                    ? (data, error) => {
                          if (isNullableQueryResult(data)) {
                              return false;
                          }
                          return onSettled(data, error);
                      }
                    : undefined,
            onSuccess:
                onSuccess != null
                    ? (data) => {
                          if (isNullableQueryResult(data)) {
                              return false;
                          }
                          return onSuccess(data);
                      }
                    : undefined,
            isDataEqual:
                isDataEqual != null
                    ? (oldData, newData) => {
                          if (isNullableQueryResult(oldData) || isNullableQueryResult(newData)) {
                              return true;
                          }
                          return isDataEqual(oldData, newData);
                      }
                    : undefined,
            select:
                select != null
                    ? (data) => {
                          if (isNullableQueryResult(data)) {
                              return data;
                          }
                          return select(data);
                      }
                    : undefined,
        }
    );

    return useMemo(() => {
        return flatMapLoadable(result, (loadedResult) => {
            if (isNullableQueryResult(loadedResult)) {
                return notStartedLoading();
            }
            return loaded(loadedResult);
        });
    }, [result]);
}

// Nullable query key

type NullableQueryKey = TypedQueryKey<NullableQueryResult> & [NullableQueryKeyItem];

interface NullableQueryKeyItem {
    __nullableQueryKey: symbol;
}

function createNullableQueryKey(): NullableQueryKey {
    return TypedQueryKey.of([{ __nullableQueryKey: Symbol() }]);
}

function isNullableQueryKey(queryKey: QueryKey): queryKey is NullableQueryKey {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return queryKey.length === 1 && (queryKey[0] as NullableQueryKeyItem)?.__nullableQueryKey != null;
}

// Nullable query result

interface NullableQueryResult {
    __isNullableQueryResult: true;
}

const NULLABLE_QUERY_RESULT: NullableQueryResult = { __isNullableQueryResult: true };

function isNullableQueryResult(result: unknown): result is NullableQueryResult {
    return (result as NullableQueryResult).__isNullableQueryResult;
}
