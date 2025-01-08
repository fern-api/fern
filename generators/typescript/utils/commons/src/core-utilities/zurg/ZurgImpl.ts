import { SchemaOptions } from "@fern-typescript/zurg";
import { ts } from "ts-morph";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { Reference } from "../../referencing";
import { CoreUtility } from "../CoreUtility";
import { Zurg } from "./Zurg";

export class ZurgImpl extends CoreUtility implements Zurg {
    public readonly MANIFEST = {
        name: "zurg",
        repoInfoForTesting: {
            path: RelativeFilePath.of("generators/typescript/utils/core-utilities/zurg/src"),
            ignoreGlob: "**/__test__"
        },
        unitTests: {
            fromDirectory: RelativeFilePath.of("__test__"),
            findAndReplace: {
                "../../builders": "../../../../src/core/schemas/builders",
                "../builders": "../../../src/core/schemas/builders",
                "../../Schema": "../../../../src/core/schemas/Schema"
            }
        },
        originalPathOnDocker: AbsoluteFilePath.of("/assets/zurg"),
        pathInCoreUtilities: [{ nameOnDisk: "schemas", exportDeclaration: { namespaceExport: "serialization" } }]
    };

    public object = this.withExportedName("object", (object) => (properties: Zurg.Property[]): Zurg.ObjectSchema => {
        const baseSchema: Zurg.BaseSchema = {
            isOptional: false,
            toExpression: () =>
                ts.factory.createCallExpression(object.getExpression(), undefined, [
                    this.constructObjectLiteralForProperties(properties)
                ])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
            ...this.getObjectLikeUtils(baseSchema),
            ...this.getObjectUtils(baseSchema)
        };
    });

    public objectWithoutOptionalProperties = this.withExportedName(
        "objectWithoutOptionalProperties",
        (objectWithoutOptionalProperties) =>
            (properties: Zurg.Property[]): Zurg.ObjectSchema => {
                const baseSchema: Zurg.BaseSchema = {
                    isOptional: false,
                    toExpression: () =>
                        ts.factory.createCallExpression(objectWithoutOptionalProperties.getExpression(), undefined, [
                            this.constructObjectLiteralForProperties(properties)
                        ])
                };

                return {
                    ...baseSchema,
                    ...this.getSchemaUtils(baseSchema),
                    ...this.getObjectLikeUtils(baseSchema),
                    ...this.getObjectUtils(baseSchema)
                };
            }
    );

