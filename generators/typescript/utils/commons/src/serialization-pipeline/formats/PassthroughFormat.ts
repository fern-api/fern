import { ts } from "ts-morph";

import { SerializationFormat } from "../SerializationFormat";

/**
 * A no-op schema that does nothing - used when serialization is disabled.
 */
const NO_OP_SCHEMA: SerializationFormat.SchemaWithUtils = {
    toExpression: () => ts.factory.createIdentifier("undefined"),
    isOptional: false,
    isNullable: false,
    parse: (raw) => raw,
    json: (parsed) => parsed,
    parseOrThrow: (raw) => raw,
    jsonOrThrow: (parsed) => parsed,
    nullable: () => NO_OP_SCHEMA,
    optional: () => NO_OP_SCHEMA,
    optionalNullable: () => NO_OP_SCHEMA,
    transform: () => NO_OP_SCHEMA
};

/**
 * A no-op object schema
 */
const NO_OP_OBJECT_SCHEMA: SerializationFormat.ObjectSchema = {
    ...NO_OP_SCHEMA,
    withParsedProperties: () => NO_OP_OBJECT_SCHEMA as SerializationFormat.ObjectLikeSchema,
    extend: () => NO_OP_OBJECT_SCHEMA,
    passthrough: () => NO_OP_OBJECT_SCHEMA
};

/**
 * PassthroughFormat - used when serialization is completely disabled.
 * All schema builders return no-op schemas that don't generate any code.
 * Data passes through without transformation.
 */
export class PassthroughFormat implements SerializationFormat {
    public readonly name = "none" as const;

    constructor(_config: SerializationFormat.Config) {
        // No configuration needed for passthrough format
    }

    // All schema builders return no-op schemas
    public object = (_properties: SerializationFormat.Property[]): SerializationFormat.ObjectSchema =>
        NO_OP_OBJECT_SCHEMA;
    public objectWithoutOptionalProperties = (
        _properties: SerializationFormat.Property[]
    ): SerializationFormat.ObjectSchema => NO_OP_OBJECT_SCHEMA;
    public union = (_args: SerializationFormat.UnionArgs): SerializationFormat.ObjectLikeSchema =>
        NO_OP_OBJECT_SCHEMA as SerializationFormat.ObjectLikeSchema;
    public undiscriminatedUnion = (_schemas: SerializationFormat.Schema[]): SerializationFormat.SchemaWithUtils =>
        NO_OP_SCHEMA;
    public list = (_itemSchema: SerializationFormat.Schema): SerializationFormat.SchemaWithUtils => NO_OP_SCHEMA;
    public set = (_itemSchema: SerializationFormat.Schema): SerializationFormat.SchemaWithUtils => NO_OP_SCHEMA;
    public record = (_args: {
        keySchema: SerializationFormat.Schema;
        valueSchema: SerializationFormat.Schema;
    }): SerializationFormat.SchemaWithUtils => NO_OP_SCHEMA;
    public enum = (_values: string[]): SerializationFormat.SchemaWithUtils => NO_OP_SCHEMA;
    public string = (): SerializationFormat.SchemaWithUtils => NO_OP_SCHEMA;
    public stringLiteral = (_literal: string): SerializationFormat.SchemaWithUtils => NO_OP_SCHEMA;
    public booleanLiteral = (_literal: boolean): SerializationFormat.SchemaWithUtils => NO_OP_SCHEMA;
    public date = (): SerializationFormat.SchemaWithUtils => NO_OP_SCHEMA;
    public number = (): SerializationFormat.SchemaWithUtils => NO_OP_SCHEMA;
    public bigint = (): SerializationFormat.SchemaWithUtils => NO_OP_SCHEMA;
    public boolean = (): SerializationFormat.SchemaWithUtils => NO_OP_SCHEMA;
    public any = (): SerializationFormat.SchemaWithUtils => NO_OP_SCHEMA;
    public unknown = (): SerializationFormat.SchemaWithUtils => NO_OP_SCHEMA;
    public never = (): SerializationFormat.SchemaWithUtils => NO_OP_SCHEMA;
    public lazy = (_schema: SerializationFormat.Schema): SerializationFormat.SchemaWithUtils => NO_OP_SCHEMA;
    public lazyObject = (_schema: SerializationFormat.Schema): SerializationFormat.ObjectSchema => NO_OP_OBJECT_SCHEMA;

    public Schema = {
        _getReferenceToType: (_args: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }): ts.TypeNode => {
            return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
        },
        _fromExpression: (
            _expression: ts.Expression,
            _opts?: { isObject: boolean }
        ): SerializationFormat.SchemaWithUtils => {
            return NO_OP_SCHEMA;
        },
        _visitMaybeValid: (
            _referenceToMaybeValid: ts.Expression,
            _visitor: {
                valid: (referenceToValue: ts.Expression) => ts.Statement[];
                invalid: (referenceToErrors: ts.Expression) => ts.Statement[];
            }
        ): ts.Statement[] => {
            return [];
        }
    };

    public ObjectSchema = {
        _getReferenceToType: (_args: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }): ts.TypeNode => {
            return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
        }
    };

    public MaybeValid = {
        ok: "ok" as const,
        Valid: {
            value: "value" as const
        },
        Invalid: {
            errors: "errors" as const
        }
    };

    public ValidationError = {
        path: "path" as const,
        message: "message" as const
    };

    public getRuntimeDependencies(): Record<string, string> {
        return {};
    }

    public getRuntimeFilePatterns(): { patterns: string[]; ignore?: string[] } | null {
        return null; // No runtime files needed
    }
}
