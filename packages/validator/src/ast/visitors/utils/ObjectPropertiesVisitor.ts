type ObjectPropertiesVisitor<T> = {
    [K in keyof T]-?: (value: T[K]) => void;
};

export function visitObject<T extends Record<string, unknown>>(object: T, visitor: ObjectPropertiesVisitor<T>): void {
    for (const key of keys(object)) {
        visitor[key](object[key]);
    }
}

function keys<T>(object: T): (keyof T)[] {
    return Object.keys(object) as (keyof T)[];
}
