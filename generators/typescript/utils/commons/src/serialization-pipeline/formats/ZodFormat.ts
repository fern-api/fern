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
 * Base schema implementation for Zod format.
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
 *
 * @example
 * // createZodCall("string") generates:
 * z.string()
 *
 * // createZodCall("literal", [ts.factory.createStringLiteral("foo")]) generates:
 * z.literal("foo")
 */
function createZodCall(methodName: string, args: ts.Expression[] = []): ts.Expression {
    // AST structure: CallExpression(PropertyAccessExpression(Identifier("z"), Identifier(methodName)), args)
    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier("z"),
            ts.factory.createIdentifier(methodName)
        ),
        undefined, // type arguments (generics) - not needed for Zod calls
        args
    );
}

/**
 * Helper to chain a method call on an expression.
 *
 * @example
 * // chainMethod(z.string(), "optional") generates:
 * z.string().optional()
 *
 * // chainMethod(z.array(z.string()), "transform", [transformFn]) generates:
 * z.array(z.string()).transform(transformFn)
 */
function chainMethod(expr: ts.Expression, methodName: string, args: ts.Expression[] = []): ts.Expression {
    // AST structure: CallExpression(PropertyAccessExpression(expr, Identifier(methodName)), args)
    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(expr, ts.factory.createIdentifier(methodName)),
        undefined, // type arguments
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

    private getSchemaUtils(
        baseSchema: ZodBaseSchema
    ): Omit<SerializationFormat.SchemaWithUtils, keyof SerializationFormat.Schema> {
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
                // Zod's transform only handles parse direction (JSON → TypeScript)
                // We use .transform() for parse and store untransform separately
                //
                // Generated code example:
                // z.string().transform((val) => new Date(val))
                //
                // Note: `untransform` is used for the reverse direction (TypeScript → JSON)
                // and is handled via toJsonExpression elsewhere
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
     *
     * @example
     * // For z.string().nullable(), generates:
     * z.string().nullable()
     *
     * // If inner schema has toJsonExpression (e.g., Date → ISO string), generates serialization:
     * value != null ? value.toISOString() : null
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
                      // AST for: parsed != null ? innerTransform(parsed) : null
                      ts.factory.createConditionalExpression(
                          ts.factory.createBinaryExpression(
                              parsed,
                              ts.SyntaxKind.ExclamationEqualsToken, // != (loose equality catches null & undefined)
                              ts.factory.createNull()
                          ),
                          undefined, // question token position
                          schema.toJsonExpression!(parsed), // whenTrue: apply inner transform
                          undefined, // colon token position
                          ts.factory.createNull() // whenFalse: return null
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

    /**
     * Creates utilities for object-like schemas (objects and unions).
     *
     * withParsedProperties adds computed properties to the parsed result using Zod's transform.
     */
    private getObjectLikeUtils(
        _objectLike: ZodBaseSchema
    ): Pick<SerializationFormat.ObjectLikeSchema, "withParsedProperties"> {
        return {
            withParsedProperties: (additionalProperties: SerializationFormat.AdditionalProperty[]) => {
                // Zod doesn't have direct equivalent of withParsedProperties
                // We use .transform() to add computed properties after parsing
                if (additionalProperties.length === 0) {
                    return _objectLike as unknown as SerializationFormat.ObjectLikeSchema;
                }

                // Generate AST for:
                // schema.transform((parsed) => ({
                //     ...parsed,
                //     computedProp1: computeValue1(parsed),
                //     computedProp2: computeValue2(parsed),
                // }))
                const transformExpr = ts.factory.createArrowFunction(
                    undefined, // modifiers
                    undefined, // type parameters
                    [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "parsed")],
                    undefined, // return type
                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.factory.createObjectLiteralExpression(
                        [
                            // Spread original parsed properties: ...parsed
                            ts.factory.createSpreadAssignment(ts.factory.createIdentifier("parsed")),
                            // Add computed properties: key: getValue(parsed)
                            ...additionalProperties.map((prop) => {
                                const value = prop.getValue({
                                    getReferenceToParsed: () => ts.factory.createIdentifier("parsed")
                                });
                                return ts.factory.createPropertyAssignment(prop.key, value);
                            })
                        ],
                        true // multiLine
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

    private getObjectUtils(
        objectSchema: ZodBaseSchema
    ): Pick<SerializationFormat.ObjectSchema, "extend" | "passthrough"> {
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

    /**
     * Creates a Zod object schema from property definitions.
     *
     * Handles two complexities:
     * 1. Key renaming: Fern allows different names for wire format (raw) vs TypeScript (parsed)
     * 2. Nested serialization: Properties may need custom JSON serialization (e.g., Date → ISO string)
     *
     * @example
     * // For properties [{key: {raw: "user_name", parsed: "userName"}, value: z.string()}]
     * // Generates parsing schema:
     * z.object({ user_name: z.string() }).transform((data) => ({ userName: data.user_name }))
     *
     * // And serialization (toJsonExpression):
     * { user_name: parsed.userName }
     */
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
        // This transforms from wire format keys to TypeScript keys after Zod parses
        if (hasKeyRenaming) {
            const transformedBase: ZodBaseSchema = {
                isOptional: false,
                isNullable: false,
                toExpression: () => {
                    const inner = baseSchema.toExpression();
                    // Generate AST for key renaming transform:
                    // z.object({ raw_key: z.string() }).transform((data) => ({
                    //     parsedKey: data.raw_key,
                    //     anotherParsedKey: data.another_raw_key,
                    // }))
                    const transformExpr = ts.factory.createArrowFunction(
                        undefined,
                        undefined,
                        [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "data")],
                        undefined,
                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                        ts.factory.createObjectLiteralExpression(
                            // Map each property: parsedKey: data.rawKey
                            properties.map((prop) =>
                                ts.factory.createPropertyAssignment(
                                    prop.key.parsed, // TypeScript property name
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier("data"),
                                        prop.key.raw // Wire format property name
                                    )
                                )
                            ),
                            true // multiLine
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

    public objectWithoutOptionalProperties = (
        properties: SerializationFormat.Property[]
    ): SerializationFormat.ObjectSchema => {
        // In Zod, we use .strict() to disallow extra properties
        // For "without optional properties", we just create a regular object
        // The optionality is handled at the property level
        return this.object(properties);
    };

    // ==================== Union Schema Builders ====================

    /**
     * Creates a discriminated union schema.
     *
     * @example
     * // For a union with discriminant "type" and variants "dog" | "cat":
     * z.discriminatedUnion("type", [
     *     z.object({ type: z.literal("dog") }).merge(DogSchema as z.AnyZodObject),
     *     z.object({ type: z.literal("cat") }).merge(CatSchema as z.AnyZodObject),
     * ])
     */
    public union = ({
        parsedDiscriminant,
        rawDiscriminant,
        singleUnionTypes
    }: SerializationFormat.UnionArgs): SerializationFormat.ObjectLikeSchema => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => {
                this.ensureZodImport();
                // Use z.discriminatedUnion for better performance than z.union
                // Each variant is: z.object({ discriminant: z.literal("value") }).merge(propsSchema)
                const variants = singleUnionTypes.map((variant) => {
                    // Create discriminant property: { type: z.literal("dog") }
                    const discriminantProp = ts.factory.createPropertyAssignment(
                        ts.factory.createStringLiteral(rawDiscriminant),
                        this.zodCall("literal", [ts.factory.createStringLiteral(variant.discriminantValue)])
                    );

                    // Get the properties from the non-discriminant schema
                    // We need to merge them with the discriminant
                    // Cast to z.AnyZodObject because the imported schema is typed as z.ZodType
                    // but .merge() requires ZodObject - this is a TypeScript type assertion, not runtime
                    const schemaWithCast = ts.factory.createAsExpression(
                        variant.nonDiscriminantProperties.toExpression(),
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createQualifiedName(ts.factory.createIdentifier("z"), "AnyZodObject"),
                            undefined
                        )
                    );
                    // Combine: z.object({ type: z.literal("dog") }).merge(DogPropsSchema)
                    return chainMethod(
                        this.zodCall("object", [ts.factory.createObjectLiteralExpression([discriminantProp], false)]),
                        "merge",
                        [schemaWithCast]
                    );
                });

                // Final: z.discriminatedUnion("type", [variant1, variant2, ...])
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

    /**
     * Creates an array/list schema.
     *
     * @example
     * // Parsing schema:
     * z.array(z.string())
     *
     * // Serialization (toJsonExpression) for Date[] items:
     * parsed.map((item) => item.toISOString())
     */
    public list = (itemSchema: SerializationFormat.Schema): SerializationFormat.SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.zodCall("array", [itemSchema.toExpression()]),
            // If items need serialization, map over array and serialize each item
            // Generate: parsed.map((item) => itemTransform(item))
            toJsonExpression: itemSchema.toJsonExpression
                ? (parsed) =>
                      ts.factory.createCallExpression(
                          ts.factory.createPropertyAccessExpression(parsed, "map"),
                          undefined,
                          [
                              // Arrow function: (item) => itemTransform(item)
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

    /**
     * Creates a Set schema.
     *
     * JSON wire format uses arrays, so we transform:
     * - Parsing: JSON array → JavaScript Set via z.array().transform(arr => new Set(arr))
     * - Serialization: JavaScript Set → JSON array via Array.from(set)
     *
     * @example
     * // Parsing schema:
     * z.array(z.string()).transform((arr) => new Set(arr))
     *
     * // Serialization (toJsonExpression) for Set<Date>:
     * Array.from(mySet).map((item) => item.toISOString())
     */
    public set = (itemSchema: SerializationFormat.Schema): SerializationFormat.SchemaWithUtils => {
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => {
                // Generate: z.array(itemSchema).transform((arr) => new Set(arr))
                const arraySchema = this.zodCall("array", [itemSchema.toExpression()]);
                // Arrow function: (arr) => new Set(arr)
                const transformFn = ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "arr")],
                    undefined,
                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    // new Set(arr)
                    ts.factory.createNewExpression(ts.factory.createIdentifier("Set"), undefined, [
                        ts.factory.createIdentifier("arr")
                    ])
                );
                return chainMethod(arraySchema, "transform", [transformFn]);
            },
            // For JSON serialization, convert Set to Array
            // If items need serialization: Array.from(set).map(item => itemTransform(item))
            // Otherwise just: Array.from(set)
            toJsonExpression: itemSchema.toJsonExpression
                ? (parsed) =>
                      // Generate: Array.from(parsed).map((item) => itemTransform(item))
                      ts.factory.createCallExpression(
                          ts.factory.createPropertyAccessExpression(
                              // Array.from(parsed)
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
                              // Arrow function: (item) => itemTransform(item)
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
                      // Generate: Array.from(parsed)
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

    /**
     * Creates a Record/Map schema (key-value dictionary).
     *
     * @example
     * // Parsing schema:
     * z.record(z.string(), z.date())
     *
     * // Serialization (toJsonExpression) for Record<string, Date>:
     * Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, v.toISOString()]))
     */
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
            // Pattern: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, transform(v)]))
            toJsonExpression: valueSchema.toJsonExpression
                ? (parsed) =>
                      // Generate: Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, valueTransform(v)]))
                      ts.factory.createCallExpression(
                          ts.factory.createPropertyAccessExpression(
                              ts.factory.createIdentifier("Object"),
                              "fromEntries"
                          ),
                          undefined,
                          [
                              // Object.entries(parsed).map(...)
                              ts.factory.createCallExpression(
                                  ts.factory.createPropertyAccessExpression(
                                      // Object.entries(parsed)
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
                                      // Arrow function with destructuring: ([k, v]) => [k, valueTransform(v)]
                                      ts.factory.createArrowFunction(
                                          undefined,
                                          undefined,
                                          [
                                              // Destructuring parameter: [k, v]
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
                                          // Return [k, valueTransform(v)]
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

    /**
     * Creates a Date schema.
     *
     * JSON wire format uses ISO 8601 strings, so we transform:
     * - Parsing: ISO string → JavaScript Date via z.string().transform(s => new Date(s))
     * - Serialization: JavaScript Date → ISO string via date.toISOString()
     *
     * @example
     * // Parsing schema:
     * z.string().transform((s) => new Date(s))
     *
     * // Serialization (toJsonExpression):
     * myDate.toISOString()
     */
    public date = (): SerializationFormat.SchemaWithUtils => {
        // Zod's z.date() parses Date objects, but we need to parse ISO strings from JSON
        // Use z.string().transform() for ISO string → Date parsing
        const baseSchema: ZodBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => {
                // Generate: z.string().transform((s) => new Date(s))
                return chainMethod(this.zodCall("string"), "transform", [
                    // Arrow function: (s) => new Date(s)
                    ts.factory.createArrowFunction(
                        undefined,
                        undefined,
                        [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "s")],
                        undefined,
                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                        // new Date(s)
                        ts.factory.createNewExpression(ts.factory.createIdentifier("Date"), undefined, [
                            ts.factory.createIdentifier("s")
                        ])
                    )
                ]);
            },
            // For JSON serialization, convert Date back to ISO string
            // Generate: parsed.toISOString()
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

    /**
     * Type utilities for generating schema type references.
     *
     * In Zod format, each schema file exports a wrapper object:
     * ```typescript
     * export const MyTypeSchema = {
     *     _schema: z.object({ ... }),
     *     parse: (raw: unknown): MyType => _schema.parse(raw),
     *     json: (parsed: MyType): MyTypeRaw => ({ ... })
     * }
     * ```
     *
     * These utilities generate the TypeScript types for such wrapper objects.
     */
    public Schema = {
        /**
         * Generates type: { _schema: z.ZodTypeAny; parse: (raw: unknown) => Parsed; json: (parsed: Parsed) => Raw }
         */
        _getReferenceToType: ({ rawShape, parsedShape }: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }) => {
            this.ensureZodImport();
            // Generate a TypeLiteralNode with three properties: _schema, parse, json
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

        /**
         * Creates a schema from an imported schema reference expression.
         *
         * In Zod format, schemas are wrapped in objects with { _schema, parse, json } structure:
         * - _schema: The actual Zod schema (z.object, z.string, etc.)
         * - parse: Function to parse JSON → TypeScript type
         * - json: Function to serialize TypeScript type → JSON
         *
         * @example
         * // For an imported schema reference `UserSchema`:
         * // toExpression() returns: UserSchema._schema (for use in z.array(UserSchema._schema))
         * // toJsonExpression(parsed) returns: UserSchema.json(parsed)
         */
        _fromExpression: (
            expression: ts.Expression,
            opts?: { isObject: boolean }
        ): SerializationFormat.SchemaWithUtils => {
            const baseSchema: ZodBaseSchema = {
                isOptional: false,
                isNullable: false,
                // Return expression._schema for use in schema composition (z.array(), z.record(), etc.)
                // This accesses the raw Zod schema from the wrapper object
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

        /**
         * Generates if/else statements for handling Zod's safeParse result.
         *
         * Zod's safeParse returns: { success: boolean; data?: T; error?: ZodError }
         *
         * @example
         * // Generated code:
         * if (result.success) {
         *     // valid branch: use result.data
         * } else {
         *     // invalid branch: use result.error
         * }
         */
        _visitMaybeValid: (
            referenceToMaybeValid: ts.Expression,
            visitor: {
                valid: (referenceToValue: ts.Expression) => ts.Statement[];
                invalid: (referenceToErrors: ts.Expression) => ts.Statement[];
            }
        ): ts.Statement[] => {
            // Generate: if (result.success) { ...validStatements } else { ...invalidStatements }
            return [
                ts.factory.createIfStatement(
                    // Condition: result.success
                    ts.factory.createPropertyAccessExpression(referenceToMaybeValid, "success"),
                    // Then block: visitor.valid(result.data)
                    ts.factory.createBlock(
                        visitor.valid(ts.factory.createPropertyAccessExpression(referenceToMaybeValid, "data")),
                        true // multiLine
                    ),
                    // Else block: visitor.invalid(result.error)
                    ts.factory.createBlock(
                        visitor.invalid(ts.factory.createPropertyAccessExpression(referenceToMaybeValid, "error")),
                        true // multiLine
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
