import { GetReferenceOpts } from "@fern-typescript/commons";
import { BaseContext, GeneratedTypeReferenceExample } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { assertNever } from "@fern-api/core-utils";

import {
    ExampleContainer,
    ExamplePrimitive,
    ExampleTypeReference,
    ExampleTypeReferenceShape
} from "@fern-fern/ir-sdk/api";

export declare namespace GeneratedTypeReferenceExampleImpl {
    export interface Init {
        example: ExampleTypeReference;
    }
}

export class GeneratedTypeReferenceExampleImpl implements GeneratedTypeReferenceExample {
    private example: ExampleTypeReference;

    constructor({ example }: GeneratedTypeReferenceExampleImpl.Init) {
        this.example = example;
    }

    public build(context: BaseContext, opts: GetReferenceOpts): ts.Expression {
        return this.buildExample({ example: this.example, context, opts });
    }

    private buildExample({
        example,
        context,
        opts
    }: {
        example: ExampleTypeReference;
        context: BaseContext;
        opts: GetReferenceOpts;
    }): ts.Expression {
        return ExampleTypeReferenceShape._visit(example.shape, {
            primitive: (primitiveExample) =>
                ExamplePrimitive._visit<ts.Expression>(primitiveExample, {
                    string: (stringExample) => ts.factory.createStringLiteral(stringExample.original),
                    integer: (integerExample) => ts.factory.createNumericLiteral(integerExample),
                    double: (doubleExample) => ts.factory.createNumericLiteral(doubleExample),
                    long: (longExample) => ts.factory.createNumericLiteral(longExample),
                    uint: (uintExample) => ts.factory.createNumericLiteral(uintExample),
                    uint64: (uint64Example) => ts.factory.createNumericLiteral(uint64Example),
                    float: (floatExample) => ts.factory.createNumericLiteral(floatExample),
                    bigInteger: (bigIntegerExample) => ts.factory.createStringLiteral(bigIntegerExample),
                    base64: (base64Example) => ts.factory.createStringLiteral(base64Example),
                    boolean: (booleanExample) => (booleanExample ? ts.factory.createTrue() : ts.factory.createFalse()),
                    uuid: (uuidExample) => ts.factory.createStringLiteral(uuidExample),
                    datetime: (datetimeExample) => {
                        if (context.includeSerdeLayer != null && datetimeExample.raw != null) {
                            return ts.factory.createStringLiteral(datetimeExample.raw);
                        } else {
                            return ts.factory.createNewExpression(ts.factory.createIdentifier("Date"), undefined, [
                                ts.factory.createStringLiteral(datetimeExample.datetime.toISOString())
                            ]);
                        }
                    },
                    date: (dateExample) => ts.factory.createStringLiteral(dateExample),
                    _other: () => {
                        throw new Error("Unknown primitive example: " + primitiveExample.type);
                    }
                }),
            container: (exampleContainer) => {
                return ExampleContainer._visit<ts.Expression>(exampleContainer, {
                    list: (exampleItems) =>
                        ts.factory.createArrayLiteralExpression(
                            exampleItems.list.map((exampleItem) =>
                                this.buildExample({ example: exampleItem, context, opts })
                            )
                        ),
                    set: (exampleItems) =>
                        ts.factory.createNewExpression(ts.factory.createIdentifier("Set"), undefined, [
                            ts.factory.createArrayLiteralExpression(
                                exampleItems.set.map((exampleItem) =>
                                    this.buildExample({ example: exampleItem, context, opts })
                                )
                            )
                        ]),
                    map: (examplePairs) =>
                        ts.factory.createObjectLiteralExpression(
                            examplePairs.map.map((examplePair) =>
                                ts.factory.createPropertyAssignment(
                                    this.getExampleAsPropertyName({ example: examplePair.key, context, opts }),
                                    this.buildExample({ example: examplePair.value, context, opts })
                                )
                            ),
                            true
                        ),
                    optional: (exampleItem) =>
                        exampleItem.optional != null
                            ? this.buildExample({ example: exampleItem.optional, context, opts })
                            : ts.factory.createIdentifier("undefined"),
                    literal: (exampleItem) =>
                        exampleItem != null
                            ? this.buildExample({
                                  example: {
                                      jsonExample: this.getJsonExampleForPrimitive(exampleItem.literal),
                                      shape: ExampleTypeReferenceShape.primitive(exampleItem.literal)
                                  },
                                  context,
                                  opts
                              })
                            : ts.factory.createIdentifier("undefined"),
                    _other: () => {
                        throw new Error("Unknown example container type: " + exampleContainer.type);
                    }
                });
            },
            named: ({ typeName, shape: example }) => {
                return context.type.getGeneratedType(typeName).buildExample(example, context, opts);
            },
            unknown: (value) => {
                const parsed = ts.parseJsonText("example.json", JSON.stringify(value, undefined, 4)).statements[0];
                if (parsed == null) {
                    throw new Error("Could not parse unknown example");
                }
                return parsed.expression;
            },
            _other: () => {
                throw new Error("Unknown example type: " + example.shape.type);
            }
        });
    }

