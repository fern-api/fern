import { ts } from "ts-morph";

import { CoreUtility } from "../../core-utilities/CoreUtility";
import { ImportsManager } from "../../imports-manager";
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
    SingleUnionType,
    UnionArgs
} from "../SerializationFormat";

/**
 * Manifest for the Zurg runtime files.
 * Used by CoreUtilitiesManager to copy runtime files to generated SDK.
 *
 * @abstract @Zurg validation schema files. Note that while they are still currently bundled in the source, the
 * next phase will to be move them into a separate public npm package that can be imported in the same manner as Zod and other libs.
 * A possible alternative to that is to generate them using ASTs but that would end up being more complex to maintain.
 */
export const ZURG_MANIFEST: CoreUtility.Manifest = {
    name: "schemas",
    pathInCoreUtilities: { nameOnDisk: "schemas", exportDeclaration: { namespaceExport: "serialization" } },
    getFilesPatterns: () => {
        return { patterns: ["src/core/schemas/**", "tests/unit/schemas/**"] };
    }
};

/**
 * Base schema implementation for Zurg format
 */
interface ZurgBaseSchema extends Schema {
    toExpression: () => ts.Expression;
    isOptional: boolean;
    isNullable: boolean;
}

/**
 * Helper to create a property access expression like `serialization.string()`.
 */
