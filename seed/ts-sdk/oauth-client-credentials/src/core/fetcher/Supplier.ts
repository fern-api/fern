export type Supplier<T> = T | Promise<T> | (() => T | Promise<T>);

export const Supplier = {
    get: async <T>(supplier: Supplier<T>): Promise<T> => {
        if (typeof supplier === "function") {
            return (supplier as () => T)();
        } else {
            return supplier;
        }
    },
};

export type PropertiesSupplier<T> = {
    [K in keyof T]: Supplier<T[K]>;
};

export const PropertiesSupplier = {
    get: async <T>(properties: PropertiesSupplier<T>): Promise<T> => {
        const result: Partial<T> = {};
        for (const key in properties) {
            const value = await Supplier.get(properties[key]);
            result[key] = value as T[Extract<keyof T, string>];
        }
        return result as T;
    },
}
