import { ts } from "ts-morph";

import {
    AdditionalProperty,
    BaseSchema,
    ObjectLikeSchema,
    ObjectSchema,
    Property,
    Schema,
    SchemaGenerator,
    UnionArgs
} from "./SchemaGenerator";

/**
 * Internal schema representation that tracks both forward and reverse transforms
 */
interface InternalSchema extends BaseSchema {
    /** Optional reverse transform expression for json/jsonOrThrow */
    untransformExpr?: ts.Expression;
    /** Property mappings for object schemas (raw -> parsed key mappings) */
    propertyMappings?: Array<{ raw: string; parsed: string }>;
}

/**
 * Helper to create schema utils for a base schema
 */
function createSchemaUtils(baseSchema: InternalSchema, generator: ZodSchemaGenerator): Schema {
    const schema: Schema = {
        ...baseSchema,
        parse: (raw, opts) =>
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(baseSchema.toExpression(), "safeParse"),
                        undefined,
                        [raw]
                    ),
                    "data"
                ),
                undefined,
                []
            ),
        json: (parsed, opts) => {
            if (baseSchema.untransformExpr != null) {
                return ts.factory.createCallExpression(baseSchema.untransformExpr, undefined, [parsed]);
            }
            if (baseSchema.propertyMappings != null && baseSchema.propertyMappings.length > 0) {
                return generateReversePropertyMapping(parsed, baseSchema.propertyMappings);
            }
            return parsed;
        },
        parseOrThrow: (raw, opts) =>
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(baseSchema.toExpression(), "parse"),
                undefined,
                [raw]
            ),
        jsonOrThrow: (parsed, opts) => {
            if (baseSchema.untransformExpr != null) {
                return ts.factory.createCallExpression(baseSchema.untransformExpr, undefined, [parsed]);
            }
            if (baseSchema.propertyMappings != null && baseSchema.propertyMappings.length > 0) {
                return generateReversePropertyMapping(parsed, baseSchema.propertyMappings);
            }
            return parsed;
        },
        nullable: () => createNullable(baseSchema, generator),
        optional: () => createOptional(baseSchema, generator),
        optionalNullable: () => createOptionalNullable(baseSchema, generator),
        transform: (args) => createTransform(baseSchema, args, generator)
    };
    return schema;
}

/**
 * Generate reverse property mapping expression: { raw_key: parsed.parsedKey, ... }
 */
function generateReversePropertyMapping(
    parsed: ts.Expression,
    mappings: Array<{ raw: string; parsed: string }>
): ts.Expression {
    return ts.factory.createObjectLiteralExpression(
        mappings.map((mapping) =>
            ts.factory.createPropertyAssignment(
                ts.factory.createStringLiteral(mapping.raw),
                ts.factory.createPropertyAccessExpression(parsed, mapping.parsed)
            )
        ),
        true
    );
}

function createNullable(schema: InternalSchema, generator: ZodSchemaGenerator): Schema {
    const baseSchema: InternalSchema = {
        isOptional: false,
        isNullable: true,
        untransformExpr: schema.untransformExpr,
        propertyMappings: schema.propertyMappings,
        toExpression: () =>
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(schema.toExpression(), "nullable"),
                undefined,
                []
            )
    };
    return createSchemaUtils(baseSchema, generator);
}

function createOptional(schema: InternalSchema, generator: ZodSchemaGenerator): Schema {
    const baseSchema: InternalSchema = {
        isOptional: true,
        isNullable: false,
        untransformExpr: schema.untransformExpr,
        propertyMappings: schema.propertyMappings,
        toExpression: () =>
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(schema.toExpression(), "optional"),
                undefined,
                []
            )
    };
    return createSchemaUtils(baseSchema, generator);
}

function createOptionalNullable(schema: InternalSchema, generator: ZodSchemaGenerator): Schema {
    const baseSchema: InternalSchema = {
        isOptional: true,
        isNullable: true,
        untransformExpr: schema.untransformExpr,
        propertyMappings: schema.propertyMappings,
        toExpression: () =>
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(schema.toExpression(), "optional"),
                        undefined,
                        []
                    ),
                    "nullable"
                ),
                undefined,
                []
            )
    };
    return createSchemaUtils(baseSchema, generator);
}

function createTransform(
    schema: InternalSchema,
    args: { newShape: ts.TypeNode | undefined; transform: ts.Expression; untransform: ts.Expression },
    generator: ZodSchemaGenerator
): Schema {
    const baseSchema: InternalSchema = {
        isOptional: schema.isOptional,
        isNullable: schema.isNullable,
        untransformExpr: args.untransform,
        toExpression: () =>
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(schema.toExpression(), "transform"),
                undefined,
                [args.transform]
            )
    };
    return createSchemaUtils(baseSchema, generator);
}

