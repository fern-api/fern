import { RelativeFilePath } from "@fern-api/fs-utils";
import { Zurg } from "@fern-typescript/commons-v2";
import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { CoreUtility } from "../CoreUtility";

export class ZurgImpl extends CoreUtility implements Zurg {
    public readonly MANIFEST = {
        name: "zurg",
        repoInfoForTesting: {
            path: RelativeFilePath.of("packages/core-utilities/zurg/src"),
            ignoreGlob: "**/__test__",
        },
        originalPathOnDocker: "/assets/zurg" as const,
        pathInCoreUtilities: [{ nameOnDisk: "schemas", exportDeclaration: { namespaceExport: "schemas" } }],
    };

    public object = this.withExportedName("object", (object) => (properties: Zurg.Property[]): Zurg.ObjectSchema => {
        const baseSchema: Zurg.BaseSchema = {
            toExpression: () =>
                ts.factory.createCallExpression(object.getExpression(), undefined, [
                    this.constructObjectLiteralForProperties(properties),
                ]),
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
            ...this.getObjectLikeUtils(baseSchema),
            ...this.getObjectUtils(baseSchema),
        };
    });

    private constructObjectLiteralForProperties(properties: Zurg.Property[]): ts.ObjectLiteralExpression {
        return ts.factory.createObjectLiteralExpression(
            properties.map((property) => {
                let value = property.value.toExpression();
                if (property.key.raw !== property.key.parsed) {
                    value = this.property(property.key.raw, value);
                }
                return ts.factory.createPropertyAssignment(property.key.parsed, value);
            }),
            true
        );
    }

    private getObjectUtils(objectSchema: Zurg.BaseSchema): Zurg.ObjectUtils {
        return {
            extend: (extension) => this.extend(objectSchema, extension),
        };
    }

