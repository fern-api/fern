import { assertNever } from "@fern-api/commons";
import { isFailed, isLoaded, isLoading, isNotStartedLoading, Loadable } from "./Loadable";

export function visitLoadable<V, U>(loadable: Loadable<V> | undefined, visitor: LoadableVisitor<V, U>): U {
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

export interface LoadableVisitor<V, U> {
    loading: () => U;
    loaded: (value: V) => U;
    failed: (error: unknown) => U;
}