function createObjectLikeUtils(baseSchema: InternalSchema, generator: ZodSchemaGenerator): ObjectLikeSchema {
    return {
        ...createSchemaUtils(baseSchema, generator),
        withParsedProperties: (properties: AdditionalProperty[]) => {
            const newBaseSchema: InternalSchema = {
                ...baseSchema,
                toExpression: () => {
                    if (properties.length === 0) {
                        return baseSchema.toExpression();
                    }
                    return ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(baseSchema.toExpression(), "transform"),
                        undefined,
                        [
                            ts.factory.createArrowFunction(
                                undefined,
                                undefined,
                                [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "data")],
                                undefined,
                                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                ts.factory.createObjectLiteralExpression(
                                    [
                                        ts.factory.createSpreadAssignment(ts.factory.createIdentifier("data")),
                                        ...properties.map((prop) =>
                                            ts.factory.createPropertyAssignment(
                                                prop.key,
                                                prop.getValue({
                                                    getReferenceToParsed: () => ts.factory.createIdentifier("data")
                                                })
                                            )
                                        )
                                    ],
                                    true
                                )
                            )
                        ]
                    );
                }
            };
            return createObjectLikeUtils(newBaseSchema, generator);
        }
    };
}

function createObjectUtils(baseSchema: InternalSchema, generator: ZodSchemaGenerator): ObjectSchema {
    const objectLike = createObjectLikeUtils(baseSchema, generator);
    return {
        ...objectLike,
        extend: (extension: Schema) => {
            const newBaseSchema: InternalSchema = {
                isOptional: false,
                isNullable: false,
                toExpression: () =>
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(baseSchema.toExpression(), "merge"),
                        undefined,
                        [extension.toExpression()]
                    )
            };
            return createObjectUtils(newBaseSchema, generator);
        },
        passthrough: () => {
            const newBaseSchema: InternalSchema = {
                isOptional: false,
                isNullable: false,
                propertyMappings: baseSchema.propertyMappings,
                toExpression: () =>
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(baseSchema.toExpression(), "passthrough"),
                        undefined,
                        []
                    )
            };
            return createObjectUtils(newBaseSchema, generator);
        }
    };
}

/**
 * Zod-based schema generator.
 * Generates TypeScript AST that uses Zod for validation with bi-directional transforms.
 */
export class ZodSchemaGenerator implements SchemaGenerator {
    private zImport: ts.Expression;

    constructor() {
        this.zImport = ts.factory.createIdentifier("z");
    }

    private z(method: string): ts.Expression {
        return ts.factory.createPropertyAccessExpression(this.zImport, method);
    }

    public object = (properties: Property[]): ObjectSchema => {
        const propertyMappings = properties
            .filter((p) => p.key.raw !== p.key.parsed)
            .map((p) => ({ raw: p.key.raw, parsed: p.key.parsed }));

