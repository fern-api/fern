import * as FernIr from "@fern-api/ir-sdk";
import { mergeWith } from "lodash-es";
import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractConverterContext, Extensions } from "../..";
import { createTypeReferenceFromFernType } from "../../utils/CreateTypeReferenceFromFernType";
import { ExampleConverter } from "../ExampleConverter";
import { ArraySchemaConverter } from "./ArraySchemaConverter";
import { EnumSchemaConverter } from "./EnumSchemaConverter";
import { MapSchemaConverter } from "./MapSchemaConverter";
import { ObjectSchemaConverter } from "./ObjectSchemaConverter";
import { OneOfSchemaConverter } from "./OneOfSchemaConverter";
import { PrimitiveSchemaConverter } from "./PrimitiveSchemaConverter";

const TYPE_INVARIANT_KEYS = [
    "description",
    "example",
    "title",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "xml",
    "externalDocs",
    "extensions"
];

export declare namespace SchemaConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        id: string;
        schema: OpenAPIV3_1.SchemaObject;
        inlined?: boolean;
        nameOverride?: string;
    }

    export interface ConvertedSchema {
        typeDeclaration: FernIr.TypeDeclaration;
        audiences: string[];
        propertiesByAudience: Record<string, Set<string>>;
    }

    export interface Output {
        convertedSchema: ConvertedSchema;
        inlinedTypes: Record<FernIr.TypeId, ConvertedSchema>;
    }
}

export class SchemaConverter extends AbstractConverter<AbstractConverterContext<object>, SchemaConverter.Output> {
    private readonly schema: OpenAPIV3_1.SchemaObject;
    private readonly id: string;
    private readonly inlined: boolean;
    private readonly audiences: string[];
    private readonly nameOverride?: string;

    constructor({ context, breadcrumbs, schema, id, inlined = false, nameOverride }: SchemaConverter.Args) {
        super({ context, breadcrumbs });
        this.schema = schema;
        this.id = id;
        this.inlined = inlined;
        this.nameOverride = nameOverride;
        this.audiences =
            this.context.getAudiences({
                operation: this.schema,
                breadcrumbs: this.breadcrumbs
            }) ?? [];
    }

    public convert(): SchemaConverter.Output | undefined {
        const maybeConvertedFernTypeDeclaration = this.tryConvertFernTypeDeclaration();
        if (maybeConvertedFernTypeDeclaration != null) {
            return maybeConvertedFernTypeDeclaration;
        }

        const maybeConvertedEnumSchema = this.tryConvertEnumSchema();
        if (maybeConvertedEnumSchema != null) {
            return maybeConvertedEnumSchema;
        }

        const maybeConvertedSingularAllOfSchema = this.tryConvertSingularAllOfSchema();
        if (maybeConvertedSingularAllOfSchema != null) {
            return maybeConvertedSingularAllOfSchema;
        }

        const maybeConvertedPrimitiveSchema = this.tryConvertPrimitiveSchema();
        if (maybeConvertedPrimitiveSchema != null) {
            return maybeConvertedPrimitiveSchema;
        }

        const maybeConvertedArraySchema = this.tryConvertArraySchema();
        if (maybeConvertedArraySchema != null) {
            return maybeConvertedArraySchema;
        }

        const maybeConvertedTypeArraySchema = this.tryConvertTypeArraySchema();
        if (maybeConvertedTypeArraySchema != null) {
            return maybeConvertedTypeArraySchema;
        }

        const maybeConvertedOneOfAnyOfSchema = this.tryConvertOneOfAnyOfSchema();
        if (maybeConvertedOneOfAnyOfSchema != null) {
            return maybeConvertedOneOfAnyOfSchema;
        }

        const maybeConvertedMapSchema = this.tryConvertMapSchema();
        if (maybeConvertedMapSchema != null) {
            return maybeConvertedMapSchema;
        }

        const maybeConvertedObjectAllOfSchema = this.tryConvertObjectAllOfSchema();
        if (maybeConvertedObjectAllOfSchema != null) {
            return maybeConvertedObjectAllOfSchema;
        }

        const maybeConvertedUntypedSchema = this.tryConvertUntypedSchema();
        if (maybeConvertedUntypedSchema != null) {
            return maybeConvertedUntypedSchema;
        }

        this.context.errorCollector.collect({
            message: `Failed to convert schema object: ${JSON.stringify(this.schema, null, 2)}`,
            path: this.breadcrumbs
        });
        return undefined;
    }

