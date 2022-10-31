import { Loadable } from "@fern-api/loadable";
import { UseQueryResult } from "react-query";
import { visitUseQueryResult } from "./visitor";

export function convertUseQueryResultToLoadable<T, E = unknown>(useQueryResult: UseQueryResult<T, E>): Loadable<T> {
    return visitUseQueryResult<T, Loadable<T>, E>(useQueryResult, {
        idle: () => ({ type: "notStartedLoading" }),
        loading: () => ({ type: "loading" }),
        loaded: (result) => ({ type: "loaded", value: result.data }),
        error: (result) => ({ type: "failed", error: result.error }),
    });
}
