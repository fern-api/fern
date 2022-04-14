export type PrimitiveType =
    | PrimitiveType.Integer
    | PrimitiveType.Double
    | PrimitiveType.String
    | PrimitiveType.Boolean
    /**
     * Within the range -2^53 to 2^53 */
    | PrimitiveType.Long;

export const PrimitiveType = {
    Integer: "integer" as PrimitiveType.Integer,
    Double: "double" as PrimitiveType.Double,
    String: "string" as PrimitiveType.String,
    Boolean: "boolean" as PrimitiveType.Boolean,
    Long: "long" as PrimitiveType.Long,

    visit: <R>(value: PrimitiveType, visitor: PrimitiveType.Visitor<R>): R => {
        switch (value) {
            case PrimitiveType.Integer: return visitor.integer();
            case PrimitiveType.Double: return visitor.double();
            case PrimitiveType.String: return visitor.string();
            case PrimitiveType.Boolean: return visitor.boolean();
            case PrimitiveType.Long: return visitor.long();
            default: return visitor.unknown(value);
        }
    },
};

export declare namespace PrimitiveType {
    export type Integer = "integer" & {
        "__fern.PrimitiveType": void,
    };
    export type Double = "double" & {
        "__fern.PrimitiveType": void,
    };
    export type String = "string" & {
        "__fern.PrimitiveType": void,
    };
    export type Boolean = "boolean" & {
        "__fern.PrimitiveType": void,
    };
    export type Long = "long" & {
        "__fern.PrimitiveType": void,
    };

    export interface Visitor<R> {
        integer: () => R;
        double: () => R;
        string: () => R;
        boolean: () => R;
        long: () => R;
        unknown: (value: string) => R;
    }
}
