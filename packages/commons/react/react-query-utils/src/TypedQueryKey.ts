import { QueryKey } from "@tanstack/react-query";

export type TypedQueryKey<T> = QueryKey & {
    __value: T;
};

export const TypedQueryKey = {
    of: <T, TQueryKey extends QueryKey>(queryKey: TQueryKey): TQueryKey & TypedQueryKey<T> =>
        queryKey as TQueryKey & TypedQueryKey<T>,
};
