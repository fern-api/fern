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

/**
 * Helper to create schema utils for a base schema
 */
function createSchemaUtils(baseSchema: InternalSchema, generator: YupSchemaGenerator): Schema {
    return {
        ...baseSchema,
        parse: (raw, opts) =>
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(baseSchema.toExpression(), "validateSync"),
                undefined,
                [raw]
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
                ts.factory.createPropertyAccessExpression(baseSchema.toExpression(), "validateSync"),
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
}

function createNullable(schema: InternalSchema, generator: YupSchemaGenerator): Schema {
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

function createOptional(schema: InternalSchema, generator: YupSchemaGenerator): Schema {
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

function createOptionalNullable(schema: InternalSchema, generator: YupSchemaGenerator): Schema {
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
    generator: YupSchemaGenerator
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

function createObjectLikeUtils(baseSchema: InternalSchema, generator: YupSchemaGenerator): ObjectLikeSchema {
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

function createObjectUtils(baseSchema: InternalSchema, generator: YupSchemaGenerator): ObjectSchema {
    const objectLike = createObjectLikeUtils(baseSchema, generator);
    return {
        ...objectLike,
        extend: (extension: Schema) => {
            const newBaseSchema: InternalSchema = {
                isOptional: false,
                isNullable: false,
                toExpression: () =>
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(baseSchema.toExpression(), "concat"),
                        undefined,
                        [extension.toExpression()]
                    )
            };
            return createObjectUtils(newBaseSchema, generator);
        },
        passthrough: () => {
            // Yup objects are passthrough by default (noUnknown: false)
            return createObjectUtils(baseSchema, generator);
        }
    };
}

/**
 * Yup-based schema generator.
 * Generates TypeScript AST that uses Yup for validation with bi-directional transforms.
 */
export class YupSchemaGenerator implements SchemaGenerator {
    private yupImport: ts.Expression;

    constructor() {
        this.yupImport = ts.factory.createIdentifier("yup");
    }

    private yup(method: string): ts.Expression {
        return ts.factory.createPropertyAccessExpression(this.yupImport, method);
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

                const objectSchema = ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createCallExpression(this.yup("object"), undefined, [objectLiteral]),
                        "noUnknown"
                    ),
                    undefined,
                    []
                );

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
                // Yup doesn't have native discriminatedUnion, use mixed().test()
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createCallExpression(this.yup("mixed"), undefined, []),
                        "test"
                    ),
                    undefined,
                    [
                        ts.factory.createStringLiteral("union"),
                        ts.factory.createStringLiteral("Invalid union type"),
                        ts.factory.createArrowFunction(
                            undefined,
                            undefined,
                            [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "value")],
                            undefined,
                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createArrayLiteralExpression(
                                        args.singleUnionTypes.map((sut) => sut.nonDiscriminantProperties.toExpression()),
                                        true
                                    ),
                                    "some"
                                ),
                                undefined,
                                [
                                    ts.factory.createArrowFunction(
                                        undefined,
                                        undefined,
                                        [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "schema")],
                                        undefined,
                                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                        ts.factory.createCallExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createIdentifier("schema"),
                                                "isValidSync"
                                            ),
                                            undefined,
                                            [ts.factory.createIdentifier("value")]
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );
            }
        };

        return createObjectLikeUtils(baseSchema, this);
    };

    public undiscriminatedUnion = (schemas: Schema[]): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createCallExpression(this.yup("mixed"), undefined, []),
                        "test"
                    ),
                    undefined,
                    [
                        ts.factory.createStringLiteral("union"),
                        ts.factory.createStringLiteral("Invalid union type"),
                        ts.factory.createArrowFunction(
                            undefined,
                            undefined,
                            [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "value")],
                            undefined,
                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createArrayLiteralExpression(
                                        schemas.map((s) => s.toExpression()),
                                        true
                                    ),
                                    "some"
                                ),
                                undefined,
                                [
                                    ts.factory.createArrowFunction(
                                        undefined,
                                        undefined,
                                        [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "schema")],
                                        undefined,
                                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                        ts.factory.createCallExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createIdentifier("schema"),
                                                "isValidSync"
                                            ),
                                            undefined,
                                            [ts.factory.createIdentifier("value")]
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                )
        };

        return createSchemaUtils(baseSchema, this);
    };

    public list = (itemSchema: Schema): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createCallExpression(this.yup("array"), undefined, []),
                        "of"
                    ),
                    undefined,
                    [itemSchema.toExpression()]
                )
        };

        return createSchemaUtils(baseSchema, this);
    };

    public set = (itemSchema: Schema): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            // Reverse transform: Set -> Array
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
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createCallExpression(this.yup("array"), undefined, []),
                                "of"
                            ),
                            undefined,
                            [itemSchema.toExpression()]
                        ),
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
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createCallExpression(this.yup("object"), undefined, []),
                        "test"
                    ),
                    undefined,
                    [
                        ts.factory.createStringLiteral("record"),
                        ts.factory.createStringLiteral("Invalid record"),
                        ts.factory.createArrowFunction(
                            undefined,
                            undefined,
                            [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "obj")],
                            undefined,
                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier("Object"),
                                            "values"
                                        ),
                                        undefined,
                                        [ts.factory.createIdentifier("obj")]
                                    ),
                                    "every"
                                ),
                                undefined,
                                [
                                    ts.factory.createArrowFunction(
                                        undefined,
                                        undefined,
                                        [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "v")],
                                        undefined,
                                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                        ts.factory.createCallExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                args.valueSchema.toExpression(),
                                                "isValidSync"
                                            ),
                                            undefined,
                                            [ts.factory.createIdentifier("v")]
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                )
        };

        return createSchemaUtils(baseSchema, this);
    };

    public enum = (values: string[]): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createCallExpression(this.yup("string"), undefined, []),
                        "oneOf"
                    ),
                    undefined,
                    [ts.factory.createArrayLiteralExpression(values.map((v) => ts.factory.createStringLiteral(v)), false)]
                )
        };

        return createSchemaUtils(baseSchema, this);
    };

    public string = (): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => ts.factory.createCallExpression(this.yup("string"), undefined, [])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public stringLiteral = (literal: string): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createCallExpression(this.yup("string"), undefined, []),
                        "oneOf"
                    ),
                    undefined,
                    [ts.factory.createArrayLiteralExpression([ts.factory.createStringLiteral(literal)], false)]
                )
        };

        return createSchemaUtils(baseSchema, this);
    };

    public booleanLiteral = (literal: boolean): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createCallExpression(this.yup("boolean"), undefined, []),
                        "oneOf"
                    ),
                    undefined,
                    [
                        ts.factory.createArrayLiteralExpression(
                            [literal ? ts.factory.createTrue() : ts.factory.createFalse()],
                            false
                        )
                    ]
                )
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
            toExpression: () => ts.factory.createCallExpression(this.yup("date"), undefined, [])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public number = (): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => ts.factory.createCallExpression(this.yup("number"), undefined, [])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public bigint = (): Schema => {
        // Yup doesn't have native bigint, use number
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => ts.factory.createCallExpression(this.yup("number"), undefined, [])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public boolean = (): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => ts.factory.createCallExpression(this.yup("boolean"), undefined, [])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public any = (): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: true,
            toExpression: () => ts.factory.createCallExpression(this.yup("mixed"), undefined, [])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public unknown = (): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: true,
            isNullable: false,
            toExpression: () => ts.factory.createCallExpression(this.yup("mixed"), undefined, [])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public never = (): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createCallExpression(this.yup("mixed"), undefined, []),
                        "test"
                    ),
                    undefined,
                    [
                        ts.factory.createStringLiteral("never"),
                        ts.factory.createStringLiteral("This field should never have a value"),
                        ts.factory.createArrowFunction(
                            undefined,
                            undefined,
                            [],
                            undefined,
                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.factory.createFalse()
                        )
                    ]
                )
        };

        return createSchemaUtils(baseSchema, this);
    };

    public lazy = (schema: Schema): Schema => {
        const baseSchema: InternalSchema = {
            isOptional: schema.isOptional,
            isNullable: schema.isNullable,
            toExpression: () =>
                ts.factory.createCallExpression(this.yup("lazy"), undefined, [
                    ts.factory.createArrowFunction(undefined, undefined, [], undefined, undefined, schema.toExpression())
                ])
        };

        return createSchemaUtils(baseSchema, this);
    };

    public lazyObject = (schema: Schema): ObjectSchema => {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: schema.isNullable,
            toExpression: () =>
                ts.factory.createCallExpression(this.yup("lazy"), undefined, [
                    ts.factory.createArrowFunction(undefined, undefined, [], undefined, undefined, schema.toExpression())
                ])
        };

        return createObjectUtils(baseSchema, this);
    };

    public Schema = {
        _getReferenceToType: (args: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }): ts.TypeNode => {
            return ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(ts.factory.createIdentifier("yup"), "Schema"),
                [args.parsedShape]
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
                ts.factory.createQualifiedName(ts.factory.createIdentifier("yup"), "ObjectSchema"),
                [args.rawShape]
            );
        }
    };
}
