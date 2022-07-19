type SuppliableType = string | number | boolean | undefined;

export type Supplier<T extends SuppliableType> = T | Promise<T> | (() => T | Promise<T>);

export const Supplier = {
    get: async <T extends SuppliableType>(supplier: Supplier<T>): Promise<T> =>
        typeof supplier === "function" ? supplier() : supplier,
};
