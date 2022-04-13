export type PrimitiveType = "integer" | "double" | "long" | "string" | "boolean" | "datetime";

export const PrimitiveType = {
    Integer: "integer" as const,
    Double: "double" as const,
    Long: "long" as const,
    String: "string" as const,
    Boolean: "boolean" as const,
    Datetime: "datetime" as const,

    visit: <R>(primitiveType: PrimitiveType, visitor: PrimitiveType.Visitor<R>): R => {
        switch (primitiveType) {
            case PrimitiveType.Boolean:
                return visitor.boolean();
            case PrimitiveType.Datetime:
                return visitor.datetime();
            case PrimitiveType.Double:
                return visitor.double();
            case PrimitiveType.Integer:
                return visitor.integer();
            case PrimitiveType.Long:
                return visitor.long();
            case PrimitiveType.String:
                return visitor.string();
            default:
                return visitor.unknown(primitiveType);
        }
    },
};

export declare namespace PrimitiveType {
    export interface Visitor<R> {
        boolean: () => R;
        datetime: () => R;
        double: () => R;
        integer: () => R;
        long: () => R;
        string: () => R;
        unknown: (value: string) => R;
    }
}
