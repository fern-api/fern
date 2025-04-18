import { assertNever } from "@fern-api/core-utils";

import { Loadable, isFailed, isLoaded, isLoading, isNotStartedLoading } from "./Loadable";

export function visitLoadable<V, U, E = unknown>(
    loadable: Loadable<V, E> | undefined,
    visitor: LoadableVisitor<V, U, E>
): U {
    if (loadable == null || isNotStartedLoading(loadable) || isLoading(loadable)) {
        return visitor.loading();
    }
    if (isLoaded(loadable)) {
        return visitor.loaded(loadable.value);
    }
    if (isFailed(loadable)) {
        return visitor.failed(loadable.error);
    }
    assertNever(loadable);
}

export interface LoadableVisitor<V, U, E = unknown> {
    loading: () => U;
    loaded: (value: V) => U;
    failed: (error: E) => U;
}
