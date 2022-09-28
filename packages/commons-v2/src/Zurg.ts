import { ts } from "ts-morph";

export interface Zurg {
    object: (properties: Zurg.Property[]) => Zurg.ObjectSchema;
    union: (args: Zurg.union.Args) => Zurg.ObjectLikeSchema;
    list: (itemSchema: Zurg.Schema) => Zurg.Schema;
    set: (itemSchema: Zurg.Schema) => Zurg.Schema;
    record: (args: { keySchema: Zurg.Schema; valueSchema: Zurg.Schema }) => Zurg.Schema;
    enum: (values: string[]) => Zurg.Schema;
    string: () => Zurg.Schema;
    stringLiteral: (literal: string) => Zurg.Schema;
    number: () => Zurg.Schema;
    boolean: () => Zurg.Schema;
    any: () => Zurg.Schema;
    unknown: () => Zurg.Schema;
    lazy: (schema: Zurg.Schema) => Zurg.Schema;
    lazyObject: (schema: Zurg.Schema) => Zurg.ObjectSchema;

    Schema: {
        _getReferenceToType: (args: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }) => ts.TypeNode;
        _fromExpression: (expression: ts.Expression) => Zurg.Schema;
        _fromArrowFunctions: (args: { parse: ts.ArrowFunction; json: ts.ArrowFunction }) => Zurg.Schema;
    };

    ObjectSchema: {
        _getReferenceToType: (args: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }) => ts.TypeNode;
    };
}

export declare namespace Zurg {
    interface Schema extends BaseSchema, SchemaUtils {}

    interface BaseSchema {
        toExpression: () => ts.Expression;
    }

    interface SchemaUtils {
        optional: () => Zurg.Schema;
        transform: (args: { newShape: ts.TypeNode; parse: ts.ArrowFunction; json: ts.ArrowFunction }) => Zurg.Schema;
    }

    interface ObjectLikeSchema extends Schema, ObjectLikeUtils {}

    interface ObjectLikeUtils {
        withProperties: (properties: Zurg.AdditionalProperty[]) => Zurg.ObjectLikeSchema;
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
            nonDiscriminantProperties:
                | { isInline: true; properties: Zurg.Property[] }
                | { isInline: false; objectSchema: Zurg.Schema };
        }
    }
}
