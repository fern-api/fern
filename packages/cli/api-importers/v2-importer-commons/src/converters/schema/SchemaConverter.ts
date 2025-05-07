import { OpenAPIV3_1 } from "openapi-types";

import * as FernIr from "@fern-api/ir-sdk";

import { AbstractConverter, AbstractConverterContext, Extensions } from "../..";
import { createTypeReferenceFromFernType } from "../../utils/CreateTypeReferenceFromFernType";
import { ExampleConverter } from "../ExampleConverter";
import { ArraySchemaConverter } from "./ArraySchemaConverter";
import { EnumSchemaConverter } from "./EnumSchemaConverter";
import { MapSchemaConverter } from "./MapSchemaConverter";
import { ObjectSchemaConverter } from "./ObjectSchemaConverter";
import { OneOfSchemaConverter } from "./OneOfSchemaConverter";
import { PrimitiveSchemaConverter } from "./PrimitiveSchemaConverter";

export declare namespace SchemaConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        id: string;
        schema: OpenAPIV3_1.SchemaObject;
        inlined?: boolean;
    }

    export interface Output {
        typeDeclaration: FernIr.TypeDeclaration;
        inlinedTypes: Record<FernIr.TypeId, FernIr.TypeDeclaration>;
    }
}

export class SchemaConverter extends AbstractConverter<AbstractConverterContext<object>, SchemaConverter.Output> {
    private readonly schema: OpenAPIV3_1.SchemaObject;
    private readonly id: string;
    private readonly inlined: boolean;

    constructor({ context, breadcrumbs, schema, id, inlined = false }: SchemaConverter.Args) {
        super({ context, breadcrumbs });
        this.schema = schema;
        this.id = id;
        this.inlined = inlined;
    }

    public async convert(): Promise<SchemaConverter.Output | undefined> {
        const maybeFernTypeDeclaration = await this.tryConvertFernTypeDeclaration();
        if (maybeFernTypeDeclaration != null) {
            return {
                typeDeclaration: maybeFernTypeDeclaration,
                inlinedTypes: {}
            };
        }
        return this.convertSchema();
    }

