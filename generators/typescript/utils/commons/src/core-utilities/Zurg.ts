import { SerializationFormat } from "../serialization-pipeline/SerializationFormat";

// Re-export types from SerializationFormat for backward compatibility
export type SchemaOptions = SerializationFormat.SchemaOptions;

/**
 * Zurg is now a type alias for SerializationFormat.
 * This maintains backward compatibility while allowing different serialization formats to be used.
 */
export type Zurg = SerializationFormat;

/**
 * Zurg namespace for backward compatibility with existing code.
 * All types are aliased to their SerializationFormat equivalents.
 */
export declare namespace Zurg {
    export type Schema = SerializationFormat.SchemaWithUtils;
    export type ObjectSchema = SerializationFormat.ObjectSchema;
    export type ObjectLikeSchema = SerializationFormat.ObjectLikeSchema;
    export type AdditionalProperty = SerializationFormat.AdditionalProperty;
    export type Property = SerializationFormat.Property;

    export namespace union {
        export type Args = SerializationFormat.UnionArgs;
        export type SingleUnionType = SerializationFormat.SingleUnionType;
    }
}
