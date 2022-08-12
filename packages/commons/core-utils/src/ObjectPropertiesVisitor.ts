import { keys } from "./objects/keys";

export type ObjectPropertiesVisitor<T, R> = {
    [K in keyof T]-?: (value: T[K]) => R;
};

export function visitObject<T extends Record<string, unknown>>(
    object: T,
    visitor: ObjectPropertiesVisitor<T, void>
): void;
export function visitObject<T extends Record<string, unknown>>(
    object: T,
    visitor: ObjectPropertiesVisitor<T, void | Promise<void>>
): Promise<void>;
export async function visitObject<T extends Record<string, unknown>>(
    object: T,
    visitor: ObjectPropertiesVisitor<T, void | Promise<void>>
): Promise<void> {
    for (const key of keys(object)) {
        // object _could_ contain more properties than the visitor.
        // (just because object is a T doesn't mean it doesn't have extra properties).
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        await visitor[key]?.(object[key]);
    }
}