    private async convertSchema(): Promise<SchemaConverter.Output | undefined> {
        if (this.schema.enum?.length) {
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
                    typeDeclaration: await this.createTypeDeclaration({
                        shape: enumType.type
                    }),
                    inlinedTypes: {}
                };
            }
        }

        // Check if there is a single allOf that is not an object
        if (this.schema.allOf?.length === 1 && Object.keys(this.schema).filter(key => key !== 'allOf').length === 0 && this.schema.allOf[0] != null) {
            let allOfSchema: OpenAPIV3_1.SchemaObject | undefined = undefined;
            
            if (this.context.isReferenceObject(this.schema.allOf[0])) {
                const resolvedAllOfSchemaResponse = await this.context.resolveReference<OpenAPIV3_1.SchemaObject>(this.schema.allOf[0]);
                if (resolvedAllOfSchemaResponse.resolved) {
                    allOfSchema = resolvedAllOfSchemaResponse.value;
                }
            } else {
                allOfSchema = this.schema.allOf[0];
            }

            if (allOfSchema != null) {
                const allOfConverter = new SchemaConverter({
                    context: this.context,
                    breadcrumbs: [...this.breadcrumbs, "allOf", "0"],
                    schema: allOfSchema,
                    id: this.id,
                    inlined: true
                });
                
                const allOfResult = await allOfConverter.convert();
                
                if (allOfResult?.typeDeclaration?.shape.type !== "object") {
                    return allOfResult;
                }
            }
        }

        const primitiveConverter = new PrimitiveSchemaConverter({ context: this.context, schema: this.schema });
        const primitiveType = primitiveConverter.convert();
        if (primitiveType != null) {
            return {
                typeDeclaration: await this.createTypeDeclaration({
                    shape: FernIr.Type.alias({
                        aliasOf: primitiveType,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        resolvedType: primitiveType as any
                    })
                }),
                inlinedTypes: {}
            };
        }

        if (this.schema.type === "array") {
            const arrayConverter = new ArraySchemaConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: this.schema
            });
            const arrayType = await arrayConverter.convert();
            if (arrayType != null) {
                return {
                    typeDeclaration: await this.createTypeDeclaration({
                        shape: FernIr.Type.alias({
                            aliasOf: arrayType.typeReference,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            resolvedType: arrayType.typeReference as any
                        })
                    }),
                    inlinedTypes: arrayType.inlinedTypes
                };
            }
        }

        if (Array.isArray(this.schema.type) && this.schema.type.length > 0) {
            if (this.schema.type.length === 1) {
                this.schema.type = this.schema.type[0];
            } else {
                const schemaTypeArray = this.schema.type;
                this.schema.type = undefined;
                this.schema.oneOf = schemaTypeArray.map((type) => ({
                    type: type as OpenAPIV3_1.NonArraySchemaObjectType
                }));
            }
            return this.convertSchema();
        }

        if (this.schema.oneOf != null || this.schema.anyOf != null) {
            const oneOfConverter = new OneOfSchemaConverter({
                id: this.id,
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: this.schema,
                inlinedTypes: {}
            });
            const oneOfType = await oneOfConverter.convert();
            if (oneOfType != null) {
                return {
                    typeDeclaration: await this.createTypeDeclaration({
                        shape: oneOfType.type
                    }),
                    inlinedTypes: oneOfType.inlinedTypes
                };
            }
        }

        if (
            typeof this.schema.additionalProperties === "object" &&
            this.schema.additionalProperties != null &&
            !this.schema.properties &&
            !this.schema.allOf
        ) {
            const additionalPropertiesConverter = new MapSchemaConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: this.schema.additionalProperties
            });
            const additionalPropertiesType = await additionalPropertiesConverter.convert();
            if (additionalPropertiesType != null) {
                return {
                    typeDeclaration: await this.createTypeDeclaration({
                        shape: additionalPropertiesType.type
                    }),
                    inlinedTypes: additionalPropertiesType.inlinedTypes
                };
            }
        }

        if (this.schema.type === "object" || this.schema.properties != null || this.schema.allOf != null) {
            const objectConverter = new ObjectSchemaConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: this.schema
            });
            const objectType = await objectConverter.convert();
            if (objectType != null) {
                return {
                    typeDeclaration: await this.createTypeDeclaration({
                        shape: objectType.type
                    }),
                    inlinedTypes: objectType.inlinedTypes
                };
            }
        }

        this.context.errorCollector.collect({
            message: `Failed to convert schema object: ${JSON.stringify(this.schema, null, 2)}`,
            path: this.breadcrumbs
        });
        return undefined;
    }

    private async tryConvertFernTypeDeclaration(): Promise<FernIr.TypeDeclaration | undefined> {
        const fernTypeConverter = new Extensions.FernTypeExtension({
            breadcrumbs: this.breadcrumbs,
            schema: this.schema,
            context: this.context
        });
        const fernType = fernTypeConverter.convert();
        if (fernType != null) {
            const typeDeclaration = await this.createTypeDeclarationFromFernType({
                fernType
            });
            if (typeDeclaration != null) {
                return typeDeclaration;
            }
        }
        return undefined;
    }

    public async createTypeDeclaration({ shape }: { shape: FernIr.Type }): Promise<FernIr.TypeDeclaration> {
        const v2Examples = await this.convertSchemaExamples();
        return {
            name: this.convertDeclaredTypeName(),
            shape,
            autogeneratedExamples: [],
            userProvidedExamples: [],
            encoding: undefined,
            availability: await this.context.getAvailability({
                node: this.schema,
                breadcrumbs: this.breadcrumbs
            }),
            docs: this.schema.description,
            referencedTypes: new Set(),
            source: undefined,
            inline: this.inlined,
            v2Examples
        };
    }

    public convertDeclaredTypeName(): FernIr.DeclaredTypeName {
        return {
            typeId: this.id,
            fernFilepath: this.context.createFernFilepath(),
            name: this.context.casingsGenerator.generateName(this.id)
        };
    }

    private async createTypeDeclarationFromFernType({
        fernType
    }: {
        fernType: string;
    }): Promise<FernIr.TypeDeclaration | undefined> {
        const typeReference = createTypeReferenceFromFernType(fernType);
        if (typeReference == null) {
            return undefined;
        }

        return {
            name: this.convertDeclaredTypeName(),
            shape: FernIr.Type.alias({
                aliasOf: typeReference,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                resolvedType: typeReference as any
            }),
            autogeneratedExamples: [],
            userProvidedExamples: [],
            encoding: undefined,
            availability: await this.context.getAvailability({
                node: this.schema,
                breadcrumbs: this.breadcrumbs
            }),
            docs: this.schema.description,
            referencedTypes: new Set<string>(),
            source: undefined,
            inline: this.inlined,
            v2Examples: {
                userSpecifiedExamples: {},
                autogeneratedExamples: {}
            }
        };
    }

    private async convertSchemaExamples(): Promise<FernIr.V2SchemaExamples> {
        const v2Examples = {
            userSpecifiedExamples: {},
            autogeneratedExamples: {}
        };

        const examples = this.context.getExamplesFromSchema({
            schema: this.schema,
            breadcrumbs: this.breadcrumbs
        });

        if (examples.length === 0) {
            const convertedExample = await this.generateOrValidateExample({
                example: undefined,
                ignoreErrors: true
            });
            v2Examples.autogeneratedExamples = {
                [`${this.id}_example_autogenerated`]: convertedExample
            };
            return v2Examples;
        }

        v2Examples.userSpecifiedExamples = await this.convertUserSpecifiedExamples(examples);
        return v2Examples;
    }

    private async convertUserSpecifiedExamples(examples: unknown[]): Promise<Record<string, unknown>> {
        const userSpecifiedExamples: Record<string, unknown> = {};

        for (const [index, example] of examples.entries()) {
            const resolvedExample = await this.context.resolveExample(example);
            const convertedExample = await this.generateOrValidateExample({
                example: resolvedExample
            });
            userSpecifiedExamples[`${this.id}_example_${index}`] = convertedExample;
        }

        return userSpecifiedExamples;
    }

    private async generateOrValidateExample({
        example,
        ignoreErrors
    }: {
        example: unknown;
        ignoreErrors?: boolean;
    }): Promise<unknown> {
        const exampleConverter = new ExampleConverter({
            breadcrumbs: this.breadcrumbs,
            context: this.context,
            schema: this.schema,
            example
        });
        const { validExample: convertedExample, errors } = await exampleConverter.convert();
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
