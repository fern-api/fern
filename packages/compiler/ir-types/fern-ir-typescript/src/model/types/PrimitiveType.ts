export type PrimitiveType =
    | "INTEGER"
    | "DOUBLE"
    | "STRING"
    | "BOOLEAN"
    /**
     * Within the range -2^53 to 2^53 */
    | "LONG";

export const PrimitiveType = {
    Integer: "INTEGER",
    Double: "DOUBLE",
    String: "STRING",
    Boolean: "BOOLEAN",
    Long: "LONG",

    _visit: <Result>(value: PrimitiveType, visitor: PrimitiveType._Visitor<Result>): Result => {
        switch (value) {
            case PrimitiveType.Integer:
                return visitor.integer();
            case PrimitiveType.Double:
                return visitor.double();
            case PrimitiveType.String:
                return visitor.string();
            case PrimitiveType.Boolean:
                return visitor.boolean();
            case PrimitiveType.Long:
                return visitor.long();
            default:
                return visitor._unknown();
        }
    },

    _values: (): PrimitiveType[] => [
        PrimitiveType.Integer,
        PrimitiveType.Double,
        PrimitiveType.String,
        PrimitiveType.Boolean,
        PrimitiveType.Long,
    ],
} as const;

export declare namespace PrimitiveType {
    type Integer = "INTEGER";
    type Double = "DOUBLE";
    type String = "STRING";
    type Boolean = "BOOLEAN";
    type Long = "LONG";

    export interface _Visitor<Result> {
        integer: () => Result;
        double: () => Result;
        string: () => Result;
        boolean: () => Result;
        long: () => Result;
        _unknown: () => Result;
    }
}