function createSerializationCall(methodName: string, args: ts.Expression[] = []): ts.Expression {
    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier("serialization"),
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
 * ZurgFormat - generates Zurg schema code.
 * Uses locally bundled runtime files with simple import pattern.
 */
export class ZurgFormat implements SerializationFormat {
    public readonly name = "zurg" as const;

    private importsManager?: ImportsManager;
    private hasAddedSerializationImport = false;
    private generateEndpointMetadata: boolean;

    constructor(config: SerializationFormatConfig, importsManager?: ImportsManager) {
        this.importsManager = importsManager;
        this.generateEndpointMetadata = config.generateEndpointMetadata;
    }

    /**
     * Ensure the serialization import is added to the current file
     */
    private ensureSerializationImport(): void {
        if (!this.hasAddedSerializationImport && this.importsManager) {
            this.importsManager.addImportFromRoot("core/schemas", { namespaceImport: "serialization" });
            this.hasAddedSerializationImport = true;
        }
    }

    /**
     * Create a serialization call expression and ensure the import is added
     */
    private serializationCall(methodName: string, args: ts.Expression[] = []): ts.Expression {
        this.ensureSerializationImport();
        return createSerializationCall(methodName, args);
    }

    // ==================== Schema Utilities ====================

    private getSchemaUtils(baseSchema: ZurgBaseSchema): Omit<SchemaWithUtils, keyof Schema> {
        return {
            nullable: () => this.nullable(baseSchema),
            optional: () => this.optional(baseSchema),
            optionalNullable: () => this.optionalNullable(baseSchema),
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

    private nullable(schema: ZurgBaseSchema): SchemaWithUtils {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: true,
            toExpression: () => chainMethod(schema.toExpression(), "nullable")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    }

    private optional(schema: ZurgBaseSchema): SchemaWithUtils {
        const baseSchema: ZurgBaseSchema = {
            isOptional: true,
            isNullable: false,
            toExpression: () => chainMethod(schema.toExpression(), "optional")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    }

    private optionalNullable(schema: ZurgBaseSchema): SchemaWithUtils {
        const baseSchema: ZurgBaseSchema = {
            isOptional: true,
            isNullable: true,
            toExpression: () => chainMethod(schema.toExpression(), "optionalNullable")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    }

    private transform(
        schema: ZurgBaseSchema,
        { newShape, transformer }: { newShape: ts.TypeNode | undefined; transformer: ZurgBaseSchema }
    ): SchemaWithUtils {
        const baseSchema: ZurgBaseSchema = {
            isOptional: transformer.isOptional,
            isNullable: transformer.isNullable,
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

    // ==================== Object-like Utilities ====================

    private getObjectLikeUtils(objectLike: ZurgBaseSchema): Pick<ObjectLikeSchema, "withParsedProperties"> {
        return {
            withParsedProperties: (additionalProperties: AdditionalProperty[]) =>
                this.withParsedProperties(objectLike, additionalProperties)
        };
    }

    private withParsedProperties(
        objectLike: ZurgBaseSchema,
        additionalProperties: AdditionalProperty[]
    ): ObjectLikeSchema {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
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

    // ==================== Object Utilities ====================

    private getObjectUtils(objectSchema: ZurgBaseSchema): Pick<ObjectSchema, "extend" | "passthrough"> {
        return {
            extend: (extension) => this.extend(objectSchema, extension as ZurgBaseSchema),
            passthrough: () => {
                const baseSchema: ZurgBaseSchema = {
                    isOptional: false,
                    isNullable: false,
                    toExpression: () => chainMethod(objectSchema.toExpression(), "passthrough")
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

    private extend(objectSchema: ZurgBaseSchema, extension: ZurgBaseSchema): ObjectSchema {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => chainMethod(objectSchema.toExpression(), "extend", [extension.toExpression()])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
            ...this.getObjectLikeUtils(baseSchema),
            ...this.getObjectUtils(baseSchema)
        };
    }

    // ==================== Object Schema Builders ====================

    public object = (properties: Property[]): ObjectSchema => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.serializationCall("object", [this.constructObjectLiteralForProperties(properties)])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
            ...this.getObjectLikeUtils(baseSchema),
            ...this.getObjectUtils(baseSchema)
        };
    };

    public objectWithoutOptionalProperties = (properties: Property[]): ObjectSchema => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                this.serializationCall("objectWithoutOptionalProperties", [
                    this.constructObjectLiteralForProperties(properties)
                ])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema),
            ...this.getObjectLikeUtils(baseSchema),
            ...this.getObjectUtils(baseSchema)
        };
    };

    private constructObjectLiteralForProperties(properties: Property[]): ts.ObjectLiteralExpression {
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

    private property(rawValue: string, value: ts.Expression): ts.Expression {
        return this.serializationCall("property", [ts.factory.createStringLiteral(rawValue), value]);
    }

    // ==================== Union Schema Builders ====================

    public union = ({ parsedDiscriminant, rawDiscriminant, singleUnionTypes }: UnionArgs): ObjectLikeSchema => {
        const discriminantArgument =
            parsedDiscriminant === rawDiscriminant
                ? ts.factory.createStringLiteral(parsedDiscriminant)
                : this.discriminant({ parsedDiscriminant, rawDiscriminant });

        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                this.serializationCall("union", [
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
    };

    private discriminant({
        parsedDiscriminant,
        rawDiscriminant
    }: {
        parsedDiscriminant: string;
        rawDiscriminant: string;
    }): ts.Expression {
        return this.serializationCall("discriminant", [
            ts.factory.createStringLiteral(parsedDiscriminant),
            ts.factory.createStringLiteral(rawDiscriminant)
        ]);
    }

    public undiscriminatedUnion = (schemas: Schema[]): SchemaWithUtils => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                this.serializationCall("undiscriminatedUnion", [
                    ts.factory.createArrayLiteralExpression(schemas.map((schema) => schema.toExpression()))
                ])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    // ==================== Collection Schema Builders ====================

    public list = (itemSchema: Schema): SchemaWithUtils => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.serializationCall("list", [itemSchema.toExpression()])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public set = (itemSchema: Schema): SchemaWithUtils => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.serializationCall("set", [itemSchema.toExpression()])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public record = ({ keySchema, valueSchema }: { keySchema: Schema; valueSchema: Schema }): SchemaWithUtils => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.serializationCall("record", [keySchema.toExpression(), valueSchema.toExpression()])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    // ==================== Enum Schema Builder ====================

    public enum = (values: string[]): SchemaWithUtils => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                this.serializationCall("enum_", [
                    ts.factory.createArrayLiteralExpression(
                        values.map((value) => ts.factory.createStringLiteral(value))
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
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.serializationCall("string")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public stringLiteral = (literal: string): SchemaWithUtils => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.serializationCall("stringLiteral", [ts.factory.createStringLiteral(literal)])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public booleanLiteral = (literal: boolean): SchemaWithUtils => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () =>
                this.serializationCall("booleanLiteral", [literal ? ts.factory.createTrue() : ts.factory.createFalse()])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public number = (): SchemaWithUtils => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.serializationCall("number")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public bigint = (): SchemaWithUtils => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.serializationCall("bigint")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public boolean = (): SchemaWithUtils => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.serializationCall("boolean")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public date = (): SchemaWithUtils => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.serializationCall("date")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public any = (): SchemaWithUtils => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: true,
            toExpression: () => this.serializationCall("any")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public unknown = (): SchemaWithUtils => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: true,
            isNullable: false,
            toExpression: () => this.serializationCall("unknown")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public never = (): SchemaWithUtils => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: false,
            toExpression: () => this.serializationCall("never")
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    // ==================== Lazy Schema Builders ====================

    public lazy = (schema: Schema): SchemaWithUtils => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: schema.isOptional,
            isNullable: schema.isNullable,
            toExpression: () =>
                this.serializationCall("lazy", [
                    ts.factory.createArrowFunction([], undefined, [], undefined, undefined, schema.toExpression())
                ])
        };

        return {
            ...baseSchema,
            ...this.getSchemaUtils(baseSchema)
        };
    };

    public lazyObject = (schema: Schema): ObjectSchema => {
        const baseSchema: ZurgBaseSchema = {
            isOptional: false,
            isNullable: schema.isNullable,
            toExpression: () =>
                this.serializationCall("lazyObject", [
                    ts.factory.createArrowFunction([], undefined, [], undefined, undefined, schema.toExpression())
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
            this.ensureSerializationImport();
            return ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(ts.factory.createIdentifier("serialization"), "Schema"),
                [rawShape, parsedShape]
            );
        },

        _fromExpression: (expression: ts.Expression, opts?: { isObject: boolean }): SchemaWithUtils => {
            const baseSchema: ZurgBaseSchema = {
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

        _fromTransformers: ({
            transform,
            untransform
        }: {
            transform: ts.Expression;
            untransform: ts.Expression;
        }): ZurgBaseSchema => {
            return {
                isOptional: false,
                isNullable: false,
                toExpression: () =>
                    ts.factory.createObjectLiteralExpression(
                        [
                            ts.factory.createPropertyAssignment("transform", transform),
                            ts.factory.createPropertyAssignment("untransform", untransform)
                        ],
                        true
                    )
            };
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
        _getReferenceToType: ({ rawShape, parsedShape }: { rawShape: ts.TypeNode; parsedShape: ts.TypeNode }) => {
            this.ensureSerializationImport();
            return ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(ts.factory.createIdentifier("serialization"), "ObjectSchema"),
                [rawShape, parsedShape]
            );
        }
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

    // ==================== Runtime Configuration ====================

    public getRuntimeDependencies(): Record<string, string> {
        // Zurg uses locally bundled runtime, no npm dependencies needed
        return {};
    }

    public getRuntimeFilePatterns(): { patterns: string[]; ignore?: string[] } | null {
        // Return the file patterns for Zurg runtime to be copied
        return { patterns: ["src/core/schemas/**", "tests/unit/schemas/**"] };
    }
}
