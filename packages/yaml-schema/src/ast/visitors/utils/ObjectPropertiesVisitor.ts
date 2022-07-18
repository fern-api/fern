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

function keys<T>(object: T): (keyof T)[] {
    return Object.keys(object) as (keyof T)[];
}
