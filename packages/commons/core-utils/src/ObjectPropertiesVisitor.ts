import { keys } from "./objects/keys";

export type ObjectPropertiesVisitor<T, R> = {
    [K in keyof T]-?: (value: T[K]) => R;
};

export function visitObject<T extends object>(object: T, visitor: ObjectPropertiesVisitor<T, void>): void {
    for (const key of keys(visitor)) {
        visitor[key](object[key]);
    }
}

export async function visitObjectAsync<T extends object>(
    object: T,
    visitor: ObjectPropertiesVisitor<T, void | Promise<void>>
): Promise<void> {
    for (const key of keys(visitor)) {
        await visitor[key](object[key]);
    }
}