        const needsTransform = propertyMappings.length > 0;

        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            propertyMappings: needsTransform ? propertyMappings : undefined,
            toExpression: () => {
                const objectLiteral = ts.factory.createObjectLiteralExpression(
                    properties.map((prop) =>
                        ts.factory.createPropertyAssignment(
                            ts.factory.createStringLiteral(prop.key.raw),
                            prop.value.toExpression()
                        )
                    ),
                    true
                );

                const objectSchema = ts.factory.createCallExpression(this.z("object"), undefined, [objectLiteral]);

                if (!needsTransform) {
                    return objectSchema;
                }

                // Add .transform() for wire -> parsed key mapping
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(objectSchema, "transform"),
                    undefined,
                    [
                        ts.factory.createArrowFunction(
                            undefined,
                            undefined,
                            [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "wire")],
                            undefined,
                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.factory.createObjectLiteralExpression(
                                properties.map((prop) =>
                                    ts.factory.createPropertyAssignment(
                                        prop.key.parsed,
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier("wire"),
                                            prop.key.raw
                                        )
                                    )
                                ),
                                true
                            )
                        )
                    ]
                );
            }
        };

        return createObjectUtils(baseSchema, this);
    };

    public objectWithoutOptionalProperties = (properties: Property[]): ObjectSchema => {
        return this.object(properties);
    };

    public union = (args: UnionArgs): ObjectLikeSchema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => {
                const discriminator =
                    args.parsedDiscriminant === args.rawDiscriminant ? args.rawDiscriminant : args.rawDiscriminant;

                return ts.factory.createCallExpression(this.z("discriminatedUnion"), undefined, [
                    ts.factory.createStringLiteral(discriminator),
                    ts.factory.createArrayLiteralExpression(
                        args.singleUnionTypes.map((sut) =>
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createCallExpression(this.z("object"), undefined, [
                                        ts.factory.createObjectLiteralExpression(
                                            [
                                                ts.factory.createPropertyAssignment(
                                                    discriminator,
                                                    ts.factory.createCallExpression(this.z("literal"), undefined, [
                                                        ts.factory.createStringLiteral(sut.discriminantValue)
                                                    ])
                                                )
                                            ],
                                            true
                                        )
                                    ]),
                                    "merge"
                                ),
                                undefined,
                                [sut.nonDiscriminantProperties.toExpression()]
                            )
                        ),
                        true
                    )
                ]);
            }
        };

        return createObjectLikeUtils(baseSchema, this);
    };

    public undiscriminatedUnion = (schemas: Schema[]): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                ts.factory.createCallExpression(this.z("union"), undefined, [
                    ts.factory.createArrayLiteralExpression(
                        schemas.map((s) => s.toExpression()),
                        true
                    )
                ])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public list = (itemSchema: Schema): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => ts.factory.createCallExpression(this.z("array"), undefined, [itemSchema.toExpression()])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public set = (itemSchema: Schema): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            // Store the reverse transform for Set -> Array conversion
            untransformExpr: ts.factory.createArrowFunction(
                undefined,
                undefined,
                [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "s")],
                undefined,
                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("Array"), "from"),
                    undefined,
                    [ts.factory.createIdentifier("s")]
                )
            ),
            toExpression: () =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createCallExpression(this.z("array"), undefined, [itemSchema.toExpression()]),
                        "transform"
                    ),
                    undefined,
                    [
                        ts.factory.createArrowFunction(
                            undefined,
                            undefined,
                            [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "arr")],
                            undefined,
                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.factory.createNewExpression(ts.factory.createIdentifier("Set"), undefined, [
                                ts.factory.createIdentifier("arr")
                            ])
                        )
                    ]
                )
        };

        return createSchemaUtils(baseSchema, this);
    };

    public record = (args: { keySchema: Schema; valueSchema: Schema }): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                ts.factory.createCallExpression(this.z("record"), undefined, [
                    args.keySchema.toExpression(),
                    args.valueSchema.toExpression()
                ])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public enum = (values: string[]): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                ts.factory.createCallExpression(this.z("enum"), undefined, [
                    ts.factory.createArrayLiteralExpression(
                        values.map((v) => ts.factory.createStringLiteral(v)),
                        false
                    )
                ])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public string = (): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => ts.factory.createCallExpression(this.z("string"), undefined, [])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public stringLiteral = (literal: string): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                ts.factory.createCallExpression(this.z("literal"), undefined, [ts.factory.createStringLiteral(literal)])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public booleanLiteral = (literal: boolean): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                ts.factory.createCallExpression(this.z("literal"), undefined, [
                    literal ? ts.factory.createTrue() : ts.factory.createFalse()
                ])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public date = (): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            // Reverse transform: Date -> ISO string
            untransformExpr: ts.factory.createArrowFunction(
                undefined,
                undefined,
                [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "d")],
                undefined,
                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("d"), "toISOString"),
                    undefined,
                    []
                )
            ),
            toExpression: () =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createCallExpression(this.z("string"), undefined, []),
                        "transform"
                    ),
                    undefined,
                    [
                        ts.factory.createArrowFunction(
                            undefined,
                            undefined,
                            [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "s")],
                            undefined,
                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.factory.createNewExpression(ts.factory.createIdentifier("Date"), undefined, [
                                ts.factory.createIdentifier("s")
                            ])
                        )
                    ]
                )
        };

        return createSchemaUtils(baseSchema, this);
    };

    public number = (): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => ts.factory.createCallExpression(this.z("number"), undefined, [])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public bigint = (): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => ts.factory.createCallExpression(this.z("bigint"), undefined, [])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public boolean = (): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => ts.factory.createCallExpression(this.z("boolean"), undefined, [])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public any = (): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: true,
            toExpression: () => ts.factory.createCallExpression(this.z("any"), undefined, [])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public unknown = (): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: true,
            isNullable: false,
            toExpression: () => ts.factory.createCallExpression(this.z("unknown"), undefined, [])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public never = (): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => ts.factory.createCallExpression(this.z("never"), undefined, [])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public lazy = (schema: Schema): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: schema.isOptional,
            isNullable: schema.isNullable,
            toExpression: () =>
                ts.factory.createCallExpression(this.z("lazy"), undefined, [
                    ts.factory.createArrowFunction(
                        undefined,
                        undefined,
                        [],
                        undefined,
                        undefined,
                        schema.toExpression()
                    )
                ])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public lazyObject = (schema: Schema): ObjectSchema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: schema.isNullable,
            toExpression: () =>
                ts.factory.createCallExpression(this.z("lazy"), undefined, [
                    ts.factory.createArrowFunction(
                        undefined,
                        undefined,
                        [],
                        undefined,
                        undefined,
                        schema.toExpression()
                    )
                ])
        };

        return createObjectUtils(baseSchema, this);
    };

    public Schema = {
        _getReferenceToType: (args: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }): ts.TypeNode => {
            return ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(ts.factory.createIdentifier("z"), "ZodType"),
                [args.parsedShape, ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword), args.rawShape]
            );
        },

        _fromExpression: (expression: ts.Expression, opts?: { isObject: boolean }): Schema => {
            const baseSchema: InternalSchema = {
                isOptional: false,
                isNullable: false,
                toExpression: () => expression
            };
            if (opts?.isObject) {
                return createObjectUtils(baseSchema, this);
            }
            return createSchemaUtils(baseSchema, this);
        }
    };

    public ObjectSchema = {
        _getReferenceToType: (args: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }): ts.TypeNode => {
            return ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(ts.factory.createIdentifier("z"), "ZodObject"),
                [args.rawShape]
            );
        }
    };
}
