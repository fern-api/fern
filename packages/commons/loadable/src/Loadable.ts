export type Loadable<V, E = unknown> = NotStartedLoading<V> | Loading<V> | Loaded<V> | Failed<E>;
export type UnwrapLoadable<L> = L extends Loadable<infer V> ? V : never;

export interface NotStartedLoading<_V> {
    type: "notStartedLoading";
}
export interface Loading<_V> {
    type: "loading";
}
export interface Loaded<V> {
    type: "loaded";
    value: V;
}
export interface Failed<E = unknown> {
    type: "failed";
    error: E;
}
export type NotFailed<V> = Exclude<Loadable<V>, Failed<V>>;

const NOT_STARTED_LOADING: NotStartedLoading<unknown> = Object.freeze({ type: "notStartedLoading" });
export function notStartedLoading<V>(): NotStartedLoading<V> {
    return NOT_STARTED_LOADING;
}
export function isNotStartedLoading<V>(loadable: Loadable<V> | undefined): loadable is NotStartedLoading<V> | undefined;
export function isNotStartedLoading<V>(loadable: Loadable<V>): loadable is NotStartedLoading<V>;
export function isNotStartedLoading<V>(
    loadable: Loadable<V> | undefined
): loadable is NotStartedLoading<V> | undefined {
    return loadable == null || loadable.type === "notStartedLoading";
}

const LOADING: Loading<unknown> = Object.freeze({ type: "loading" });
export function loading<V>(): Loading<V> {
    return LOADING;
}
export function isLoading<V>(loadable: Loadable<V> | undefined): loadable is Loading<V> | undefined;
export function isLoading<V>(loadable: Loadable<V>): loadable is Loading<V>;
export function isLoading<V>(loadable: Loadable<V> | undefined): loadable is Loading<V> | undefined {
    return loadable == null || loadable.type === "loading";
}

export function loaded<V>(value: V): Loaded<V> {
    return { type: "loaded", value };
}
export function isLoaded<V>(loadable: Loadable<V> | undefined): loadable is Loaded<V> {
    return loadable != null && loadable.type === "loaded";
}

export function failed<E>(error: E): Failed<E> {
    return { type: "failed", error };
}
export function isFailed<V, E>(loadable: Loadable<V, E> | undefined): loadable is Failed<E> {
    return loadable != null && loadable.type === "failed";
}
