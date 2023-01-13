import {
    ExampleContainer,
    ExamplePrimitive,
    ExampleTypeReference,
    ExampleTypeReferenceShape,
} from "@fern-fern/ir-model/types";
import {
    GeneratedTypeReferenceExample,
    GetReferenceOpts,
    TypeReferenceExampleContext,
} from "@fern-typescript/contexts";
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

    public build(context: TypeReferenceExampleContext, opts: GetReferenceOpts): ts.Expression {
        return this.buildExample(this.example, context, opts);
    }

    private buildExample(
        example: ExampleTypeReference,
        context: TypeReferenceExampleContext,
        opts: GetReferenceOpts
    ): ts.Expression {
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
                            ts.factory.createStringLiteral(datetimeExample),
                        ]),
                    _unknown: () => {
                        throw new Error("Unknown primitive example: " + primitiveExample.type);
                    },
                }),
            container: (exampleContainer) => {
                return ExampleContainer._visit<ts.Expression>(exampleContainer, {
                    list: (exampleItems) =>
                        ts.factory.createArrayLiteralExpression(
                            exampleItems.map((exampleItem) => this.buildExample(exampleItem, context, opts))
                        ),
                    set: (exampleItems) =>
                        ts.factory.createNewExpression(ts.factory.createIdentifier("Set"), undefined, [
                            ts.factory.createArrayLiteralExpression(
                                exampleItems.map((exampleItem) => this.buildExample(exampleItem, context, opts))
                            ),
                        ]),
                    map: (examplePairs) =>
                        ts.factory.createObjectLiteralExpression(
                            examplePairs.map((examplePair) =>
                                ts.factory.createPropertyAssignment(
                                    this.getExampleAsPropertyName(examplePair.key),
                                    this.buildExample(examplePair.value, context, opts)
                                )
                            ),
                            true
                        ),
                    optional: (exampleItem) =>
                        exampleItem != null
                            ? this.buildExample(exampleItem, context, opts)
                            : ts.factory.createIdentifier("undefined"),
                    _unknown: () => {
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
            _unknown: () => {
                throw new Error("Unknown example type: " + example.shape.type);
            },
        });
    }

    private getExampleAsPropertyName(example: ExampleTypeReference): ts.PropertyName {
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
                    _unknown: () => {
                        throw new Error("Unknown primitive example: " + primitiveExample.type);
                    },
                }),
            container: () => {
                throw new Error("Cannot convert container to property name");
            },
            named: ({ shape: example }) => {
                if (example.type !== "alias") {
                    throw new Error("Cannot convert non-alias named type to property name");
                }
                return this.getExampleAsPropertyName(example.value);
            },
            unknown: () => {
                throw new Error("Cannot convert unknown to property name");
            },
            _unknown: () => {
                throw new Error("Unknown example type: " + example.shape.type);
            },
        });
    }
}
