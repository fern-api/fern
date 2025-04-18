import { keys } from "@fern-api/core-utils";

import { Loadable, Loading, NotFailed, failed, isFailed, isLoaded, loaded, loading } from "./Loadable";
import { visitLoadable } from "./visitor";

export function getLoadableValue<V>(loadable: Loadable<V> | undefined): V | undefined {
    if (loadable != null && loadable.type === "loaded") {
        return loadable.value;
    }
    return undefined;
}

export function mapLoadable<V, U>(loadable: NotFailed<V> | undefined, map: (value: V) => U): NotFailed<U>;
export function mapLoadable<V, U>(loadable: Loadable<V> | undefined, map: (value: V) => U): Loadable<U>;
export function mapLoadable<V, U>(loadable: Loadable<V> | undefined, map: (value: V) => U): Loadable<U> {
    return flatMapLoadable(loadable, (value) => loaded(map(value)));
}

export function mapLoadables<T, R>(loadables: { [K in keyof T]: NotFailed<T[K]> }, map: (values: T) => R): NotFailed<R>;
export function mapLoadables<T, R>(loadables: { [K in keyof T]: Loadable<T[K]> }, map: (values: T) => R): Loadable<R>;
export function mapLoadables<T, R>(loadables: { [K in keyof T]: Loadable<T[K]> }, map: (values: T) => R): Loadable<R> {
    return flatMapLoadables<T, R>(loadables, (values) => loaded(map(values)));
}

export function flatMapLoadables<T, R>(
    loadables: { [K in keyof T]: NotFailed<T[K]> },
    map: (values: T) => NotFailed<R>
): NotFailed<R>;
export function flatMapLoadables<T, R>(
    loadables: { [K in keyof T]: Loadable<T[K]> },
    map: (values: T) => Loadable<R>
): Loadable<R>;
export function flatMapLoadables<T, R>(
    loadables: { [K in keyof T]: Loadable<T[K]> },
    map: (values: T) => Loadable<R>
): Loadable<R> {
    // prioritize the failed loadables, so that if any of the loadables are
    // failed, we return a failed loadable
    const sortedKeys = keys(loadables).sort((aKey, bKey) => {
        const aLoadable = loadables[aKey];
        const bLoadable = loadables[bKey];
        if (isFailed(aLoadable)) {
            return -1;
        }
        if (isFailed(bLoadable)) {
            return 1;
        }
        return 0;
    });

    const values: T = {} as T;

    for (const key of sortedKeys) {
        const loadable = loadables[key];
        if (!isLoaded(loadable)) {
            return loadable;
        }
        values[key] = loadable.value;
    }

    return map(values);
}

export function flatMapLoadable<V, U, E = unknown>(
    loadable: Loadable<V, E> | undefined,
    map: (value: V) => Loadable<U, E>
): Loadable<U, E> {
    return visitLoadable<V, Loadable<U, E>, E>(loadable, {
        loading,
        loaded: (value) => map(value),
        failed
    });
}

export function mapLoadableArray<V, U>(
    loadable: NotFailed<V> | undefined,
    map: (value: V) => U[],
    options?: { numLoading?: number }
): NotFailed<U>[];
export function mapLoadableArray<V, U>(
    loadable: Loadable<V> | undefined,
    map: (value: V) => U[],
    options?: { numLoading?: number }
): Loadable<U>[];
export function mapLoadableArray<V, U>(
    loadable: Loadable<V> | undefined,
    map: (value: V) => U[],
    { numLoading = 3 }: { numLoading?: number } = {}
): Loadable<U>[] {
    return visitLoadable<V, Loadable<U>[]>(loadable, {
        loading: () => Array<Loadable<U>>(numLoading).fill(loading()),
        loaded: (value) => map(value).map(loaded),
        failed: (error) => Array<Loadable<U>>(numLoading).fill(failed(error))
    });
}

export function mapNotFailedLoadableArray<V, W>(
    loadable: Loadable<V[]> | undefined,
    map: (items: NotFailed<V>[]) => W,
    { numLoading = 3 }: { numLoading?: number } = {}
): W {
    if (isLoaded(loadable)) {
        return map(loadable.value.map(loaded));
    }
    return map(Array<Loading<unknown>>(numLoading).fill(loading()));
}

export function visitLoadableArray<V, W>(
    loadable: Loadable<V[]> | undefined,
    visitor: {
        notFailed: (items: NotFailed<V>[]) => W;
        failed: (error: unknown) => W;
    },
    { numLoading = 3 }: { numLoading?: number } = {}
): W {
    if (isFailed(loadable)) {
        return visitor.failed(loadable.error);
    }
    if (isLoaded(loadable)) {
        return visitor.notFailed(loadable.value.map(loaded));
    }
    return visitor.notFailed(Array<Loading<unknown>>(numLoading).fill(loading()));
}
