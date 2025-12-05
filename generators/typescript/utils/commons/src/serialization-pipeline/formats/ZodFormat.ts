import { ts } from "ts-morph";

import {
    AdditionalProperty,
    ObjectLikeSchema,
    ObjectSchema,
    Property,
    Schema,
    SchemaOptions,
    SchemaWithUtils,
    SerializationFormat,
    SerializationFormatConfig,
    UnionArgs
} from "../SerializationFormat";

/**
 * Zod version to use as dependency
 */
const ZOD_VERSION = "^3.23.0";

/**
 * Base schema implementation for Zod format
 */
interface ZodBaseSchema extends Schema {
    toExpression: () => ts.Expression;
    isOptional: boolean;
    isNullable: boolean;
}

/**
 * Helper to create a property access expression like `z.string()`
 */
function zodCall(methodName: string, args: ts.Expression[] = []): ts.Expression {
    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier("z"),
            ts.factory.createIdentifier(methodName)
        ),
        undefined,
        args
    );
}

/**
 * Helper to chain a method call on an expression
 */
function chainMethod(expr: ts.Expression, methodName: string, args: ts.Expression[] = []): ts.Expression {
    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(expr, ts.factory.createIdentifier(methodName)),
        undefined,
        args
    );
}

/**
 * ZodFormat - generates Zod schema code.
 * Uses Zod as an npm dependency instead of bundled runtime.
 */
export class ZodFormat implements SerializationFormat {
    public readonly name = "zod" as const;

    constructor(_config: SerializationFormatConfig) {
        // No special configuration needed - Zod is an npm dependency
    }

    // ==================== Schema Utilities ====================

    private getSchemaUtils(baseSchema: ZodBaseSchema): Omit<SchemaWithUtils, keyof Schema> {
        return {
            nullable: () => this.nullable(baseSchema),
            optional: () => this.optional(baseSchema),
            optionalNullable: () => this.optionalNullable(baseSchema),
            parse: (raw, _opts) => {
                // Zod uses .parse() directly
                return chainMethod(baseSchema.toExpression(), "parse", [raw]);
            },
            json: (parsed, _opts) => {
                // For Zod, "json" (serialization) is just identity since Zod doesn't transform
                // We return the parsed value as-is - actual serialization happens elsewhere
                return parsed;
            },
            parseOrThrow: (raw, _opts) => {
                // Same as parse() for Zod - it throws by default
                return chainMethod(baseSchema.toExpression(), "parse", [raw]);
            },
            jsonOrThrow: (parsed, _opts) => {
                // Just return the value - no transformation needed
                return parsed;
            },
            transform: ({ transform, untransform }) => {
                // Zod's transform only handles parse direction
                // We use .transform() for parse and store untransform separately
                const transformedExpr = chainMethod(baseSchema.toExpression(), "transform", [transform]);
                const newBase: ZodBaseSchema = {
                    isOptional: baseSchema.isOptional,
                    isNullable: baseSchema.isNullable,
                    toExpression: () => transformedExpr
                };
                return {
                    ...newBase,
                    ...this.getSchemaUtils(newBase)
                };
            }
        };
    }

    private nullable(schema: ZodBaseSchema): SchemaWithUtils {
        const baseSchema: ZodBaseSchema = {
            isOptional: schema.isOptional,
            isNullable: true,
            toExpression: () => chainMethod(schema.toExpression(), "nullable")
        };
        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    }

    private optional(schema: ZodBaseSchema): SchemaWithUtils {
        const baseSchema: ZodBaseSchema = {
            isOptional: true,
            isNullable: schema.isNullable,
            toExpression: () => chainMethod(schema.toExpression(), "optional")
        };
        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    }

    private optionalNullable(schema: ZodBaseSchema): SchemaWithUtils {
        const baseSchema: ZodBaseSchema = {
            isOptional: true,
            isNullable: true,
            toExpression: () => chainMethod(chainMethod(schema.toExpression(), "optional"), "nullable")
        };
        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    }

    // ==================== Object-like Utilities ====================

