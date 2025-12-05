import { ts } from "ts-morph";

import { Reference } from "../referencing";

/**
 * Options passed to schema parse/json operations
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
 * Base schema interface that all format-specific schemas must implement.
 * This represents a schema that can generate TypeScript AST expressions.
 */
export interface Schema {
    /**
     * Generates the TypeScript AST expression for this schema definition
     */
    toExpression: () => ts.Expression;

    /**
     * Whether this schema represents an optional value
     */
    isOptional: boolean;

    /**
     * Whether this schema represents a nullable value
     */
    isNullable: boolean;
}

/**
 * Extended schema interface with utility methods for transformations
 */
export interface SchemaWithUtils extends Schema {
    /**
     * Generate parse expression: raw JSON -> parsed type
     */
    parse: (raw: ts.Expression, opts: Required<SchemaOptions>) => ts.Expression;

    /**
     * Generate json expression: parsed type -> raw JSON
     */
    json: (parsed: ts.Expression, opts: Required<SchemaOptions>) => ts.Expression;

    /**
     * Generate parseOrThrow expression
     */
    parseOrThrow: (raw: ts.Expression, opts: Required<SchemaOptions>) => ts.Expression;

    /**
     * Generate jsonOrThrow expression
     */
    jsonOrThrow: (parsed: ts.Expression, opts: Required<SchemaOptions>) => ts.Expression;

    /**
     * Wrap schema to allow null values
     */
    nullable: () => SchemaWithUtils;

    /**
     * Wrap schema to allow undefined values
     */
    optional: () => SchemaWithUtils;

    /**
     * Wrap schema to allow both null and undefined values
     */
    optionalNullable: () => SchemaWithUtils;

    /**
     * Apply a transform to the schema
     */
    transform: (args: {
        newShape: ts.TypeNode | undefined;
        transform: ts.Expression;
        untransform: ts.Expression;
    }) => SchemaWithUtils;
}

/**
 * Schema interface for object-like types (objects, unions)
 */
export interface ObjectLikeSchema extends SchemaWithUtils {
    /**
     * Add computed properties to the parsed output
     */
    withParsedProperties: (properties: AdditionalProperty[]) => ObjectLikeSchema;
}

/**
 * Schema interface for object types with extend/passthrough capabilities
 */
export interface ObjectSchema extends ObjectLikeSchema {
    /**
     * Extend this object schema with another schema's properties
     */
    extend: (extension: Schema) => ObjectSchema;

    /**
     * Allow unknown properties to pass through
     */
    passthrough: () => ObjectSchema;
}

/**
 * Property definition for object schemas
 */
export interface Property {
    key: {
        /** The property name in the parsed TypeScript type */
        parsed: string;
        /** The property name in the raw JSON */
        raw: string;
    };
    value: Schema;
}

/**
 * Additional property to be added during parsing
 */
export interface AdditionalProperty {
    key: string;
    getValue: (args: { getReferenceToParsed: () => ts.Expression }) => ts.Expression;
}

/**
 * Arguments for creating a discriminated union schema
 */
export interface UnionArgs {
    /** The discriminant property name in the parsed type */
    parsedDiscriminant: string;
    /** The discriminant property name in the raw JSON */
    rawDiscriminant: string;
    /** The union member types */
    singleUnionTypes: SingleUnionType[];
}

/**
 * A single variant of a discriminated union
 */
export interface SingleUnionType {
    /** The discriminant value that identifies this variant */
    discriminantValue: string;
    /** Schema for the non-discriminant properties */
    nonDiscriminantProperties: ObjectSchema;
}

/**
 * Runtime dependencies required by the serialization format
 */
export interface RuntimeDependency {
    name: string;
    version: string;
}

/**
 * The main serialization format protocol.
 * Each format (Zurg, Zod, etc.) implements this interface.
 */
export interface SerializationFormat {
    /**
     * Unique identifier for this format
     */
    readonly name: "default" | "zod" | "none";

    // ==================== Schema Builders ====================

    /**
     * Create an object schema with the given properties
     */
    object: (properties: Property[]) => ObjectSchema;

    /**
     * Create an object schema where all properties are required (no optionals)
     */
    objectWithoutOptionalProperties: (properties: Property[]) => ObjectSchema;