    private tryConvertEnumSchema(): SchemaConverter.Output | undefined {
        if (!this.schema.enum?.length) {
            return undefined;
        }
        const fernEnumConverter = new Extensions.FernEnumExtension({
            breadcrumbs: this.breadcrumbs,
            schema: this.schema,
            context: this.context
        });
        const maybeFernEnum = fernEnumConverter.convert();

        const enumConverter = new EnumSchemaConverter({
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            schema: this.schema,
            maybeFernEnum
        });
        const enumType = enumConverter.convert();
        if (enumType != null) {
            return {
                convertedSchema: {
                    typeDeclaration: this.createTypeDeclaration({
                        shape: enumType.type,
                        referencedTypes: new Set()
                    }),
                    audiences: this.audiences,
                    propertiesByAudience: {}
                },
                inlinedTypes: {}
            };
        }
        return undefined;
    }

    private tryConvertSingularAllOfSchema(): SchemaConverter.Output | undefined {
        if (
            this.schemaOnlyHasAllowedKeys(["allOf", "type", "title"]) &&
            this.schema.allOf?.length === 1 &&
            this.schema.allOf[0] != null
        ) {
            const allOfSchema = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                schemaOrReference: this.schema.allOf[0],
                breadcrumbs: this.breadcrumbs
            });