    private constructObjectLiteralForProperties(properties: Zurg.Property[]): ts.ObjectLiteralExpression {
        return ts.factory.createObjectLiteralExpression(
            properties.map((property) => {
                let value = property.value.toExpression();
                if (property.key.raw !== property.key.parsed) {
                    value = this.property(property.key.raw, value);
                }
                return ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(property.key.parsed), value);
            }),
            true
        );
    }

    private getObjectUtils(objectSchema: Zurg.BaseSchema): Zurg.ObjectUtils {
        return {
            extend: (extension) => this.extend(objectSchema, extension),
            passthrough: () => {
                const baseSchema: Zurg.BaseSchema = {
                    isOptional: false,
                    toExpression: () =>
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                objectSchema.toExpression(),
                                ts.factory.createIdentifier("passthrough")
                            ),
                            undefined,
                            []
                        )
                };

                return {
                    ...baseSchema,
                    ...this.getSchemaUtils(baseSchema),
                    ...this.getObjectLikeUtils(baseSchema),
                    ...this.getObjectUtils(baseSchema)
                };
            }
        };
    }

    private extend(objectSchema: Zurg.BaseSchema, extension: Zurg.BaseSchema): Zurg.ObjectSchema {
        const baseSchema: Zurg.BaseSchema = {
            isOptional: false,
            toExpression: () =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        objectSchema.toExpression(),
                        ts.factory.createIdentifier("extend")
                    ),
                    undefined,
                    [extension.toExpression()]
                )
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
            ...this.getObjectLikeUtils(baseSchema),
            ...this.getObjectUtils(baseSchema)
        };
    }

    private property = this.withExportedName(
        "property",
        (property) =>
            (rawValue: string, value: ts.Expression): ts.Expression => {
                return ts.factory.createCallExpression(property.getExpression(), undefined, [
                    ts.factory.createStringLiteral(rawValue),
                    value
                ]);
            }
    );

    private getObjectLikeUtils(objectLike: Zurg.BaseSchema): Zurg.ObjectLikeUtils {
        return {
            withParsedProperties: (additionalProperties: Zurg.AdditionalProperty[]) =>
                this.withParsedProperties(objectLike, additionalProperties)
        };
    }

    private withParsedProperties(
        objectLike: Zurg.BaseSchema,
        additionalProperties: Zurg.AdditionalProperty[]
    ): Zurg.ObjectLikeSchema {
        const baseSchema: Zurg.BaseSchema = {
            isOptional: false,
            toExpression: () =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        objectLike.toExpression(),
                        ts.factory.createIdentifier("withParsedProperties")
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
                                                  )
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
                        )
                    ]
                )
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
            ...this.getObjectLikeUtils(baseSchema)
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

                const baseSchema: Zurg.BaseSchema = {
                    isOptional: false,
                    toExpression: () =>
                        ts.factory.createCallExpression(union.getExpression(), undefined, [
                            discriminantArgument,
                            ts.factory.createObjectLiteralExpression(
                                singleUnionTypes.map((singleUnionType) =>
                                    ts.factory.createPropertyAssignment(
                                        ts.factory.createStringLiteral(singleUnionType.discriminantValue),
                                        singleUnionType.nonDiscriminantProperties.toExpression()
                                    )
                                ),
                                true
                            )
                        ])
                };

                return {
                    ...baseSchema,
                    ...this.getSchemaUtils(baseSchema),
                    ...this.getObjectLikeUtils(baseSchema)
                };
            }
    );

    private discriminant = this.withExportedName(
        "discriminant",
        (discriminant) =>
            ({
                parsedDiscriminant,
                rawDiscriminant
            }: {
                parsedDiscriminant: string;
                rawDiscriminant: string;
            }): ts.Expression => {
                return ts.factory.createCallExpression(discriminant.getExpression(), undefined, [
                    ts.factory.createStringLiteral(parsedDiscriminant),
                    ts.factory.createStringLiteral(rawDiscriminant)
                ]);
            }
    );

    public undiscriminatedUnion = this.withExportedName(
        "undiscriminatedUnion",
        (undiscriminatedUnion: Reference) => (schemas: Zurg.Schema[]) => {
            const baseSchema: Zurg.BaseSchema = {
                isOptional: false,
                toExpression: () =>
                    ts.factory.createCallExpression(undiscriminatedUnion.getExpression(), undefined, [
                        ts.factory.createArrayLiteralExpression(schemas.map((schema) => schema.toExpression()))
                    ])
            };

            return {
                ...baseSchema,
                ...this.getSchemaUtils(baseSchema)
            };
        }
    );

    public list = this.withExportedName("list", (list: Reference) => (itemSchema: Zurg.Schema) => {
        const baseSchema: Zurg.BaseSchema = {
            isOptional: false,
            toExpression: () =>
                ts.factory.createCallExpression(list.getExpression(), undefined, [itemSchema.toExpression()])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    });

    public set = this.withExportedName("set", (set: Reference) => (itemSchema: Zurg.Schema) => {
        const baseSchema: Zurg.BaseSchema = {
            isOptional: false,
            toExpression: () =>
                ts.factory.createCallExpression(set.getExpression(), undefined, [itemSchema.toExpression()])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    });

    public record = this.withExportedName(
        "record",
        (record: Reference) =>
            ({ keySchema, valueSchema }: { keySchema: Zurg.Schema; valueSchema: Zurg.Schema }) => {
                const baseSchema: Zurg.BaseSchema = {
                    isOptional: false,
                    toExpression: () =>
                        ts.factory.createCallExpression(record.getExpression(), undefined, [
                            keySchema.toExpression(),
                            valueSchema.toExpression()
                        ])
                };

                return {
                    ...baseSchema,
                    ...this.getSchemaUtils(baseSchema)
                };
            }
    );

    public enum = this.withExportedName("enum_", (enum_: Reference) => (values: string[]) => {
        const baseSchema: Zurg.BaseSchema = {
            isOptional: false,
            toExpression: () =>
                ts.factory.createCallExpression(enum_.getExpression(), undefined, [
                    ts.factory.createArrayLiteralExpression(
                        values.map((value) => ts.factory.createStringLiteral(value))
                    )
                ])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    });

    public string = this.withExportedName("string", (string: Reference) => () => {
        const baseSchema: Zurg.BaseSchema = {
            isOptional: false,
            toExpression: () => ts.factory.createCallExpression(string.getExpression(), undefined, undefined)
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    });

    public stringLiteral = this.withExportedName("stringLiteral", (stringLiteral: Reference) => (literal: string) => {
        const baseSchema: Zurg.BaseSchema = {
            isOptional: false,
            toExpression: () =>
                ts.factory.createCallExpression(stringLiteral.getExpression(), undefined, [
                    ts.factory.createStringLiteral(literal)
                ])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    });

    public booleanLiteral = this.withExportedName(
        "booleanLiteral",
        (booleanLiteral: Reference) => (literal: boolean) => {
            const baseSchema: Zurg.BaseSchema = {
                isOptional: false,
                toExpression: () =>
                    ts.factory.createCallExpression(booleanLiteral.getExpression(), undefined, [
                        literal ? ts.factory.createTrue() : ts.factory.createFalse()
                    ])
            };

            return {
                ...baseSchema,
                ...this.getSchemaUtils(baseSchema)
            };
        }
    );

    public number = this.withExportedName("number", (number: Reference) => () => {
        const baseSchema: Zurg.BaseSchema = {
            isOptional: false,
            toExpression: () => ts.factory.createCallExpression(number.getExpression(), undefined, undefined)
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    });

    public bigint = this.withExportedName("bigint", (bigint: Reference) => () => {
        const baseSchema: Zurg.BaseSchema = {
            isOptional: false,
            toExpression: () => ts.factory.createCallExpression(bigint.getExpression(), undefined, undefined)
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    });

    public boolean = this.withExportedName("boolean", (boolean: Reference) => () => {
        const baseSchema: Zurg.BaseSchema = {
            isOptional: false,
            toExpression: () => ts.factory.createCallExpression(boolean.getExpression(), undefined, undefined)
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    });

    public date = this.withExportedName("date", (date: Reference) => () => {
        const baseSchema: Zurg.BaseSchema = {
            isOptional: false,
            toExpression: () => ts.factory.createCallExpression(date.getExpression(), undefined, undefined)
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    });

    public any = this.withExportedName("any", (any: Reference) => () => {
        const baseSchema: Zurg.BaseSchema = {
            isOptional: false,
            toExpression: () => ts.factory.createCallExpression(any.getExpression(), undefined, undefined)
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    });

    public unknown = this.withExportedName("unknown", (unknown: Reference) => () => {
        const baseSchema: Zurg.BaseSchema = {
            isOptional: true,
            toExpression: () => ts.factory.createCallExpression(unknown.getExpression(), undefined, undefined)
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    });

    private getSchemaUtils(baseSchema: Zurg.BaseSchema): Zurg.SchemaUtils {
        return {
            optional: () => this.optional(baseSchema),
            parse: (raw, opts) =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(baseSchema.toExpression(), "parse"),
                    undefined,
                    [raw, ...this.constructSchemaOptionsArgs(opts)]
                ),
            json: (parsed, opts) =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(baseSchema.toExpression(), "json"),
                    undefined,
                    [parsed, ...this.constructSchemaOptionsArgs(opts)]
                ),
            parseOrThrow: (raw, opts) =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(baseSchema.toExpression(), "parseOrThrow"),
                    undefined,
                    [raw, ...this.constructSchemaOptionsArgs(opts)]
                ),
            jsonOrThrow: (parsed, opts) =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(baseSchema.toExpression(), "jsonOrThrow"),
                    undefined,
                    [parsed, ...this.constructSchemaOptionsArgs(opts)]
                ),
            transform: ({
                newShape,
                transform,
                untransform
            }: {
                newShape: ts.TypeNode | undefined;
                transform: ts.Expression;
                untransform: ts.Expression;
            }) =>
                this.transform(baseSchema, {
                    newShape,
                    transformer: this.Schema._fromTransformers({ transform, untransform })
                })
        };
    }

    private constructSchemaOptionsArgs(schemaOptions: Required<SchemaOptions>): ts.Expression[] {
        const properties: ts.ObjectLiteralElementLike[] = [];

        if (schemaOptions.unrecognizedObjectKeys !== "fail") {
            properties.push(
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("unrecognizedObjectKeys"),
                    ts.factory.createStringLiteral(schemaOptions.unrecognizedObjectKeys)
                )
            );
        }
        if (schemaOptions.allowUnrecognizedUnionMembers) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("allowUnrecognizedUnionMembers"),
                    ts.factory.createTrue()
                )
            );
        }
        if (schemaOptions.allowUnrecognizedEnumValues) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("allowUnrecognizedEnumValues"),
                    ts.factory.createTrue()
                )
            );
        }
        if (schemaOptions.skipValidation) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("skipValidation"),
                    ts.factory.createTrue()
                )
            );
        }
        if (schemaOptions.omitUndefined) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("omitUndefined"),
                    ts.factory.createTrue()
                )
            );
        }
        if (schemaOptions.breadcrumbsPrefix.length > 0) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("breadcrumbsPrefix"),
                    ts.factory.createArrayLiteralExpression(
                        schemaOptions.breadcrumbsPrefix.map((breadcrumb) => ts.factory.createStringLiteral(breadcrumb))
                    )
                )
            );
        }

        if (properties.length > 0) {
            return [ts.factory.createObjectLiteralExpression(properties)];
        } else {
            return [];
        }
    }

    private optional(schema: Zurg.BaseSchema): Zurg.Schema {
        const baseSchema: Zurg.BaseSchema = {
            isOptional: true,
            toExpression: () =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        schema.toExpression(),
                        ts.factory.createIdentifier("optional")
                    ),
                    undefined,
                    []
                )
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    }

    private transform(
        schema: Zurg.BaseSchema,
        { newShape, transformer }: { newShape: ts.TypeNode | undefined; transformer: Zurg.BaseSchema }
    ): Zurg.Schema {
        const baseSchema: Zurg.BaseSchema = {
            isOptional: transformer.isOptional,
            toExpression: () =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        schema.toExpression(),
                        ts.factory.createIdentifier("transform")
                    ),
                    newShape != null ? [newShape] : undefined,
                    [transformer.toExpression()]
                )
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    }

    public lazy = this.withExportedName("lazy", (lazy) => (schema: Zurg.Schema): Zurg.Schema => {
        const baseSchema: Zurg.BaseSchema = {
            isOptional: schema.isOptional,
            toExpression: () =>
                ts.factory.createCallExpression(lazy.getExpression(), undefined, [
                    ts.factory.createArrowFunction([], undefined, [], undefined, undefined, schema.toExpression())
                ])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    });

    public lazyObject = this.withExportedName(
        "lazyObject",
        (lazyObject) =>
            (schema: Zurg.Schema): Zurg.ObjectSchema => {
                const baseSchema: Zurg.BaseSchema = {
                    isOptional: false,
                    toExpression: () =>
                        ts.factory.createCallExpression(lazyObject.getExpression(), undefined, [
                            ts.factory.createArrowFunction(
                                [],
                                undefined,
                                [],
                                undefined,
                                undefined,
                                schema.toExpression()
                            )
                        ])
                };

                return {
                    ...baseSchema,
                    ...this.getSchemaUtils(baseSchema),
                    ...this.getObjectLikeUtils(baseSchema),
                    ...this.getObjectUtils(baseSchema)
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

        _fromExpression: (expression: ts.Expression, opts?: { isObject: boolean }): Zurg.Schema => {
            const baseSchema: Zurg.BaseSchema = {
                isOptional: false,
                toExpression: () => expression
            };
            if (opts?.isObject) {
                return {
                    ...baseSchema,
                    ...this.getSchemaUtils(baseSchema),
                    ...this.getObjectLikeUtils(baseSchema),
                    ...this.getObjectUtils(baseSchema)
                };
            }
            return {
                ...baseSchema,
                ...this.getSchemaUtils(baseSchema)
            };
        },

        _fromTransformers: ({
            transform,
            untransform
        }: {
            transform: ts.Expression;
            untransform: ts.Expression;
        }): Zurg.Schema => {
            return this.Schema._fromExpression(
                ts.factory.createObjectLiteralExpression(
                    [
                        ts.factory.createPropertyAssignment("transform", transform),
                        ts.factory.createPropertyAssignment("untransform", untransform)
                    ],
                    true
                )
            );
        },

        _visitMaybeValid: (
            referenceToMaybeValid: ts.Expression,
            visitor: {
                valid: (referenceToValue: ts.Expression) => ts.Statement[];
                invalid: (referenceToErrors: ts.Expression) => ts.Statement[];
            }
        ): ts.Statement[] => {
            return [
                ts.factory.createIfStatement(
                    ts.factory.createPropertyAccessExpression(referenceToMaybeValid, this.MaybeValid.ok),
                    ts.factory.createBlock(
                        visitor.valid(
                            ts.factory.createPropertyAccessExpression(
                                referenceToMaybeValid,
                                this.MaybeValid.Valid.value
                            )
                        ),
                        true
                    ),
                    ts.factory.createBlock(
                        visitor.invalid(
                            ts.factory.createPropertyAccessExpression(
                                referenceToMaybeValid,
                                this.MaybeValid.Invalid.errors
                            )
                        ),
                        true
                    )
                )
            ];
        }
    };

    public ObjectSchema = {
        _getReferenceToType: this.withExportedName(
            "ObjectSchema",
            (ObjectSchema) =>
                ({ rawShape, parsedShape }: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }) =>
                    ts.factory.createTypeReferenceNode(ObjectSchema.getEntityName(), [rawShape, parsedShape])
        )
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
}
