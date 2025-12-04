import { ts } from "ts-morph";

import {
    AdditionalProperty,
    BaseSchema,
    ObjectLikeSchema,
    ObjectSchema,
    Property,
    Schema,
    SerializationCodeGenerator,
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
    /** The JSON schema object for Ajv */
    jsonSchema?: ts.Expression;
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
function createSchemaUtils(baseSchema: InternalSchema, generator: AjvSerializationCodeGenerator): Schema {
    const schema: Schema = {
        ...baseSchema,
        // Ajv validate returns boolean, data is in separate property
        parse: (raw, opts) =>
            ts.factory.createConditionalExpression(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        generator.getAjvInstance(),
                        "validate"
                    ),
                    undefined,
                    [baseSchema.jsonSchema ?? baseSchema.toExpression(), raw]
                ),
                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                applyTransform(raw, baseSchema),
                ts.factory.createToken(ts.SyntaxKind.ColonToken),
                ts.factory.createIdentifier("undefined")
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
                ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [],
                    undefined,
                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.factory.createBlock(
                        [
                            ts.factory.createIfStatement(
                                ts.factory.createPrefixUnaryExpression(
                                    ts.SyntaxKind.ExclamationToken,
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            generator.getAjvInstance(),
                                            "validate"
                                        ),
                                        undefined,
                                        [baseSchema.jsonSchema ?? baseSchema.toExpression(), raw]
                                    )
                                ),
                                ts.factory.createBlock([
                                    ts.factory.createThrowStatement(
                                        ts.factory.createNewExpression(
                                            ts.factory.createIdentifier("Error"),
                                            undefined,
                                            [ts.factory.createStringLiteral("Validation failed")]
                                        )
                                    )
                                ])
                            ),
                            ts.factory.createReturnStatement(applyTransform(raw, baseSchema))
                        ],
                        true
                    )
                ),
                undefined,
                []
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
 * Apply property transforms if needed
 */
function applyTransform(raw: ts.Expression, schema: InternalSchema): ts.Expression {
    if (schema.propertyMappings != null && schema.propertyMappings.length > 0) {
        // Transform raw properties to parsed properties
        return ts.factory.createObjectLiteralExpression(
            schema.propertyMappings.map((mapping) =>
                ts.factory.createPropertyAssignment(
                    mapping.parsed,
                    ts.factory.createPropertyAccessExpression(
                        raw,
                        ts.factory.createIdentifier(mapping.raw)
                    )
                )
            ),
            true
        );
    }
    return raw;
}

function createNullable(schema: InternalSchema, generator: AjvSerializationCodeGenerator): Schema {
    const baseSchema: InternalSchema = {
        isOptional: false,
        isNullable: true,
        untransformExpr: schema.untransformExpr,
        propertyMappings: schema.propertyMappings,
        jsonSchema: ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment(
                "oneOf",
                ts.factory.createArrayLiteralExpression([
                    schema.jsonSchema ?? schema.toExpression(),
                    ts.factory.createObjectLiteralExpression([
                        ts.factory.createPropertyAssignment("type", ts.factory.createStringLiteral("null"))
                    ])
                ])
            )
        ]),
        toExpression: () => baseSchema.jsonSchema!
    };
    return createSchemaUtils(baseSchema, generator);
}

function createOptional(schema: InternalSchema, generator: AjvSerializationCodeGenerator): Schema {
    const baseSchema: InternalSchema = {
        isOptional: true,
        isNullable: false,
        untransformExpr: schema.untransformExpr,
        propertyMappings: schema.propertyMappings,
        jsonSchema: schema.jsonSchema,
        toExpression: schema.toExpression
    };
    return createSchemaUtils(baseSchema, generator);
}

function createOptionalNullable(schema: InternalSchema, generator: AjvSerializationCodeGenerator): Schema {
    const baseSchema: InternalSchema = {
        isOptional: true,
        isNullable: true,
        untransformExpr: schema.untransformExpr,
        propertyMappings: schema.propertyMappings,
        jsonSchema: ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment(
                "oneOf",
                ts.factory.createArrayLiteralExpression([
                    schema.jsonSchema ?? schema.toExpression(),
                    ts.factory.createObjectLiteralExpression([
                        ts.factory.createPropertyAssignment("type", ts.factory.createStringLiteral("null"))
                    ])
                ])
            )
        ]),
        toExpression: () => baseSchema.jsonSchema!
    };
    return createSchemaUtils(baseSchema, generator);
}

