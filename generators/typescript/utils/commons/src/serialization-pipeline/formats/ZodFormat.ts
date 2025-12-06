import { ts } from "ts-morph";

import { ImportsManager } from "../../imports-manager";
import { SerializationFormat } from "../SerializationFormat";

/**
 * Zod version to use as dependency.
 * @todo Make this configurable from a client standpoint. This would be complex to implement because it would likely
 * involve scanning Zod's api at the given version and code-generating based on the results of the scan.
 */
export const ZOD_VERSION = "^3.23.0";

/**
 * Base schema implementation for Zod format
 */
interface ZodBaseSchema extends SerializationFormat.Schema {
    toExpression: () => ts.Expression;
    isOptional: boolean;
    isNullable: boolean;

    /**
     * Optional: generate expression to serialize value to JSON.
     * If not provided, value passes through unchanged.
     * Used for types that need transformation (Set → Array, etc.)
     */
    toJsonExpression?: (parsed: ts.Expression) => ts.Expression;
}

/**
 * Helper to create a property access expression like `z.string()`.
 */
function createZodCall(methodName: string, args: ts.Expression[] = []): ts.Expression {
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

    private importsManager?: ImportsManager;
    private hasAddedZodImport = false;

    constructor(_config: SerializationFormat.Config, importsManager?: ImportsManager) {
        this.importsManager = importsManager;
    }

    /**
     * Ensure the zod import is added to the current file
     */
    private ensureZodImport(): void {
        if (!this.hasAddedZodImport && this.importsManager) {
            this.importsManager.addImport("zod", { namedImports: ["z"] });
            this.hasAddedZodImport = true;
        }
    }

    /**
     * Create a zod call expression and ensure the import is added
     */
    private zodCall(methodName: string, args: ts.Expression[] = []): ts.Expression {
        this.ensureZodImport();
        return createZodCall(methodName, args);
    }

    // ==================== Schema Utilities ====================

    private getSchemaUtils(baseSchema: ZodBaseSchema): Omit<SerializationFormat.SchemaWithUtils, keyof SerializationFormat.Schema> {
        return {
            nullable: () => this.nullable(baseSchema),
            optional: () => this.optional(baseSchema),
            optionalNullable: () => this.optionalNullable(baseSchema),
            parse: (raw, _opts) => {
                // Zod uses .parse() directly
                return chainMethod(baseSchema.toExpression(), "parse", [raw]);
            },
            json: (parsed, _opts) => {
                // Use schema-specific serialization if defined, otherwise pass through
                if (baseSchema.toJsonExpression) {
                    return baseSchema.toJsonExpression(parsed);
                }
                return parsed;
            },
            parseOrThrow: (raw, _opts) => {
                // Same as parse() for Zod - it throws by default
                return chainMethod(baseSchema.toExpression(), "parse", [raw]);
            },
            jsonOrThrow: (parsed, _opts) => {
                // Use schema-specific serialization if defined, otherwise pass through
                if (baseSchema.toJsonExpression) {
                    return baseSchema.toJsonExpression(parsed);
                }
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

    /**
     * Wrap schema to allow null values.
     */
    private nullable(schema: ZodBaseSchema): SerializationFormat.SchemaWithUtils {
        const baseSchema: ZodBaseSchema = {
            isOptional: schema.isOptional,
            isNullable: true,
            toExpression: () => chainMethod(schema.toExpression(), "nullable"),
            // Preserve inner serialization, handling null: value != null ? transform(value) : null
            // Use != (loose inequality) to catch both null and undefined
            toJsonExpression: schema.toJsonExpression
                ? (parsed) =>
                      ts.factory.createConditionalExpression(
                          ts.factory.createBinaryExpression(
                              parsed,
                              ts.SyntaxKind.ExclamationEqualsToken, // != (loose)
                              ts.factory.createNull()
                          ),
                          undefined,
                          schema.toJsonExpression!(parsed),
                          undefined,
                          ts.factory.createNull()
                      )
                : undefined
        };
        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    }

    /**
     * Wrap schema to allow undefined values.
     */
    private optional(schema: ZodBaseSchema): SerializationFormat.SchemaWithUtils {
        const baseSchema: ZodBaseSchema = {
            isOptional: true,
            isNullable: schema.isNullable,
            toExpression: () => chainMethod(schema.toExpression(), "optional"),
            // Preserve inner serialization, handling undefined: value != null ? transform(value) : value
            // Use != (loose inequality) to check for both null and undefined
            toJsonExpression: schema.toJsonExpression
                ? (parsed) =>
                      ts.factory.createConditionalExpression(
                          ts.factory.createBinaryExpression(
                              parsed,
                              ts.SyntaxKind.ExclamationEqualsToken, // != (loose) to catch both null and undefined
                              ts.factory.createNull()
                          ),
                          undefined,
                          schema.toJsonExpression!(parsed),
                          undefined,
                          parsed
                      )
                : undefined
        };
        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    }

    /**
     * Wrap schema to allow both null and undefined values.
     */
    private optionalNullable(schema: ZodBaseSchema): SerializationFormat.SchemaWithUtils {
        const baseSchema: ZodBaseSchema = {
            isOptional: true,
            isNullable: true,
            toExpression: () => chainMethod(chainMethod(schema.toExpression(), "optional"), "nullable"),
            // Preserve inner serialization, handling null/undefined
            // Use != (loose inequality) to catch both null and undefined
            toJsonExpression: schema.toJsonExpression
                ? (parsed) =>
                      ts.factory.createConditionalExpression(
                          ts.factory.createBinaryExpression(
                              parsed,
                              ts.SyntaxKind.ExclamationEqualsToken, // != (loose)
                              ts.factory.createNull()
                          ),
                          undefined,
                          schema.toJsonExpression!(parsed),
                          undefined,
                          parsed
                      )
                : undefined
        };
        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    }

    // ==================== Object-like Utilities ====================

    private getObjectLikeUtils(_objectLike: ZodBaseSchema): Pick<SerializationFormat.ObjectLikeSchema, "withParsedProperties"> {
        return {
            withParsedProperties: (additionalProperties: SerializationFormat.AdditionalProperty[]) => {
                // Zod doesn't have direct equivalent of withParsedProperties
                // We use .transform() to add computed properties
                if (additionalProperties.length === 0) {
                    return _objectLike as unknown as SerializationFormat.ObjectLikeSchema;
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

    private getObjectUtils(objectSchema: ZodBaseSchema): Pick<SerializationFormat.ObjectSchema, "extend" | "passthrough"> {
        return {
            extend: (extension: SerializationFormat.Schema) => {
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

    public object = (properties: SerializationFormat.Property[]): SerializationFormat.ObjectSchema => {
        // Check if any property has toJsonExpression (needs serialization transform)
        const propsWithJsonTransform = properties.filter((p) => (p.value as ZodBaseSchema).toJsonExpression != null);

        /**
         * Creates a toJsonExpression for objects that recursively transforms properties needing serialization.
         *
         * When property keys differ between raw/parsed (e.g., NestedObject vs nestedObject),
         * we must explicitly map ALL properties to avoid having both keys in the output.
         */
        const hasKeyRenaming = properties.some((p) => p.key.raw !== p.key.parsed);
        const createObjectJsonExpression = (parsed: ts.Expression): ts.Expression => {
            if (propsWithJsonTransform.length === 0 && !hasKeyRenaming) {
                return parsed; // No transform needed - O(1)
            }

            // If there's key renaming OR transforms, we must explicitly map all properties
            // to ensure correct key names and proper serialization
            const propAssignments: ts.ObjectLiteralElementLike[] = properties.map((prop) => {
                const propSchema = prop.value as ZodBaseSchema;
                const propAccess = ts.factory.createPropertyAccessExpression(parsed, prop.key.parsed);

                // If this property has a toJsonExpression, use it
                if (propSchema.toJsonExpression) {
                    // If property is optional or nullable, wrap with null check
                    const transformExpr =
                        propSchema.isOptional || propSchema.isNullable
                            ? ts.factory.createConditionalExpression(
                                  ts.factory.createBinaryExpression(
                                      propAccess,
                                      ts.SyntaxKind.ExclamationEqualsToken, // != (loose)
                                      ts.factory.createNull()
                                  ),
                                  undefined,
                                  propSchema.toJsonExpression(propAccess),
                                  undefined,
                                  propAccess
                              )
                            : propSchema.toJsonExpression(propAccess);
                    return ts.factory.createPropertyAssignment(prop.key.raw, transformExpr);
                }

                // No transform needed - just map the key
                return ts.factory.createPropertyAssignment(prop.key.raw, propAccess);
            });

            return ts.factory.createObjectLiteralExpression(propAssignments, true);
        };

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

                return this.zodCall("object", [ts.factory.createObjectLiteralExpression(propAssignments, true)]);
            },
            // Need toJsonExpression if there are transforms OR key renamings
            toJsonExpression:
                propsWithJsonTransform.length > 0 || hasKeyRenaming ? createObjectJsonExpression : undefined
        };

        // If any properties have different raw/parsed keys, wrap with transform for parsing
        if (hasKeyRenaming) {
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
                },
                // Need toJsonExpression if there are transforms OR key renamings
                toJsonExpression:
                    propsWithJsonTransform.length > 0 || hasKeyRenaming ? createObjectJsonExpression : undefined
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

    public objectWithoutOptionalProperties = (properties: SerializationFormat.Property[]): SerializationFormat.ObjectSchema => {
        // In Zod, we use .strict() to disallow extra properties
        // For "without optional properties", we just create a regular object
        // The optionality is handled at the property level
        return this.object(properties);
    };

    // ==================== Union Schema Builders ====================

    public union = ({ parsedDiscriminant, rawDiscriminant, singleUnionTypes }: SerializationFormat.UnionArgs): SerializationFormat.ObjectLikeSchema => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => {
                this.ensureZodImport();
                // Use z.discriminatedUnion for better performance
                const variants = singleUnionTypes.map((variant) => {
                    // Create an object schema with the discriminant + non-discriminant properties
                    const discriminantProp = ts.factory.createPropertyAssignment(
                        ts.factory.createStringLiteral(rawDiscriminant),
                        this.zodCall("literal", [ts.factory.createStringLiteral(variant.discriminantValue)])
                    );

                    // Get the properties from the non-discriminant schema
                    // We need to merge them with the discriminant
                    // Cast to z.AnyZodObject because the imported schema is typed as z.ZodType
                    // but .merge() requires ZodObject
                    const schemaWithCast = ts.factory.createAsExpression(
                        variant.nonDiscriminantProperties.toExpression(),
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createQualifiedName(ts.factory.createIdentifier("z"), "AnyZodObject"),
                            undefined
                        )
                    );
                    return chainMethod(
                        this.zodCall("object", [ts.factory.createObjectLiteralExpression([discriminantProp], false)]),
                        "merge",
                        [schemaWithCast]
                    );
                });

                return this.zodCall("discriminatedUnion", [
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

    public undiscriminatedUnion = (schemas: SerializationFormat.Schema[]): SerializationFormat.SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => {
                return this.zodCall("union", [
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

    public list = (itemSchema: SerializationFormat.Schema): SerializationFormat.SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.zodCall("array", [itemSchema.toExpression()]),
            // If items need serialization, map over array and serialize each item
            toJsonExpression: itemSchema.toJsonExpression
                ? (parsed) =>
                      ts.factory.createCallExpression(
                          ts.factory.createPropertyAccessExpression(parsed, "map"),
                          undefined,
                          [
                              ts.factory.createArrowFunction(
                                  undefined,
                                  undefined,
                                  [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "item")],
                                  undefined,
                                  ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                  itemSchema.toJsonExpression!(ts.factory.createIdentifier("item"))
                              )
                          ]
                      )
                : undefined
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public set = (itemSchema: SerializationFormat.Schema): SerializationFormat.SchemaWithUtils => {
        // JSON wire format uses arrays for sets
        // Parsing: z.array().transform(arr => new Set(arr)) converts array → Set
        // Serialization: Array.from() converts Set → Array (with item serialization if needed)
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => {
                // z.array(itemSchema).transform(arr => new Set(arr))
                const arraySchema = this.zodCall("array", [itemSchema.toExpression()]);
                const transformFn = ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "arr")],
                    undefined,
                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.factory.createNewExpression(ts.factory.createIdentifier("Set"), undefined, [
                        ts.factory.createIdentifier("arr")
                    ])
                );
                return chainMethod(arraySchema, "transform", [transformFn]);
            },
            // For JSON serialization, convert Set to Array
            // If items need serialization, map over them: Array.from(set).map(item => item.json(item))
            // Otherwise just: Array.from(set)
            toJsonExpression: itemSchema.toJsonExpression
                ? (parsed) =>
                      ts.factory.createCallExpression(
                          ts.factory.createPropertyAccessExpression(
                              ts.factory.createCallExpression(
                                  ts.factory.createPropertyAccessExpression(
                                      ts.factory.createIdentifier("Array"),
                                      "from"
                                  ),
                                  undefined,
                                  [parsed]
                              ),
                              "map"
                          ),
                          undefined,
                          [
                              ts.factory.createArrowFunction(
                                  undefined,
                                  undefined,
                                  [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "item")],
                                  undefined,
                                  ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                  itemSchema.toJsonExpression!(ts.factory.createIdentifier("item"))
                              )
                          ]
                      )
                : (parsed) =>
                      ts.factory.createCallExpression(
                          ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("Array"), "from"),
                          undefined,
                          [parsed]
                      )
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public record = ({
        keySchema: _keySchema,
        valueSchema
    }: {
        keySchema: SerializationFormat.Schema;
        valueSchema: SerializationFormat.Schema;
    }): SerializationFormat.SchemaWithUtils => {
        // JSON object keys are always strings, so we use z.string() for the key
        // regardless of the declared key type (e.g., even if Fern declares map<integer, string>)
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.zodCall("record", [this.zodCall("string"), valueSchema.toExpression()]),
            // If values need serialization, transform each value in the record
            toJsonExpression: valueSchema.toJsonExpression
                ? (parsed) =>
                      ts.factory.createCallExpression(
                          ts.factory.createPropertyAccessExpression(
                              ts.factory.createIdentifier("Object"),
                              "fromEntries"
                          ),
                          undefined,
                          [
                              ts.factory.createCallExpression(
                                  ts.factory.createPropertyAccessExpression(
                                      ts.factory.createCallExpression(
                                          ts.factory.createPropertyAccessExpression(
                                              ts.factory.createIdentifier("Object"),
                                              "entries"
                                          ),
                                          undefined,
                                          [parsed]
                                      ),
                                      "map"
                                  ),
                                  undefined,
                                  [
                                      ts.factory.createArrowFunction(
                                          undefined,
                                          undefined,
                                          [
                                              ts.factory.createParameterDeclaration(
                                                  undefined,
                                                  undefined,
                                                  undefined,
                                                  ts.factory.createArrayBindingPattern([
                                                      ts.factory.createBindingElement(undefined, undefined, "k"),
                                                      ts.factory.createBindingElement(undefined, undefined, "v")
                                                  ])
                                              )
                                          ],
                                          undefined,
                                          ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                          ts.factory.createArrayLiteralExpression([
                                              ts.factory.createIdentifier("k"),
                                              valueSchema.toJsonExpression!(ts.factory.createIdentifier("v"))
                                          ])
                                      )
                                  ]
                              )
                          ]
                      )
                : undefined
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    // ==================== Enum Schema Builder ====================

    public enum = (values: string[]): SerializationFormat.SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                this.zodCall("enum", [
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

    public string = (): SerializationFormat.SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.zodCall("string")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public stringLiteral = (literal: string): SerializationFormat.SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.zodCall("literal", [ts.factory.createStringLiteral(literal)])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public booleanLiteral = (literal: boolean): SerializationFormat.SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.zodCall("literal", [literal ? ts.factory.createTrue() : ts.factory.createFalse()])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public number = (): SerializationFormat.SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.zodCall("number")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public bigint = (): SerializationFormat.SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.zodCall("bigint")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public boolean = (): SerializationFormat.SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.zodCall("boolean")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public date = (): SerializationFormat.SchemaWithUtils => {
        // Zod's z.date() parses Date objects, but we need to parse ISO strings
        // Use z.coerce.date() or z.string().transform() for ISO string parsing
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => {
                // Use z.string() with transform to parse ISO strings to Date
                return chainMethod(this.zodCall("string"), "transform", [
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
            },
            // For JSON serialization, convert Date back to ISO string: date.toISOString()
            toJsonExpression: (parsed) =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(parsed, "toISOString"),
                    undefined,
                    []
                )
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public any = (): SerializationFormat.SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: true, // any includes null
            toExpression: () => this.zodCall("any")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public unknown = (): SerializationFormat.SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: true, // unknown can be undefined
            isNullable: false,
            toExpression: () => this.zodCall("unknown")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public never = (): SerializationFormat.SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.zodCall("never")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    // ==================== Lazy Schema Builders ====================

    public lazy = (schema: SerializationFormat.Schema): SerializationFormat.SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: schema.isOptional,
            isNullable: schema.isNullable,
            toExpression: () =>
                this.zodCall("lazy", [
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

    public lazyObject = (schema: SerializationFormat.Schema): SerializationFormat.ObjectSchema => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: schema.isNullable,
            toExpression: () =>
                this.zodCall("lazy", [
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
            // Generate a type literal that matches the wrapper object structure:
            // { _schema: z.ZodTypeAny; parse: (raw: unknown) => Parsed; json: (parsed: Parsed) => Raw }
            this.ensureZodImport();
            return ts.factory.createTypeLiteralNode([
                // _schema: z.ZodTypeAny
                ts.factory.createPropertySignature(
                    undefined,
                    "_schema",
                    undefined,
                    ts.factory.createTypeReferenceNode(
                        ts.factory.createQualifiedName(ts.factory.createIdentifier("z"), "ZodTypeAny"),
                        undefined
                    )
                ),
                // parse: (raw: unknown) => Parsed
                ts.factory.createPropertySignature(
                    undefined,
                    "parse",
                    undefined,
                    ts.factory.createFunctionTypeNode(
                        undefined,
                        [
                            ts.factory.createParameterDeclaration(
                                undefined,
                                undefined,
                                undefined,
                                "raw",
                                undefined,
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                            )
                        ],
                        parsedShape
                    )
                ),
                // json: (parsed: Parsed) => Raw
                ts.factory.createPropertySignature(
                    undefined,
                    "json",
                    undefined,
                    ts.factory.createFunctionTypeNode(
                        undefined,
                        [
                            ts.factory.createParameterDeclaration(
                                undefined,
                                undefined,
                                undefined,
                                "parsed",
                                undefined,
                                parsedShape
                            )
                        ],
                        rawShape
                    )
                )
            ]);
        },

        _fromExpression: (expression: ts.Expression, opts?: { isObject: boolean }): SerializationFormat.SchemaWithUtils => {
            // For Zod format, schemas are wrapped with { _schema, parse, json } structure
            // When used in schema composition (z.array, z.record, etc.), we need the actual Zod schema
            // When serializing, we call the wrapper's .json() method
            const baseSchema: ZodBaseSchema = {
                isOptional: false,
                isNullable: false,
                // Return expression._schema for use in schema composition (z.array(), z.record(), etc.)
                toExpression: () => ts.factory.createPropertyAccessExpression(expression, "_schema"),
                // Generate: schemaRef.json(parsed) for serialization
                // This calls the json method on the wrapper object generated in writeSchemaToFile
                toJsonExpression: (parsed) =>
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(expression, "json"),
                        undefined,
                        [parsed]
                    )
            };
            if (opts?.isObject) {
                return {
                    ...baseSchema,
                    ...this.getSchemaUtils(baseSchema),
                    ...this.getObjectLikeUtils(baseSchema),
                    ...this.getObjectUtils(baseSchema)
                } as SerializationFormat.SchemaWithUtils;
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
            // Generate same wrapper type as Schema - objects use the same structure
            this.ensureZodImport();
            return ts.factory.createTypeLiteralNode([
                // _schema: z.ZodTypeAny
                ts.factory.createPropertySignature(
                    undefined,
                    "_schema",
                    undefined,
                    ts.factory.createTypeReferenceNode(
                        ts.factory.createQualifiedName(ts.factory.createIdentifier("z"), "ZodTypeAny"),
                        undefined
                    )
                ),
                // parse: (raw: unknown) => Parsed
                ts.factory.createPropertySignature(
                    undefined,
                    "parse",
                    undefined,
                    ts.factory.createFunctionTypeNode(
                        undefined,
                        [
                            ts.factory.createParameterDeclaration(
                                undefined,
                                undefined,
                                undefined,
                                "raw",
                                undefined,
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                            )
                        ],
                        parsedShape
                    )
                ),
                // json: (parsed: Parsed) => Raw
                ts.factory.createPropertySignature(
                    undefined,
                    "json",
                    undefined,
                    ts.factory.createFunctionTypeNode(
                        undefined,
                        [
                            ts.factory.createParameterDeclaration(
                                undefined,
                                undefined,
                                undefined,
                                "parsed",
                                undefined,
                                parsedShape
                            )
                        ],
                        rawShape
                    )
                )
            ]);
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
