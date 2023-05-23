export interface JsonItemVisitor<T> {
    object: (object: object) => T;
    list: (list: unknown[]) => T;
    string: (string: string) => T;
    number: (number: number) => T;
    boolean: (boolean: boolean) => T;
    null: () => T;
}

export function visitJsonItem<T>(value: unknown, visitor: JsonItemVisitor<T>): T {
    if (value == null) {
        return visitor.null();
    }
    if (Array.isArray(value)) {
        return visitor.list(value);
    }
    if (typeof value === "object") {
        return visitor.object(value);
    }
    if (typeof value === "string") {
        return visitor.string(value);
    }
    if (typeof value === "number") {
        return visitor.number(value);
    }
    if (typeof value === "boolean") {
        return visitor.boolean(value);
    }
    throw new Error("Value is not JSON: " + JSON.stringify(value));
}