    private getObjectLikeUtils(_objectLike: ZodBaseSchema): Pick<ObjectLikeSchema, "withParsedProperties"> {
        return {
            withParsedProperties: (additionalProperties: AdditionalProperty[]) => {
                // Zod doesn't have direct equivalent of withParsedProperties
                // We use .transform() to add computed properties
                if (additionalProperties.length === 0) {
                    return _objectLike as unknown as ObjectLikeSchema;
                }

                const transformExpr = ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "parsed")],
                    undefined,
                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.factory.createObjectLiteralExpression(
                        [
                            ts.factory.createSpreadAssignment(ts.factory.createIdentifier("parsed")),
                            ...additionalProperties.map((prop) => {
                                const value = prop.getValue({
                                    getReferenceToParsed: () => ts.factory.createIdentifier("parsed")
                                });
                                return ts.factory.createPropertyAssignment(prop.key, value);
                            })
                        ],
                        true
                    )
                );

                const transformedExpr = chainMethod(_objectLike.toExpression(), "transform", [transformExpr]);
                const newBase: ZodBaseSchema = {
                    isOptional: false,
                    isNullable: false,
                    toExpression: () => transformedExpr
                };

                return {
                    ...newBase,
                    ...this.getSchemaUtils(newBase),
                    ...this.getObjectLikeUtils(newBase)
                };
            }
        };
    }

    // ==================== Object Utilities ====================

    private getObjectUtils(objectSchema: ZodBaseSchema): Pick<ObjectSchema, "extend" | "passthrough"> {
        return {
            extend: (extension) => {
                // Zod uses .merge() for extending objects
                const extendedExpr = chainMethod(objectSchema.toExpression(), "merge", [extension.toExpression()]);
                const newBase: ZodBaseSchema = {
                    isOptional: false,
                    isNullable: false,
                    toExpression: () => extendedExpr
                };
                return {
                    ...newBase,
                    ...this.getSchemaUtils(newBase),
                    ...this.getObjectLikeUtils(newBase),
                    ...this.getObjectUtils(newBase)
                };
            },
            passthrough: () => {
                // Zod has .passthrough() for allowing extra properties
                const passthroughExpr = chainMethod(objectSchema.toExpression(), "passthrough");
                const newBase: ZodBaseSchema = {
                    isOptional: false,
                    isNullable: false,
                    toExpression: () => passthroughExpr
                };
                return {
                    ...newBase,
                    ...this.getSchemaUtils(newBase),
                    ...this.getObjectLikeUtils(newBase),
                    ...this.getObjectUtils(newBase)
                };
            }
        };
    }

    // ==================== Object Schema Builders ====================

    public object = (properties: Property[]): ObjectSchema => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => {
                const propAssignments = properties.map((prop) => {
                    // Handle property key renaming
                    // Zod doesn't have built-in support for raw/parsed key mapping
                    // We'll use the parsed key and handle renaming in transform if needed
                    return ts.factory.createPropertyAssignment(
                        ts.factory.createStringLiteral(prop.key.raw), // Use raw key for parsing
                        prop.value.toExpression()
                    );
                });

                return zodCall("object", [ts.factory.createObjectLiteralExpression(propAssignments, true)]);
            }
        };

        // If any properties have different raw/parsed keys, wrap with transform
        const needsTransform = properties.some((p) => p.key.raw !== p.key.parsed);
        if (needsTransform) {
            const transformedBase: ZodBaseSchema = {
                isOptional: false,
                isNullable: false,
                toExpression: () => {
                    const inner = baseSchema.toExpression();
                    const transformExpr = ts.factory.createArrowFunction(
                        undefined,
                        undefined,
                        [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "data")],
                        undefined,
                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                        ts.factory.createObjectLiteralExpression(
                            properties.map((prop) =>
                                ts.factory.createPropertyAssignment(
                                    prop.key.parsed,
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier("data"),
                                        prop.key.raw
                                    )
                                )
                            ),
                            true
                        )
                    );
                    return chainMethod(inner, "transform", [transformExpr]);
                }
            };
            return {
                ...transformedBase,
                ...this.getSchemaUtils(transformedBase),
                ...this.getObjectLikeUtils(transformedBase),
                ...this.getObjectUtils(transformedBase)
            };
        }

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
            ...this.getObjectLikeUtils(baseSchema),
            ...this.getObjectUtils(baseSchema)
        };
    };

    public objectWithoutOptionalProperties = (properties: Property[]): ObjectSchema => {
        // In Zod, we use .strict() to disallow extra properties
        // For "without optional properties", we just create a regular object
        // The optionality is handled at the property level
        return this.object(properties);
    };

    // ==================== Union Schema Builders ====================

    public union = ({ parsedDiscriminant, rawDiscriminant, singleUnionTypes }: UnionArgs): ObjectLikeSchema => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => {
                // Use z.discriminatedUnion for better performance
                const variants = singleUnionTypes.map((variant) => {
                    // Create an object schema with the discriminant + non-discriminant properties
                    const discriminantProp = ts.factory.createPropertyAssignment(
                        ts.factory.createStringLiteral(rawDiscriminant),
                        zodCall("literal", [ts.factory.createStringLiteral(variant.discriminantValue)])
                    );

                    // Get the properties from the non-discriminant schema
                    // We need to merge them with the discriminant
                    return chainMethod(
                        zodCall("object", [ts.factory.createObjectLiteralExpression([discriminantProp], false)]),
                        "merge",
                        [variant.nonDiscriminantProperties.toExpression()]
                    );
                });

                return zodCall("discriminatedUnion", [
                    ts.factory.createStringLiteral(rawDiscriminant),
                    ts.factory.createArrayLiteralExpression(variants, true)
                ]);
            }
        };

        // Handle discriminant renaming if needed
        if (parsedDiscriminant !== rawDiscriminant) {
            const transformedBase: ZodBaseSchema = {
                ...baseSchema,
                toExpression: () => {
                    const inner = baseSchema.toExpression();
                    const transformExpr = ts.factory.createArrowFunction(
                        undefined,
                        undefined,
                        [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "data")],
                        undefined,
                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                        ts.factory.createObjectLiteralExpression(
                            [
                                ts.factory.createSpreadAssignment(ts.factory.createIdentifier("data")),
                                ts.factory.createPropertyAssignment(
                                    parsedDiscriminant,
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier("data"),
                                        rawDiscriminant
                                    )
                                )
                            ],
                            true
                        )
                    );
                    return chainMethod(inner, "transform", [transformExpr]);
                }
            };
            return {
                ...transformedBase,
                ...this.getSchemaUtils(transformedBase),
                ...this.getObjectLikeUtils(transformedBase)
            };
        }

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
            ...this.getObjectLikeUtils(baseSchema)
        };
    };

    public undiscriminatedUnion = (schemas: Schema[]): SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => {
                return zodCall("union", [
                    ts.factory.createArrayLiteralExpression(
                        schemas.map((s) => s.toExpression()),
                        false
                    )
                ]);
            }
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    // ==================== Collection Schema Builders ====================

    public list = (itemSchema: Schema): SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => zodCall("array", [itemSchema.toExpression()])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public set = (itemSchema: Schema): SchemaWithUtils => {
        // Zod uses z.set() for Set types
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => zodCall("set", [itemSchema.toExpression()])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public record = ({ keySchema, valueSchema }: { keySchema: Schema; valueSchema: Schema }): SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => zodCall("record", [keySchema.toExpression(), valueSchema.toExpression()])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    // ==================== Enum Schema Builder ====================

    public enum = (values: string[]): SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                zodCall("enum", [
                    ts.factory.createArrayLiteralExpression(
                        values.map((v) => ts.factory.createStringLiteral(v)),
                        false
                    )
                ])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    // ==================== Primitive Schema Builders ====================

    public string = (): SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => zodCall("string")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public stringLiteral = (literal: string): SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => zodCall("literal", [ts.factory.createStringLiteral(literal)])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public booleanLiteral = (literal: boolean): SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => zodCall("literal", [literal ? ts.factory.createTrue() : ts.factory.createFalse()])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public number = (): SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => zodCall("number")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public bigint = (): SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => zodCall("bigint")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public boolean = (): SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => zodCall("boolean")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public date = (): SchemaWithUtils => {
        // Zod's z.date() parses Date objects, but we need to parse ISO strings
        // Use z.coerce.date() or z.string().transform() for ISO string parsing
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => {
                // Use z.string() with transform to parse ISO strings to Date
                return chainMethod(zodCall("string"), "transform", [
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
                ]);
            }
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public any = (): SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: true, // any includes null
            toExpression: () => zodCall("any")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public unknown = (): SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: true, // unknown can be undefined
            isNullable: false,
            toExpression: () => zodCall("unknown")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public never = (): SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => zodCall("never")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    // ==================== Lazy Schema Builders ====================

    public lazy = (schema: Schema): SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: schema.isOptional,
            isNullable: schema.isNullable,
            toExpression: () =>
                zodCall("lazy", [
                    ts.factory.createArrowFunction(
                        undefined,
                        undefined,
                        [],
                        undefined,
                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                        schema.toExpression()
                    )
                ])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public lazyObject = (schema: Schema): ObjectSchema => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: schema.isNullable,
            toExpression: () =>
                zodCall("lazy", [
                    ts.factory.createArrowFunction(
                        undefined,
                        undefined,
                        [],
                        undefined,
                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
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
    };

    // ==================== Type Utilities ====================

    public Schema = {
        _getReferenceToType: ({ rawShape, parsedShape }: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }) => {
            // For Zod, we use z.ZodType<Parsed, ZodTypeDef, Raw>
            return ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(ts.factory.createIdentifier("z"), "ZodType"),
                [parsedShape, ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword), rawShape]
            );
        },

        _fromExpression: (expression: ts.Expression, opts?: { isObject: boolean }): SchemaWithUtils => {
            const baseSchema: ZodBaseSchema = {
                isOptional: false,
                isNullable: false,
                toExpression: () => expression
            };
            if (opts?.isObject) {
                return {
                    ...baseSchema,
                    ...this.getSchemaUtils(baseSchema),
                    ...this.getObjectLikeUtils(baseSchema),
                    ...this.getObjectUtils(baseSchema)
                } as SchemaWithUtils;
            }
            return {
                ...baseSchema,
                ...this.getSchemaUtils(baseSchema)
            };
        },

        _visitMaybeValid: (
            referenceToMaybeValid: ts.Expression,
            visitor: {
                valid: (referenceToValue: ts.Expression) => ts.Statement[];
                invalid: (referenceToErrors: ts.Expression) => ts.Statement[];
            }
        ): ts.Statement[] => {
            // For Zod, safeParse returns { success: boolean, data?, error? }
            // We generate: if (result.success) { valid(result.data) } else { invalid(result.error) }
            return [
                ts.factory.createIfStatement(
                    ts.factory.createPropertyAccessExpression(referenceToMaybeValid, "success"),
                    ts.factory.createBlock(
                        visitor.valid(ts.factory.createPropertyAccessExpression(referenceToMaybeValid, "data")),
                        true
                    ),
                    ts.factory.createBlock(
                        visitor.invalid(ts.factory.createPropertyAccessExpression(referenceToMaybeValid, "error")),
                        true
                    )
                )
            ];
        }
    };

    public ObjectSchema = {
        _getReferenceToType: ({ rawShape, parsedShape }: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }) => {
            // For Zod object schemas
            return ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(ts.factory.createIdentifier("z"), "ZodObject"),
                [
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword), // shape
                    ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral("strip")), // unknownKeys
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword), // catchall
                    parsedShape,
                    rawShape
                ]
            );
        }
    };

    // Zod's safeParse result field names
    public MaybeValid = {
        ok: "success" as const,
        Valid: {
            value: "data" as const
        },
        Invalid: {
            errors: "error" as const
        }
    };

    // Zod's error field names
    public ValidationError = {
        path: "path" as const,
        message: "message" as const
    };

    // ==================== Runtime Configuration ====================

    public getRuntimeDependencies(): Record<string, string> {
        return {
            zod: ZOD_VERSION
        };
    }

    public getRuntimeFilePatterns(): { patterns: string[]; ignore?: string[] } | null {
        // Zod uses npm dependency, no bundled files needed
        return null;
    }
}