function createTransform(
    schema: InternalSchema,
    args: { newShape: ts.TypeNode | undefined; transform: ts.Expression; untransform: ts.Expression },
    generator: AjvSerializationCodeGenerator
): Schema {
    const baseSchema: InternalSchema = {
        isOptional: schema.isOptional,
        isNullable: schema.isNullable,
        untransformExpr: args.untransform,
        propertyMappings: schema.propertyMappings,
        jsonSchema: schema.jsonSchema,
        toExpression: schema.toExpression
    };
    return createSchemaUtils(baseSchema, generator);
}

function createObjectLikeUtils(baseSchema: InternalSchema, generator: AjvSerializationCodeGenerator): ObjectLikeSchema {
    return {
        ...createSchemaUtils(baseSchema, generator),
        withParsedProperties: (properties: AdditionalProperty[]): ObjectLikeSchema => {
            return createObjectLikeUtils(baseSchema, generator);
        }
    };
}

function createObjectUtils(baseSchema: InternalSchema, generator: AjvSerializationCodeGenerator): ObjectSchema {
    return {
        ...createObjectLikeUtils(baseSchema, generator),
        extend: (extension: Schema): ObjectSchema => {
            return createObjectUtils(baseSchema, generator);
        },
        passthrough: (): ObjectSchema => {
            const passthroughSchema: InternalSchema = {
                ...baseSchema,
                jsonSchema: ts.factory.createObjectLiteralExpression([
                    ...(baseSchema.jsonSchema as ts.ObjectLiteralExpression)?.properties ?? [],
                    ts.factory.createPropertyAssignment(
                        "additionalProperties",
                        ts.factory.createTrue()
                    )
                ])
            };
            return createObjectUtils(passthroughSchema, generator);
        }
    };
}

/**
 * AjvSerializationCodeGenerator
 *
 * Generates TypeScript AST that uses Ajv (JSON Schema) for validation.
 */
export class AjvSerializationCodeGenerator implements SerializationCodeGenerator {
    private ajvImport: ts.Expression;

    constructor() {
        // Reference to ajv instance - assumes it's imported as `ajv`
        this.ajvImport = ts.factory.createIdentifier("ajv");
    }

    public getAjvInstance(): ts.Expression {
        return this.ajvImport;
    }

    // Object schemas
    public object(properties: Property[]): ObjectSchema {
        const propertyMappings = properties
            .filter((p) => p.key.raw !== p.key.parsed)
            .map((p) => ({ raw: p.key.raw, parsed: p.key.parsed }));

        const jsonSchemaProperties = ts.factory.createObjectLiteralExpression(
            properties.map((prop) =>
                ts.factory.createPropertyAssignment(
                    ts.factory.createStringLiteral(prop.key.raw),
                    prop.value.toExpression()
                )
            ),
            true
        );

        const requiredProps = properties
            .filter((p) => !p.value.isOptional)
            .map((p) => ts.factory.createStringLiteral(p.key.raw));

        const jsonSchema = ts.factory.createObjectLiteralExpression(
            [
                ts.factory.createPropertyAssignment("type", ts.factory.createStringLiteral("object")),
                ts.factory.createPropertyAssignment("properties", jsonSchemaProperties),
                ts.factory.createPropertyAssignment(
                    "required",
                    ts.factory.createArrayLiteralExpression(requiredProps)
                ),
                ts.factory.createPropertyAssignment("additionalProperties", ts.factory.createFalse())
            ],
            true
        );

        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            propertyMappings: propertyMappings.length > 0 ? propertyMappings : undefined,
            jsonSchema,
            toExpression: () => jsonSchema
        };