    /**
     * Create a discriminated union schema
     */
    union: (args: UnionArgs) => ObjectLikeSchema;

    /**
     * Create an undiscriminated union schema
     */
    undiscriminatedUnion: (schemas: Schema[]) => SchemaWithUtils;

    /**
     * Create an array/list schema
     */
    list: (itemSchema: Schema) => SchemaWithUtils;

    /**
     * Create a Set schema
     */
    set: (itemSchema: Schema) => SchemaWithUtils;

    /**
     * Create a Record/Map schema
     */
    record: (args: { keySchema: Schema; valueSchema: Schema }) => SchemaWithUtils;

    /**
     * Create an enum schema
     */
    enum: (values: string[]) => SchemaWithUtils;

    // ==================== Primitive Schemas ====================

    /**
     * Create a string schema
     */
    string: () => SchemaWithUtils;

    /**
     * Create a string literal schema
     */
    stringLiteral: (literal: string) => SchemaWithUtils;

    /**
     * Create a boolean literal schema
     */
    booleanLiteral: (literal: boolean) => SchemaWithUtils;

    /**
     * Create a date schema (parses ISO strings to Date objects)
     */
    date: () => SchemaWithUtils;

    /**
     * Create a number schema
     */
    number: () => SchemaWithUtils;

    /**
     * Create a bigint schema
     */
    bigint: () => SchemaWithUtils;

    /**
     * Create a boolean schema
     */
    boolean: () => SchemaWithUtils;

    /**
     * Create an any schema (allows any value)
     */
    any: () => SchemaWithUtils;

    /**
     * Create an unknown schema
     */
    unknown: () => SchemaWithUtils;

    /**
     * Create a never schema (always fails validation)
     */
    never: () => SchemaWithUtils;

    // ==================== Schema Wrappers ====================

    /**
     * Create a lazy schema for recursive types
     */
    lazy: (schema: Schema) => SchemaWithUtils;

    /**
     * Create a lazy object schema for recursive object types
     */
    lazyObject: (schema: Schema) => ObjectSchema;

    // ==================== Type Utilities ====================

    /**
     * Schema type utilities
     */
    Schema: {
        /**
         * Get the TypeScript type reference for a schema type
         */
        _getReferenceToType: (args: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }) => ts.TypeNode;

        /**
         * Create a schema from a raw expression
         */
        _fromExpression: (expression: ts.Expression, opts?: { isObject: boolean }) => SchemaWithUtils;

        /**
         * Generate if/else statements for handling MaybeValid results
         */
        _visitMaybeValid: (
            referenceToMaybeValid: ts.Expression,
            visitor: {
                valid: (referenceToValue: ts.Expression) => ts.Statement[];
                invalid: (referenceToErrors: ts.Expression) => ts.Statement[];
            }
        ) => ts.Statement[];
    };

    /**
     * ObjectSchema type utilities
     */
    ObjectSchema: {
        /**
         * Get the TypeScript type reference for an object schema type
         */
        _getReferenceToType: (args: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }) => ts.TypeNode;
    };

    /**
     * MaybeValid result type field names
     */
    MaybeValid: {
        ok: string;
        Valid: {
            value: string;
        };
        Invalid: {
            errors: string;
        };
    };

    /**
     * ValidationError field names
     */
    ValidationError: {
        path: string;
        message: string;
    };

    // ==================== Runtime Configuration ====================

    /**
     * Get npm dependencies required by this format's runtime
     * Returns empty object if no npm dependencies needed
     */
    getRuntimeDependencies: () => Record<string, string>;

    /**
     * Get file patterns for runtime files to copy into generated SDK
     * Returns null if using npm dependency instead of bundled files
     */
    getRuntimeFilePatterns: () => { patterns: string[]; ignore?: string[] } | null;
}

/**
 * Configuration for creating a serialization format
 */
export interface SerializationFormatConfig {
    /**
     * Function to get a reference to an exported name from the format's module
     */
    getReferenceToExport: (args: { manifest: any; exportedName: string }) => Reference;

    /**
     * Whether to generate endpoint metadata
     */
    generateEndpointMetadata: boolean;
}
