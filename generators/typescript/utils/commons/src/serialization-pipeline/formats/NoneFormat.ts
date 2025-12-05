import { ts } from "ts-morph";

import {
    AdditionalProperty,
    ObjectLikeSchema,
    ObjectSchema,
    Property,
    Schema,
    SchemaOptions,
    SchemaWithUtils,
    SerializationFormat,
    SerializationFormatConfig,
    UnionArgs
} from "../SerializationFormat";

/**
 * A no-op schema that does nothing - used when serialization is disabled.
 */
const NO_OP_SCHEMA: SchemaWithUtils = {
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
const NO_OP_OBJECT_SCHEMA: ObjectSchema = {
    ...NO_OP_SCHEMA,
    withParsedProperties: () => NO_OP_OBJECT_SCHEMA as ObjectLikeSchema,
    extend: () => NO_OP_OBJECT_SCHEMA,
    passthrough: () => NO_OP_OBJECT_SCHEMA
};

/**
 * NoneFormat - used when serialization is completely disabled.
 * All schema builders return no-op schemas that don't generate any code.
 */
export class NoneFormat implements SerializationFormat {
    public readonly name = "none" as const;

    constructor(_config: SerializationFormatConfig) {
        // No configuration needed for none format
    }

    // All schema builders return no-op schemas
    public object = (_properties: Property[]): ObjectSchema => NO_OP_OBJECT_SCHEMA;
    public objectWithoutOptionalProperties = (_properties: Property[]): ObjectSchema => NO_OP_OBJECT_SCHEMA;
    public union = (_args: UnionArgs): ObjectLikeSchema => NO_OP_OBJECT_SCHEMA as ObjectLikeSchema;
    public undiscriminatedUnion = (_schemas: Schema[]): SchemaWithUtils => NO_OP_SCHEMA;
    public list = (_itemSchema: Schema): SchemaWithUtils => NO_OP_SCHEMA;
    public set = (_itemSchema: Schema): SchemaWithUtils => NO_OP_SCHEMA;
    public record = (_args: { keySchema: Schema; valueSchema: Schema }): SchemaWithUtils => NO_OP_SCHEMA;
    public enum = (_values: string[]): SchemaWithUtils => NO_OP_SCHEMA;
    public string = (): SchemaWithUtils => NO_OP_SCHEMA;
    public stringLiteral = (_literal: string): SchemaWithUtils => NO_OP_SCHEMA;
    public booleanLiteral = (_literal: boolean): SchemaWithUtils => NO_OP_SCHEMA;
    public date = (): SchemaWithUtils => NO_OP_SCHEMA;
    public number = (): SchemaWithUtils => NO_OP_SCHEMA;
    public bigint = (): SchemaWithUtils => NO_OP_SCHEMA;
    public boolean = (): SchemaWithUtils => NO_OP_SCHEMA;
    public any = (): SchemaWithUtils => NO_OP_SCHEMA;
    public unknown = (): SchemaWithUtils => NO_OP_SCHEMA;
    public never = (): SchemaWithUtils => NO_OP_SCHEMA;
    public lazy = (_schema: Schema): SchemaWithUtils => NO_OP_SCHEMA;
    public lazyObject = (_schema: Schema): ObjectSchema => NO_OP_OBJECT_SCHEMA;

    public Schema = {
        _getReferenceToType: (_args: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }): ts.TypeNode => {
            return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
        },
        _fromExpression: (_expression: ts.Expression, _opts?: { isObject: boolean }): SchemaWithUtils => {
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