        return createObjectUtils(baseSchema, this);
    }

    public objectWithoutOptionalProperties(properties: Property[]): ObjectSchema {
        return this.object(properties);
    }

    // Union schemas
    public union(args: UnionArgs): ObjectLikeSchema {
        const unionSchema = ts.factory.createObjectLiteralExpression(
            [
                ts.factory.createPropertyAssignment(
                    "oneOf",
                    ts.factory.createArrayLiteralExpression(
                        args.singleUnionTypes.map((ut) =>
                            ts.factory.createObjectLiteralExpression([
                                ts.factory.createPropertyAssignment("type", ts.factory.createStringLiteral("object")),
                                ts.factory.createPropertyAssignment(
                                    "properties",
                                    ts.factory.createObjectLiteralExpression([
                                        ts.factory.createPropertyAssignment(
                                            args.rawDiscriminant,
                                            ts.factory.createObjectLiteralExpression([
                                                ts.factory.createPropertyAssignment(
                                                    "const",
                                                    ts.factory.createStringLiteral(ut.discriminantValue)
                                                )
                                            ])
                                        )
                                    ])
                                ),
                                ts.factory.createPropertyAssignment(
                                    "required",
                                    ts.factory.createArrayLiteralExpression([
                                        ts.factory.createStringLiteral(args.rawDiscriminant)
                                    ])
                                )
                            ])
                        )
                    )
                )
            ],
            true
        );

        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            jsonSchema: unionSchema,
            toExpression: () => unionSchema
        };

        return createObjectLikeUtils(baseSchema, this);
    }

    public undiscriminatedUnion(schemas: Schema[]): Schema {
        const unionSchema = ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment(
                "oneOf",
                ts.factory.createArrayLiteralExpression(schemas.map((s) => s.toExpression()))
            )
        ]);

        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            jsonSchema: unionSchema,
            toExpression: () => unionSchema
        };

        return createSchemaUtils(baseSchema, this);
    }

    // Collection schemas
    public list(itemSchema: Schema): Schema {
        const arraySchema = ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment("type", ts.factory.createStringLiteral("array")),
            ts.factory.createPropertyAssignment("items", itemSchema.toExpression())
        ]);

        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            jsonSchema: arraySchema,
            toExpression: () => arraySchema
        };

        return createSchemaUtils(baseSchema, this);
    }

    public set(itemSchema: Schema): Schema {
        // JSON Schema doesn't have native Set support, use array with uniqueItems
        const setSchema = ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment("type", ts.factory.createStringLiteral("array")),
            ts.factory.createPropertyAssignment("items", itemSchema.toExpression()),
            ts.factory.createPropertyAssignment("uniqueItems", ts.factory.createTrue())
        ]);

        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            jsonSchema: setSchema,
            untransformExpr: ts.factory.createArrowFunction(
                undefined,
                undefined,
                [ts.factory.createParameterDeclaration(undefined, undefined, "s", undefined, undefined, undefined)],
                undefined,
                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("Array"), "from"),
                    undefined,
                    [ts.factory.createIdentifier("s")]
                )
            ),
            toExpression: () => setSchema
        };

        return createSchemaUtils(baseSchema, this);
    }

    public record(args: { keySchema: Schema; valueSchema: Schema }): Schema {
        const recordSchema = ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment("type", ts.factory.createStringLiteral("object")),
            ts.factory.createPropertyAssignment("additionalProperties", args.valueSchema.toExpression())
        ]);

        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            jsonSchema: recordSchema,
            toExpression: () => recordSchema
        };

        return createSchemaUtils(baseSchema, this);
    }

    // Primitive schemas
    public enum(values: string[]): Schema {
        const enumSchema = ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment(
                "enum",
                ts.factory.createArrayLiteralExpression(values.map((v) => ts.factory.createStringLiteral(v)))
            )
        ]);

        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            jsonSchema: enumSchema,
            toExpression: () => enumSchema
        };

        return createSchemaUtils(baseSchema, this);
    }

    public string(): Schema {
        const stringSchema = ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment("type", ts.factory.createStringLiteral("string"))
        ]);

        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            jsonSchema: stringSchema,
            toExpression: () => stringSchema
        };

        return createSchemaUtils(baseSchema, this);
    }

    public stringLiteral(literal: string): Schema {
        const literalSchema = ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment("const", ts.factory.createStringLiteral(literal))
        ]);

        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            jsonSchema: literalSchema,
            toExpression: () => literalSchema
        };

        return createSchemaUtils(baseSchema, this);
    }

    public booleanLiteral(literal: boolean): Schema {
        const literalSchema = ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment("const", literal ? ts.factory.createTrue() : ts.factory.createFalse())
        ]);

        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            jsonSchema: literalSchema,
            toExpression: () => literalSchema
        };

        return createSchemaUtils(baseSchema, this);
    }

    public date(): Schema {
        // JSON Schema date-time format
        const dateSchema = ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment("type", ts.factory.createStringLiteral("string")),
            ts.factory.createPropertyAssignment("format", ts.factory.createStringLiteral("date-time"))
        ]);

        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            jsonSchema: dateSchema,
            untransformExpr: ts.factory.createArrowFunction(
                undefined,
                undefined,
                [ts.factory.createParameterDeclaration(undefined, undefined, "d", undefined, undefined, undefined)],
                undefined,
                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("d"), "toISOString"),
                    undefined,
                    []
                )
            ),
            toExpression: () => dateSchema
        };

        return createSchemaUtils(baseSchema, this);
    }

    public number(): Schema {
        const numberSchema = ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment("type", ts.factory.createStringLiteral("number"))
        ]);

        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            jsonSchema: numberSchema,
            toExpression: () => numberSchema
        };

        return createSchemaUtils(baseSchema, this);
    }

    public bigint(): Schema {
        // JSON Schema doesn't have native bigint, use string with pattern
        const bigintSchema = ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment("type", ts.factory.createStringLiteral("string")),
            ts.factory.createPropertyAssignment("pattern", ts.factory.createStringLiteral("^-?[0-9]+$"))
        ]);

        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            jsonSchema: bigintSchema,
            toExpression: () => bigintSchema
        };

        return createSchemaUtils(baseSchema, this);
    }

    public boolean(): Schema {
        const boolSchema = ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment("type", ts.factory.createStringLiteral("boolean"))
        ]);

        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            jsonSchema: boolSchema,
            toExpression: () => boolSchema
        };

        return createSchemaUtils(baseSchema, this);
    }

    public any(): Schema {
        // Empty schema accepts anything
        const anySchema = ts.factory.createObjectLiteralExpression([]);

        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            jsonSchema: anySchema,
            toExpression: () => anySchema
        };

        return createSchemaUtils(baseSchema, this);
    }

    public unknown(): Schema {
        return this.any();
    }

    public never(): Schema {
        // Schema that never validates
        const neverSchema = ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment("not", ts.factory.createObjectLiteralExpression([]))
        ]);

        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            jsonSchema: neverSchema,
            toExpression: () => neverSchema
        };

        return createSchemaUtils(baseSchema, this);
    }

    // Lazy schemas
    public lazy(schema: Schema): Schema {
        return schema;
    }

    public lazyObject(schema: Schema): ObjectSchema {
        const baseSchema: InternalSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: schema.toExpression
        };
        return createObjectUtils(baseSchema, this);
    }

    // Type helpers
    public Schema = {
        _getReferenceToType: (args: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }): ts.TypeNode => {
            return args.parsedShape;
        },
        _fromExpression: (expression: ts.Expression, opts?: { isObject: boolean }): Schema => {
            const baseSchema: InternalSchema = {
                isOptional: false,
                isNullable: false,
                jsonSchema: expression,
                toExpression: () => expression
            };
            if (opts?.isObject) {
                return createObjectUtils(baseSchema, this);
            }
            return createSchemaUtils(baseSchema, this);
        },
        _visitMaybeValid: (
            referenceToMaybeValid: ts.Expression,
            visitor: {
                valid: (referenceToValue: ts.Expression) => ts.Statement[];
                invalid: (referenceToErrors: ts.Expression) => ts.Statement[];
            }
        ): ts.Statement[] => {
            // Ajv validation result is a boolean
            return [
                ts.factory.createIfStatement(
                    referenceToMaybeValid,
                    ts.factory.createBlock(
                        visitor.valid(ts.factory.createPropertyAccessExpression(referenceToMaybeValid, "data")),
                        true
                    ),
                    ts.factory.createBlock(
                        visitor.invalid(
                            ts.factory.createPropertyAccessExpression(this.ajvImport, "errors")
                        ),
                        true
                    )
                )
            ];
        }
    };

    public ObjectSchema = {
        _getReferenceToType: (args: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }): ts.TypeNode => {
            return args.parsedShape;
        }
    };

    // Validation result accessors - Ajv uses different structure
    public MaybeValid = {
        ok: "valid" as const,
        Valid: {
            value: "data" as const
        },
        Invalid: {
            errors: "errors" as const
        }
    };

    public ValidationError = {
        path: "instancePath" as const,
        message: "message" as const
    };
}

