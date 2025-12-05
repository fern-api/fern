import {
    AdditionalProperty,
    ObjectLikeSchema,
    ObjectSchema,
    Property,
    SchemaOptions,
    SchemaWithUtils,
    SerializationFormat,
    SingleUnionType,
    UnionArgs
} from "../serialization-pipeline/SerializationFormat";

// Re-export types from SerializationFormat for backward compatibility
export type { SchemaOptions };

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
    export { SchemaWithUtils as Schema };
    export { ObjectSchema };
    export { ObjectLikeSchema };
    export { AdditionalProperty };
    export { Property };

    namespace union {
        export { UnionArgs as Args };
        export { SingleUnionType };
    }
}
