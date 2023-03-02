import {
    QueryObserverLoadingErrorResult,
    QueryObserverLoadingResult,
    QueryObserverRefetchErrorResult,
    QueryObserverSuccessResult,
    UseQueryResult,
} from "@tanstack/react-query";

export function visitUseQueryResult<T, U, E = unknown>(
    result: UseQueryResult<T, E>,
    visitor: UseQueryResultVisitor<T, E, U>
): U {
    if (result.isSuccess) {
        return visitor.loaded(result);
    }
    if (result.isLoading) {
        return visitor.loading(result);
    }
    return visitor.error(result);
}

export interface UseQueryResultVisitor<T, E, U> {
    loading: (result: QueryObserverLoadingResult<T, E>) => U;
    loaded: (result: QueryObserverSuccessResult<T, E>) => U;
    error: (result: QueryObserverLoadingErrorResult<T, E> | QueryObserverRefetchErrorResult<T, E>) => U;
}
