import { assertNever } from "@fern-api/core-utils";
import {
    ExampleContainer,
    ExamplePrimitive,
    ExampleTypeReference,
    ExampleTypeReferenceShape,
} from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts } from "@fern-typescript/commons";
import { GeneratedTypeReferenceExample, ModelContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

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

    public build(context: ModelContext, opts: GetReferenceOpts): ts.Expression {
        return this.buildExample({ example: this.example, context, opts });
    }

    private buildExample({
        example,
        context,
        opts,
    }: {
        example: ExampleTypeReference;
        context: ModelContext;
        opts: GetReferenceOpts;
    }): ts.Expression {
        return ExampleTypeReferenceShape._visit(example.shape, {
            primitive: (primitiveExample) =>
                ExamplePrimitive._visit<ts.Expression>(primitiveExample, {
                    string: (stringExample) => ts.factory.createStringLiteral(stringExample),
                    integer: (integerExample) => ts.factory.createNumericLiteral(integerExample),
                    double: (doubleExample) => ts.factory.createNumericLiteral(doubleExample),
                    long: (longExample) => ts.factory.createNumericLiteral(longExample),
                    boolean: (booleanExample) => (booleanExample ? ts.factory.createTrue() : ts.factory.createFalse()),
                    uuid: (uuidExample) => ts.factory.createStringLiteral(uuidExample),
                    datetime: (datetimeExample) =>
                        ts.factory.createNewExpression(ts.factory.createIdentifier("Date"), undefined, [
                            ts.factory.createStringLiteral(datetimeExample.toISOString()),
                        ]),
                    date: (dateExample) => ts.factory.createStringLiteral(dateExample),
                    _other: () => {
                        throw new Error("Unknown primitive example: " + primitiveExample.type);
                    },
                }),
            container: (exampleContainer) => {
                return ExampleContainer._visit<ts.Expression>(exampleContainer, {
                    list: (exampleItems) =>
                        ts.factory.createArrayLiteralExpression(
                            exampleItems.map((exampleItem) =>
                                this.buildExample({ example: exampleItem, context, opts })
                            )
                        ),
                    set: (exampleItems) =>
                        ts.factory.createNewExpression(ts.factory.createIdentifier("Set"), undefined, [
                            ts.factory.createArrayLiteralExpression(
                                exampleItems.map((exampleItem) =>
                                    this.buildExample({ example: exampleItem, context, opts })
                                )
                            ),
                        ]),
                    map: (examplePairs) =>
                        ts.factory.createObjectLiteralExpression(
                            examplePairs.map((examplePair) =>
                                ts.factory.createPropertyAssignment(
                                    this.getExampleAsPropertyName({ example: examplePair.key, context, opts }),
                                    this.buildExample({ example: examplePair.value, context, opts })
                                )
                            ),
                            true
                        ),
                    optional: (exampleItem) =>
                        exampleItem != null
                            ? this.buildExample({ example: exampleItem, context, opts })
                            : ts.factory.createIdentifier("undefined"),
                    _other: () => {
                        throw new Error("Unknown example container type: " + exampleContainer.type);
                    },
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
            },
        });
    }

    private getExampleAsPropertyName({
        example,
        context,
        opts,
    }: {
        example: ExampleTypeReference;
        context: ModelContext;
        opts: GetReferenceOpts;
    }): ts.PropertyName {
        return ExampleTypeReferenceShape._visit<ts.PropertyName>(example.shape, {
            primitive: (primitiveExample) =>
                ExamplePrimitive._visit<ts.PropertyName>(primitiveExample, {
                    string: (stringExample) => ts.factory.createStringLiteral(stringExample),
                    integer: (integerExample) => ts.factory.createNumericLiteral(integerExample),
                    double: (doubleExample) => ts.factory.createNumericLiteral(doubleExample),
                    long: (longExample) => ts.factory.createNumericLiteral(longExample),
                    boolean: (booleanExample) =>
                        booleanExample ? ts.factory.createIdentifier("true") : ts.factory.createIdentifier("false"),
                    uuid: (uuidExample) => ts.factory.createStringLiteral(uuidExample),
                    datetime: () => {
                        throw new Error("Cannot convert datetime to property name");
                    },
                    date: (dateExample) => ts.factory.createStringLiteral(dateExample),
                    _other: () => {
                        throw new Error("Unknown primitive example: " + primitiveExample.type);
                    },
                }),
            container: () => {
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
                    default:
                        assertNever(example);
                }
            },
            unknown: () => {
                throw new Error("Cannot convert unknown to property name");
            },
            _other: () => {
                throw new Error("Unknown example type: " + example.shape.type);
            },
        });
    }
}
