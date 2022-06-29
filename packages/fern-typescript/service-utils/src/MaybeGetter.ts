export type MaybeGetter<T> = T | Promise<T> | (() => T | Promise<T>);
