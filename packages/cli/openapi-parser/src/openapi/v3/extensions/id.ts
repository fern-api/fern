// Typescript trick to attach a type to a string

export type TypedExtensionId<T> = string & {
    __type__: T;
};

export const TypedExtensionId = {
    of<T>(key: string): TypedExtensionId<T> {
        return key as TypedExtensionId<T>;
    }
};