    private extend(objectSchema: Zurg.BaseSchema, extension: Zurg.BaseSchema): Zurg.ObjectSchema {
        const baseSchema: Zurg.BaseSchema = {
            toExpression: () =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        objectSchema.toExpression(),
                        ts.factory.createIdentifier("extend")
                    ),
                    undefined,
                    [extension.toExpression()]
                ),
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
            ...this.getObjectLikeUtils(baseSchema),
            ...this.getObjectUtils(baseSchema),
        };
    }

    private property = this.withExportedName(
        "property",
        (property) =>
            (rawValue: string, value: ts.Expression): ts.Expression => {
                return ts.factory.createCallExpression(property.getExpression(), undefined, [
                    ts.factory.createStringLiteral(rawValue),
                    value,
                ]);
            }
    );

    private getObjectLikeUtils(objectLike: Zurg.BaseSchema): Zurg.ObjectLikeUtils {
        return {
            withProperties: (additionalProperties: Zurg.AdditionalProperty[]) =>
                this.withProperties(objectLike, additionalProperties),
        };
    }

    private withProperties(
        objectLike: Zurg.BaseSchema,
        additionalProperties: Zurg.AdditionalProperty[]
    ): Zurg.ObjectLikeSchema {
        const baseSchema: Zurg.BaseSchema = {
            toExpression: () =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        objectLike.toExpression(),
                        ts.factory.createIdentifier("withProperties")
                    ),
                    undefined,
                    [
                        ts.factory.createObjectLiteralExpression(
                            additionalProperties.map((property) => {
                                const parsedIdentifier = ts.factory.createIdentifier("parsed");
                                const context = { didAccessParsed: false };
                                const getReferenceToParsed = () => {
                                    context.didAccessParsed = true;
                                    return parsedIdentifier;
                                };

                                const value = property.getValue({ getReferenceToParsed });

                                return ts.factory.createPropertyAssignment(
                                    property.key,
                                    context.didAccessParsed
                                        ? ts.factory.createArrowFunction(
                                              undefined,
                                              undefined,
                                              [
                                                  ts.factory.createParameterDeclaration(
                                                      undefined,
                                                      undefined,
                                                      undefined,
                                                      parsedIdentifier
                                                  ),
                                              ],
                                              undefined,
                                              undefined,
                                              value
                                          )
                                        : ts.isCallExpression(value)
                                        ? ts.factory.createArrowFunction(
                                              undefined,
                                              undefined,
                                              [],
                                              undefined,
                                              undefined,
                                              value
                                          )
                                        : value
                                );
                            }),
                            true
                        ),
                    ]
                ),
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
            ...this.getObjectLikeUtils(baseSchema),
        };
    }

    public union = this.withExportedName(
        "union",
        (union: Reference) =>
            ({ parsedDiscriminant, rawDiscriminant, singleUnionTypes }: Zurg.union.Args): Zurg.ObjectLikeSchema => {
                const discriminantArgument =
                    parsedDiscriminant === rawDiscriminant
                        ? ts.factory.createStringLiteral(parsedDiscriminant)
                        : this.discriminant({ parsedDiscriminant, rawDiscriminant });

                const baseSchema = {
                    toExpression: () =>
                        ts.factory.createCallExpression(union.getExpression(), undefined, [
                            discriminantArgument,
                            ts.factory.createObjectLiteralExpression(
                                singleUnionTypes.map((singleUnionType) =>
                                    ts.factory.createPropertyAssignment(
                                        singleUnionType.discriminantValue,
                                        singleUnionType.nonDiscriminantProperties.isInline
                                            ? this.object(
                                                  singleUnionType.nonDiscriminantProperties.properties
                                              ).toExpression()
                                            : singleUnionType.nonDiscriminantProperties.objectSchema.toExpression()
                                    )
                                ),
                                true
                            ),
                        ]),
                };

                return {
                    ...baseSchema,
                    ...this.getSchemaUtils(baseSchema),
                    ...this.getObjectLikeUtils(baseSchema),
                };
            }
    );

    private discriminant = this.withExportedName(
        "discriminant",
        (discriminant) =>
            ({
                parsedDiscriminant,
                rawDiscriminant,
            }: {
                parsedDiscriminant: string;
                rawDiscriminant: string;
            }): ts.Expression => {
                return ts.factory.createCallExpression(discriminant.getExpression(), undefined, [
                    ts.factory.createStringLiteral(parsedDiscriminant),
                    ts.factory.createStringLiteral(rawDiscriminant),
                ]);
            }
    );

    public list = this.withExportedName("list", (list: Reference) => (itemSchema: Zurg.Schema) => {
        const baseSchema: Zurg.BaseSchema = {
            toExpression: () =>
                ts.factory.createCallExpression(list.getExpression(), undefined, [itemSchema.toExpression()]),
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
        };
    });

    public set = this.withExportedName("set", (set: Reference) => (itemSchema: Zurg.Schema) => {
        const baseSchema: Zurg.BaseSchema = {
            toExpression: () =>
                ts.factory.createCallExpression(set.getExpression(), undefined, [itemSchema.toExpression()]),
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
        };
    });

    public record = this.withExportedName(
        "record",
        (record: Reference) =>
            ({ keySchema, valueSchema }: { keySchema: Zurg.Schema; valueSchema: Zurg.Schema }) => {
                const baseSchema: Zurg.BaseSchema = {
                    toExpression: () =>
                        ts.factory.createCallExpression(record.getExpression(), undefined, [
                            keySchema.toExpression(),
                            valueSchema.toExpression(),
                        ]),
                };

                return {
                    ...baseSchema,
                    ...this.getSchemaUtils(baseSchema),
                };
            }
    );

    public enum = this.withExportedName("enum_", (enum_: Reference) => (values: string[]) => {
        const baseSchema: Zurg.BaseSchema = {
            toExpression: () =>
                ts.factory.createCallExpression(enum_.getExpression(), undefined, [
                    ts.factory.createArrayLiteralExpression(
                        values.map((value) => ts.factory.createStringLiteral(value))
                    ),
                ]),
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
        };
    });

    public string = this.withExportedName("string", (string: Reference) => () => {
        const baseSchema: Zurg.BaseSchema = {
            toExpression: () => ts.factory.createCallExpression(string.getExpression(), undefined, undefined),
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
        };
    });

    public stringLiteral = this.withExportedName("stringLiteral", (stringLiteral: Reference) => (literal: string) => {
        const baseSchema: Zurg.BaseSchema = {
            toExpression: () =>
                ts.factory.createCallExpression(stringLiteral.getExpression(), undefined, [
                    ts.factory.createStringLiteral(literal),
                ]),
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
        };
    });

    public number = this.withExportedName("number", (number: Reference) => () => {
        const baseSchema: Zurg.BaseSchema = {
            toExpression: () => ts.factory.createCallExpression(number.getExpression(), undefined, undefined),
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
        };
    });

    public boolean = this.withExportedName("boolean", (boolean: Reference) => () => {
        const baseSchema: Zurg.BaseSchema = {
            toExpression: () => ts.factory.createCallExpression(boolean.getExpression(), undefined, undefined),
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
        };
    });

    public date = this.withExportedName("date", (date: Reference) => () => {
        const baseSchema: Zurg.BaseSchema = {
            toExpression: () => ts.factory.createCallExpression(date.getExpression(), undefined, undefined),
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
        };
    });

    public any = this.withExportedName("any", (any: Reference) => () => {
        const baseSchema: Zurg.BaseSchema = {
            toExpression: () => ts.factory.createCallExpression(any.getExpression(), undefined, undefined),
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
        };
    });

    public unknown = this.withExportedName("unknown", (unknown: Reference) => () => {
        const baseSchema: Zurg.BaseSchema = {
            toExpression: () => ts.factory.createCallExpression(unknown.getExpression(), undefined, undefined),
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
        };
    });

    private getSchemaUtils(baseSchema: Zurg.BaseSchema): Zurg.SchemaUtils {
        return {
            optional: () => this.optional(baseSchema),
            parse: (raw) =>
                ts.factory.createAwaitExpression(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(baseSchema.toExpression(), "parse"),
                        undefined,
                        [raw]
                    )
                ),
            json: (parsed) =>
                ts.factory.createAwaitExpression(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(baseSchema.toExpression(), "json"),
                        undefined,
                        [parsed]
                    )
                ),
            transform: ({
                newShape,
                parse,
                json,
            }: {
                newShape: ts.TypeNode | undefined;
                parse: ts.Expression;
                json: ts.Expression;
            }) =>
                this.transform(baseSchema, {
                    newShape,
                    transformer: this.Schema._fromTransformers({ parse, json }),
                }),
        };
    }

    private optional(schema: Zurg.BaseSchema): Zurg.Schema {
        const baseSchema: Zurg.BaseSchema = {
            toExpression: () =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        schema.toExpression(),
                        ts.factory.createIdentifier("optional")
                    ),
                    undefined,
                    []
                ),
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
        };
    }

    private transform(
        schema: Zurg.BaseSchema,
        { newShape, transformer }: { newShape: ts.TypeNode | undefined; transformer: Zurg.BaseSchema }
    ): Zurg.Schema {
        const baseSchema: Zurg.BaseSchema = {
            toExpression: () =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        schema.toExpression(),
                        ts.factory.createIdentifier("transform")
                    ),
                    newShape != null ? [newShape] : undefined,
                    [transformer.toExpression()]
                ),
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
        };
    }

    public lazy = this.withExportedName("lazy", (lazy) => (schema: Zurg.Schema): Zurg.Schema => {
        const baseSchema: Zurg.BaseSchema = {
            toExpression: () =>
                ts.factory.createCallExpression(lazy.getExpression(), undefined, [
                    ts.factory.createArrowFunction(
                        [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
                        undefined,
                        [],
                        undefined,
                        undefined,
                        schema.toExpression()
                    ),
                ]),
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
        };
    });

    public lazyObject = this.withExportedName(
        "lazyObject",
        (lazyObject) =>
            (schema: Zurg.Schema): Zurg.ObjectSchema => {
                const baseSchema: Zurg.BaseSchema = {
                    toExpression: () =>
                        ts.factory.createCallExpression(lazyObject.getExpression(), undefined, [
                            ts.factory.createArrowFunction(
                                [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
                                undefined,
                                [],
                                undefined,
                                undefined,
                                schema.toExpression()
                            ),
                        ]),
                };

                return {
                    ...baseSchema,
                    ...this.getSchemaUtils(baseSchema),
                    ...this.getObjectLikeUtils(baseSchema),
                    ...this.getObjectUtils(baseSchema),
                };
            }
    );

    public Schema = {
        _getReferenceToType: this.withExportedName(
            "Schema",
            (Schema) =>
                ({ rawShape, parsedShape }: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }) =>
                    ts.factory.createTypeReferenceNode(Schema.getEntityName(), [rawShape, parsedShape])
        ),

        _fromExpression: (expression: ts.Expression): Zurg.Schema => {
            const baseSchema: Zurg.BaseSchema = { toExpression: () => expression };

            return {
                ...baseSchema,
                ...this.getSchemaUtils(baseSchema),
            };
        },

        _fromTransformers: ({ parse, json }: { parse: ts.Expression; json: ts.Expression }): Zurg.Schema => {
            return this.Schema._fromExpression(
                ts.factory.createObjectLiteralExpression(
                    [
                        ts.factory.createPropertyAssignment("parse", parse),
                        ts.factory.createPropertyAssignment("json", json),
                    ],
                    true
                )
            );
        },
    };

    public ObjectSchema = {
        _getReferenceToType: this.withExportedName(
            "ObjectSchema",
            (ObjectSchema) =>
                ({ rawShape, parsedShape }: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }) =>
                    ts.factory.createTypeReferenceNode(ObjectSchema.getEntityName(), [rawShape, parsedShape])
        ),
    };
}
