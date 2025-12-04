import { ts } from "ts-morph";

/**
 * Options passed to schema parse/json methods
 */
export interface SchemaOptions {
    unrecognizedObjectKeys?: "fail" | "passthrough" | "strip";
    allowUnrecognizedUnionMembers?: boolean;
    allowUnrecognizedEnumValues?: boolean;
    skipValidation?: boolean;
    omitUndefined?: boolean;
    breadcrumbsPrefix?: string[];
}

/**
 * Base schema interface that all schema types implement
 */
export interface BaseSchema {
    /** Convert schema to TypeScript AST expression */
    toExpression: () => ts.Expression;
    isOptional: boolean;
    isNullable: boolean;
}

/**
 * Utility methods available on all schemas
 */
export interface SchemaUtils {
    parse: (raw: ts.Expression, opts: Required<SchemaOptions>) => ts.Expression;
    json: (parsed: ts.Expression, opts: Required<SchemaOptions>) => ts.Expression;
    parseOrThrow: (raw: ts.Expression, opts: Required<SchemaOptions>) => ts.Expression;
    jsonOrThrow: (parsed: ts.Expression, opts: Required<SchemaOptions>) => ts.Expression;
    nullable: () => Schema;
    optional: () => Schema;
    optionalNullable: () => Schema;
    transform: (args: {
        newShape: ts.TypeNode | undefined;
        transform: ts.Expression;
        untransform: ts.Expression;
    }) => Schema;
}

/**
 * Combined schema interface
 */
export interface Schema extends BaseSchema, SchemaUtils {}

/**
 * Object-like schema utilities
 */
export interface ObjectLikeUtils {
    withParsedProperties: (properties: AdditionalProperty[]) => ObjectLikeSchema;
}

export interface ObjectLikeSchema extends Schema, ObjectLikeUtils {}

/**
 * Object schema utilities
 */
export interface ObjectUtils {
    extend: (extension: Schema) => ObjectSchema;
    passthrough: () => ObjectSchema;
}

export interface ObjectSchema extends Schema, ObjectLikeUtils, ObjectUtils {}

/**
 * Property definition for object schemas
 */
export interface Property {
    key: {
        parsed: string;
        raw: string;
    };
    value: Schema;
}

/**
 * Additional property for withParsedProperties
 */
export interface AdditionalProperty {
    key: string;
    getValue: (args: { getReferenceToParsed: () => ts.Expression }) => ts.Expression;
}

/**
 * Union type arguments
 */
export interface UnionArgs {
    parsedDiscriminant: string;
    rawDiscriminant: string;
    singleUnionTypes: SingleUnionType[];
}

export interface SingleUnionType {
    discriminantValue: string;
    nonDiscriminantProperties: ObjectSchema;
}

/**
 * Main interface for serialization code generators.
 * Implementations generate TypeScript AST for different validation libraries (Zod, Yup, etc.).
 */
export interface SerializationCodeGenerator {
    // Object schemas
    object: (properties: Property[]) => ObjectSchema;
    objectWithoutOptionalProperties: (properties: Property[]) => ObjectSchema;

    // Union schemas
    union: (args: UnionArgs) => ObjectLikeSchema;
    undiscriminatedUnion: (schemas: Schema[]) => Schema;

    // Collection schemas
    list: (itemSchema: Schema) => Schema;
    set: (itemSchema: Schema) => Schema;
    record: (args: { keySchema: Schema; valueSchema: Schema }) => Schema;

    // Primitive schemas
    enum: (values: string[]) => Schema;
    string: () => Schema;
    stringLiteral: (literal: string) => Schema;
    booleanLiteral: (literal: boolean) => Schema;
    date: () => Schema;
    number: () => Schema;
    bigint: () => Schema;
    boolean: () => Schema;
    any: () => Schema;
    unknown: () => Schema;
    never: () => Schema;

    // Lazy schemas (for circular references)
    lazy: (schema: Schema) => Schema;
    lazyObject: (schema: Schema) => ObjectSchema;

    // Type helpers
    Schema: {
        _getReferenceToType: (args: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }) => ts.TypeNode;
        _fromExpression: (expression: ts.Expression, opts?: { isObject: boolean }) => Schema;
        _visitMaybeValid: (
            referenceToMaybeValid: ts.Expression,
            visitor: {
                valid: (referenceToValue: ts.Expression) => ts.Statement[];
                invalid: (referenceToErrors: ts.Expression) => ts.Statement[];
            }
        ) => ts.Statement[];
    };

    ObjectSchema: {
        _getReferenceToType: (args: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }) => ts.TypeNode;
    };

    // Validation result accessors
    MaybeValid: {
        ok: string;
        Valid: {
            value: string;
        };
        Invalid: {
            errors: string;
        };
    };

    ValidationError: {
        path: string;
        message: string;
    };
}

/**
 * Type of serialization code generator implementation
 */
export type SerializationCodeGeneratorType = "zurg" | "zod" | "yup" | "ajv" | "none";