            if (allOfSchema != null) {
                const allOfConverter = new SchemaConverter({
                    context: this.context,
                    breadcrumbs: [...this.breadcrumbs, "allOf", "0"],
                    schema: allOfSchema,
                    id: this.id,
                    inlined: true
                });

                const allOfResult = allOfConverter.convert();

                if (allOfResult?.convertedSchema.typeDeclaration?.shape.type !== "object") {
                    return allOfResult;
                }
            }
        }

        const shouldMergeAllOf =
            this.schemaOnlyHasAllowedKeys(["allOf", "type", "title"]) &&
            Array.isArray(this.schema.allOf) &&
            this.schema.allOf.length >= 1;

        if (shouldMergeAllOf) {
            let mergedSchema: Record<string, unknown> = {};
            for (const allOfSchema of this.schema.allOf ?? []) {
                if (this.context.isReferenceObject(allOfSchema)) {
                    return undefined;
                }
                mergedSchema = mergeWith(mergedSchema, allOfSchema, (objValue, srcValue) => {
                    if (srcValue === allOfSchema) {
                        return objValue;
                    }
                    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
                        return [...objValue, ...srcValue];
                    }
                    return undefined;
                });
            }

            const mergedConverter = new SchemaConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: mergedSchema,
                id: this.id,
                inlined: true
            });
            return mergedConverter.convert();
        }

        return undefined;
    }

    private tryConvertPrimitiveSchema(): SchemaConverter.Output | undefined {
        const primitiveConverter = new PrimitiveSchemaConverter({ context: this.context, schema: this.schema });
        const primitiveType = primitiveConverter.convert();
        if (primitiveType != null) {
            return {
                convertedSchema: {
                    typeDeclaration: this.createTypeDeclaration({
                        shape: FernIr.Type.alias({
                            aliasOf: primitiveType,
                            // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                            resolvedType: primitiveType as any
                        }),
                        referencedTypes: new Set()
                    }),
                    audiences: this.audiences,
                    propertiesByAudience: {}
                },
                inlinedTypes: {}
            };
        }
        return undefined;
    }

    private tryConvertArraySchema(): SchemaConverter.Output | undefined {
        if (this.schema.type === "array") {
            const arrayConverter = new ArraySchemaConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: this.schema
            });
            const arrayType = arrayConverter.convert();
            if (arrayType != null) {
                return {
                    convertedSchema: {
                        typeDeclaration: this.createTypeDeclaration({
                            shape: FernIr.Type.alias({
                                aliasOf: arrayType.typeReference,
                                // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                                resolvedType: arrayType.typeReference as any
                            }),
                            referencedTypes: arrayType.referencedTypes
                        }),
                        audiences: this.audiences,
                        propertiesByAudience: {}
                    },
                    inlinedTypes: arrayType.inlinedTypes
                };
            }
        }
        return undefined;
    }

    private tryConvertTypeArraySchema(): SchemaConverter.Output | undefined {
        if (Array.isArray(this.schema.type) && this.schema.type.length > 0) {
            if (this.schema.type.length === 1) {
                this.schema.type = this.schema.type[0];
            } else {
                this.schema.oneOf = this.schema.type.map((type) => ({
                    type: type as OpenAPIV3_1.NonArraySchemaObjectType
                }));
                this.schema.type = undefined;
            }
            return this.convert();
        }
        return undefined;
    }

    private tryConvertOneOfAnyOfSchema(): SchemaConverter.Output | undefined {
        if (this.schema.oneOf != null || this.schema.anyOf != null) {
            const oneOfConverter = new OneOfSchemaConverter({
                id: this.id,
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: this.schema,
                inlinedTypes: {}
            });
            const oneOfType = oneOfConverter.convert();
            if (oneOfType != null) {
                return {
                    convertedSchema: {
                        typeDeclaration: this.createTypeDeclaration({
                            shape: oneOfType.type,
                            referencedTypes: oneOfType.referencedTypes
                        }),
                        audiences: this.audiences,
                        propertiesByAudience: {}
                    },
                    inlinedTypes: oneOfType.inlinedTypes
                };
            }
        }
        return undefined;
    }

    private tryConvertMapSchema(): SchemaConverter.Output | undefined {
        if (
            (typeof this.schema.additionalProperties === "object" ||
                typeof this.schema.additionalProperties === "boolean") &&
            this.schema.additionalProperties != null &&
            !this.schema.properties &&
            !this.schema.allOf
        ) {
            if (typeof this.schema.additionalProperties === "boolean" && this.schema.additionalProperties === false) {
                return undefined;
            }
            const additionalPropertiesConverter = new MapSchemaConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schemaOrReferenceOrBoolean: this.schema.additionalProperties
            });
            const additionalPropertiesType = additionalPropertiesConverter.convert();
            if (additionalPropertiesType != null) {
                return {
                    convertedSchema: {
                        typeDeclaration: this.createTypeDeclaration({
                            shape: additionalPropertiesType.type,
                            referencedTypes: additionalPropertiesType.referencedTypes
                        }),
                        audiences: this.audiences,
                        propertiesByAudience: {}
                    },
                    inlinedTypes: additionalPropertiesType.inlinedTypes
                };
            }
        }
        return undefined;
    }

    private tryConvertObjectAllOfSchema(): SchemaConverter.Output | undefined {
        if (this.schema.type === "object" || this.schema.properties != null || this.schema.allOf != null) {
            const objectConverter = new ObjectSchemaConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: this.schema
            });
            const convertedObject = objectConverter.convert();
            if (convertedObject != null) {
                return {
                    convertedSchema: {
                        typeDeclaration: this.createTypeDeclaration({
                            shape: convertedObject.type,
                            referencedTypes: convertedObject.referencedTypes
                        }),
                        audiences: this.audiences,
                        propertiesByAudience: convertedObject.propertiesByAudience
                    },
                    inlinedTypes: convertedObject.inlinedTypes
                };
            }
        }
        return undefined;
    }

    private tryConvertUntypedSchema(): SchemaConverter.Output | undefined {
        if (this.isUntypedSchema()) {
            return {
                convertedSchema: {
                    typeDeclaration: this.createTypeDeclaration({
                        shape: FernIr.Type.alias({
                            aliasOf: FernIr.TypeReference.unknown(),
                            // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                            resolvedType: FernIr.TypeReference.unknown() as any
                        }),
                        referencedTypes: new Set()
                    }),
                    audiences: this.audiences,
                    propertiesByAudience: {}
                },
                inlinedTypes: {}
            };
        }
        return undefined;
    }

    private tryConvertFernTypeDeclaration(): SchemaConverter.Output | undefined {
        const fernTypeConverter = new Extensions.FernTypeExtension({
            breadcrumbs: this.breadcrumbs,
            schema: this.schema,
            context: this.context
        });
        const fernType = fernTypeConverter.convert();
        if (fernType == null) {
            return undefined;
        }
        const typeReference = createTypeReferenceFromFernType(fernType);
        if (typeReference == null) {
            return undefined;
        }
        return {
            convertedSchema: {
                typeDeclaration: this.createTypeDeclaration({
                    shape: FernIr.Type.alias({
                        aliasOf: typeReference,
                        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                        resolvedType: typeReference as any
                    }),
                    referencedTypes: new Set(),
                    omitV2Examples: true
                }),
                audiences: this.audiences,
                propertiesByAudience: {}
            },
            inlinedTypes: {}
        };
    }

    public createTypeDeclaration({
        shape,
        referencedTypes,
        omitV2Examples
    }: {
        shape: FernIr.Type;
        referencedTypes: Set<string>;
        omitV2Examples?: boolean;
    }): FernIr.TypeDeclaration {
        return {
            name: this.convertDeclaredTypeName(),
            shape,
            autogeneratedExamples: [],
            userProvidedExamples: [],
            encoding: undefined,
            availability: this.context.getAvailability({
                node: this.schema,
                breadcrumbs: this.breadcrumbs
            }),
            docs: this.schema.description,
            referencedTypes,
            source: undefined,
            inline: this.inlined,
            v2Examples: omitV2Examples ? undefined : this.convertSchemaExamples()
        };
    }

    public convertDeclaredTypeName(): FernIr.DeclaredTypeName {
        return {
            typeId: this.id,
            fernFilepath: this.context.createFernFilepath(),
            name: this.context.casingsGenerator.generateName(this.id),
            displayName: this.nameOverride
        };
    }

    /**
     * Checks if the schema only has the specified keys
     * @param allowedKeys - List of keys that are allowed in the schema
     * @returns true if the schema only has the specified keys, false otherwise
     */
    private schemaOnlyHasAllowedKeys(allowedKeys: string[]): boolean {
        const allAllowedKeys = [...TYPE_INVARIANT_KEYS, ...allowedKeys];
        const schemaKeys = Object.keys(this.schema);
        return schemaKeys.every((key) => allAllowedKeys.includes(key));
    }

    private isUntypedSchema(): boolean {
        if (
            this.schema &&
            typeof this.schema === "object" &&
            !("oneOf" in this.schema) &&
            !("anyOf" in this.schema) &&
            !("allOf" in this.schema) &&
            !("items" in this.schema) &&
            !("properties" in this.schema)
        ) {
            return true;
        }
        return false;
    }

    private convertSchemaExamples(): FernIr.V2SchemaExamples {
        const v2Examples = {
            userSpecifiedExamples: {},
            autogeneratedExamples: {}
        };

        const examples = this.context.getExamplesFromSchema({
            schema: this.schema,
            breadcrumbs: this.breadcrumbs
        });

        if (examples.length === 0) {
            const convertedExample = this.generateOrValidateExample({
                example: undefined,
                ignoreErrors: true
            });
            v2Examples.autogeneratedExamples = {
                [`${this.id}_example_autogenerated`]: convertedExample
            };
            return v2Examples;
        }

        v2Examples.userSpecifiedExamples = this.convertUserSpecifiedExamples(examples);
        return v2Examples;
    }

    private convertUserSpecifiedExamples(examples: unknown[]): Record<string, unknown> {
        const userSpecifiedExamples: Record<string, unknown> = {};

        for (const [index, example] of examples.entries()) {
            const resolvedExample = this.context.resolveExample(example);
            const convertedExample = this.generateOrValidateExample({
                example: resolvedExample
            });
            userSpecifiedExamples[`${this.id}_example_${index}`] = convertedExample;
        }

        return userSpecifiedExamples;
    }

    private generateOrValidateExample({
        example,
        ignoreErrors
    }: {
        example: unknown;
        ignoreErrors?: boolean;
    }): unknown {
        const exampleConverter = new ExampleConverter({
            breadcrumbs: this.breadcrumbs,
            context: this.context,
            schema: this.schema,
            example
        });
        const { validExample: convertedExample, errors } = exampleConverter.convert();
        if (!ignoreErrors) {
            errors.forEach((error) => {
                this.context.errorCollector.collect({
                    message: error.message,
                    path: error.path
                });
            });
        }
        return convertedExample;
    }
}
