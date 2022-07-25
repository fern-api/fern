import { keys } from "@fern-api/core-utils";

type ObjectPropertiesVisitor<T> = {
    [K in keyof T]-?: (value: T[K]) => void | Promise<void>;
};

export async function visitObject<T extends Record<string, unknown>>(
    object: T,
    visitor: ObjectPropertiesVisitor<T>
): Promise<void> {
    for (const key of keys(object)) {
        await visitor[key](object[key]);
    }
}