    private getJsonExampleForPrimitive(primitiveExample: ExamplePrimitive): unknown {
        switch (primitiveExample.type) {
            case "string":
                return `"${primitiveExample.string.original}"`;
            case "integer":
                return primitiveExample.integer;
            case "double":
                return primitiveExample.double;
            case "long":
                return primitiveExample.long;
            case "boolean":
                return primitiveExample.boolean;
            case "uuid":
                return `"${primitiveExample.uuid}"`;
            case "datetime":
                return `"${primitiveExample.datetime.toISOString()}"`;
            case "date":
                return `"${primitiveExample.date}"`;
            case "uint":
                return primitiveExample.uint;
            case "uint64":
                return primitiveExample.uint64;
            case "float":
                return primitiveExample.float;
            case "bigInteger":
                return `"${primitiveExample.bigInteger}"`;
            case "base64":
                return `"${primitiveExample.base64}"`;
            default:
                assertNever(primitiveExample);
        }
    }

    private getExampleAsPropertyName({
        example,
        context,
        opts
    }: {
        example: ExampleTypeReference;
        context: BaseContext;
        opts: GetReferenceOpts;
    }): ts.PropertyName {
        return ExampleTypeReferenceShape._visit<ts.PropertyName>(example.shape, {
            primitive: (primitiveExample) =>
                ExamplePrimitive._visit<ts.PropertyName>(primitiveExample, {
                    string: (stringExample) => ts.factory.createStringLiteral(stringExample.original),
                    integer: (integerExample) => ts.factory.createNumericLiteral(integerExample),
                    double: (doubleExample) => ts.factory.createNumericLiteral(doubleExample),
                    long: (longExample) => ts.factory.createNumericLiteral(longExample),
                    boolean: (booleanExample) =>
                        booleanExample ? ts.factory.createIdentifier("true") : ts.factory.createIdentifier("false"),
                    uint: (uintExample) => ts.factory.createNumericLiteral(uintExample),
                    uint64: (uint64Example) => ts.factory.createNumericLiteral(uint64Example),
                    float: (floatExample) => ts.factory.createNumericLiteral(floatExample),
                    bigInteger: (bigIntegerExample) => ts.factory.createStringLiteral(bigIntegerExample),
                    base64: (base64Example) => ts.factory.createStringLiteral(base64Example),
                    uuid: (uuidExample) => ts.factory.createStringLiteral(uuidExample),
                    datetime: () => {
                        throw new Error("Cannot convert datetime to property name");
                    },
                    date: (dateExample) => ts.factory.createStringLiteral(dateExample),
                    _other: () => {
                        throw new Error("Unknown primitive example: " + primitiveExample.type);
                    }
                }),
            container: (containerExample) => {
                switch (containerExample.type) {
                    case "literal":
                        return this.getExampleAsPropertyName({
                            example: {
                                shape: ExampleTypeReferenceShape.primitive(containerExample.literal),
                                jsonExample: example.jsonExample
                            },
                            context,
                            opts
                        });
                }
                throw new Error("Cannot convert container to property name");
            },
            named: ({ shape: example, typeName }) => {
                switch (example.type) {
                    case "object":
                        throw new Error("Cannot convert object to property name");
                    case "union":
                        throw new Error("Cannot convert union to property name");
                    case "enum": {
                        const generatedType = context.type.getGeneratedType(typeName);
                        if (generatedType.type !== "enum") {
                            throw new Error("Type is not an enum: " + typeName.name.originalName);
                        }
                        return ts.factory.createComputedPropertyName(
                            generatedType.buildExample(example, context, opts)
                        );
                    }
                    case "alias":
                        return this.getExampleAsPropertyName({ example: example.value, context, opts });
                    case "undiscriminatedUnion":
                        return this.getExampleAsPropertyName({
                            example: example.singleUnionType,
                            context,
                            opts
                        });
                    default:
                        assertNever(example);
                }
            },
            unknown: () => {
                throw new Error("Cannot convert unknown to property name");
            },
            _other: () => {
                throw new Error("Unknown example type: " + example.shape.type);
            }
        });
    }
}
