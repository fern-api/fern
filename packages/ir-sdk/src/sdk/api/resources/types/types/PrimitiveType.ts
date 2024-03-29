/**
 * This file was auto-generated by Fern from our API Definition.
 */

export type PrimitiveType =
    | "INTEGER"
    | "DOUBLE"
    | "STRING"
    | "BOOLEAN"
    /**
     * Within the range -2^53 to 2^53 */
    | "LONG"
    | "DATE_TIME"
    | "DATE"
    | "UUID"
    | "BASE_64";

export const PrimitiveType = {
    Integer: "INTEGER",
    Double: "DOUBLE",
    String: "STRING",
    Boolean: "BOOLEAN",
    Long: "LONG",
    DateTime: "DATE_TIME",
    Date: "DATE",
    Uuid: "UUID",
    Base64: "BASE_64",
    _visit: <R>(value: PrimitiveType, visitor: PrimitiveType.Visitor<R>) => {
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
            case PrimitiveType.DateTime:
                return visitor.dateTime();
            case PrimitiveType.Date:
                return visitor.date();
            case PrimitiveType.Uuid:
                return visitor.uuid();
            case PrimitiveType.Base64:
                return visitor.base64();
            default:
                return visitor._other();
        }
    },
} as const;

export declare namespace PrimitiveType {
    interface Visitor<R> {
        integer: () => R;
        double: () => R;
        string: () => R;
        boolean: () => R;
        long: () => R;
        dateTime: () => R;
        date: () => R;
        uuid: () => R;
        base64: () => R;
        _other: () => R;
    }
}
