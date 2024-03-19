import { SchemaOptions } from "@fern-typescript/zurg";
import { ts } from "ts-morph";

export interface Zurg {
    object: (properties: Zurg.Property[]) => Zurg.ObjectSchema;
    objectWithoutOptionalProperties: (properties: Zurg.Property[]) => Zurg.ObjectSchema;
    union: (args: Zurg.union.Args) => Zurg.ObjectLikeSchema;
    undiscriminatedUnion: (schemas: Zurg.Schema[]) => Zurg.Schema;
    list: (itemSchema: Zurg.Schema) => Zurg.Schema;
    set: (itemSchema: Zurg.Schema) => Zurg.Schema;
    record: (args: { keySchema: Zurg.Schema; valueSchema: Zurg.Schema }) => Zurg.Schema;
    enum: (values: string[]) => Zurg.Schema;
    string: () => Zurg.Schema;
    stringLiteral: (literal: string) => Zurg.Schema;
    booleanLiteral: (literal: boolean) => Zurg.Schema;
    date: () => Zurg.Schema;
    number: () => Zurg.Schema;
    boolean: () => Zurg.Schema;
    any: () => Zurg.Schema;
    unknown: () => Zurg.Schema;
    lazy: (schema: Zurg.Schema) => Zurg.Schema;
    lazyObject: (schema: Zurg.Schema) => Zurg.ObjectSchema;

    Schema: {
        _getReferenceToType: (args: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }) => ts.TypeNode;
        _fromExpression: (expression: ts.Expression, opts?: { isObject: boolean }) => Zurg.Schema;
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

    MaybeValid: {
        ok: "ok";

        Valid: {
            value: "value";
        };

        Invalid: {
            errors: "errors";
        };
    };

    ValidationError: {
        path: "path";
        message: "message";
    };
}

export declare namespace Zurg {
    interface Schema extends BaseSchema, SchemaUtils {}

    interface BaseSchema {
        toExpression: () => ts.Expression;
        isOptional: boolean;
    }

    interface SchemaUtils {
        parse: (raw: ts.Expression, opts: Required<SchemaOptions>) => ts.Expression;
        json: (parsed: ts.Expression, opts: Required<SchemaOptions>) => ts.Expression;
        parseOrThrow: (raw: ts.Expression, opts: Required<SchemaOptions>) => ts.Expression;
        jsonOrThrow: (parsed: ts.Expression, opts: Required<SchemaOptions>) => ts.Expression;
        optional: () => Zurg.Schema;
        transform: (args: {
            newShape: ts.TypeNode | undefined;
            transform: ts.Expression;
            untransform: ts.Expression;
        }) => Zurg.Schema;
    }

    interface ObjectLikeSchema extends Schema, ObjectLikeUtils {}

    interface ObjectLikeUtils {
        withParsedProperties: (properties: Zurg.AdditionalProperty[]) => Zurg.ObjectLikeSchema;
    }

    interface AdditionalProperty {
        key: string;
        getValue: (args: { getReferenceToParsed: () => ts.Expression }) => ts.Expression;
    }

    interface ObjectSchema extends Schema, ObjectLikeUtils, ObjectUtils {}

    interface ObjectUtils {
        extend: (extension: Zurg.Schema) => ObjectSchema;
    }

    interface Property {
        key: {
            parsed: string;
            raw: string;
        };
        value: Schema;
    }

    namespace union {
        interface Args {
            parsedDiscriminant: string;
            rawDiscriminant: string;
            singleUnionTypes: Zurg.union.SingleUnionType[];
        }

        interface SingleUnionType {
            discriminantValue: string;
            nonDiscriminantProperties: Zurg.ObjectSchema;
        }
    }
}
