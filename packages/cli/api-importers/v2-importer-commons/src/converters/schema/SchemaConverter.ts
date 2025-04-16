import { OpenAPIV3_1 } from "openapi-types";

import * as FernIr from "@fern-api/ir-sdk";

import { AbstractConverter, AbstractConverterContext, ErrorCollector, Extensions } from "../..";
import { createTypeReferenceFromFernType } from "../../utils/CreateTypeReferenceFromFernType";
import { ExampleConverter } from "../ExampleConverter";
import { ArraySchemaConverter } from "./ArraySchemaConverter";
import { EnumSchemaConverter } from "./EnumSchemaConverter";
import { MapSchemaConverter } from "./MapSchemaConverter";
import { ObjectSchemaConverter } from "./ObjectSchemaConverter";
import { OneOfSchemaConverter } from "./OneOfSchemaConverter";
import { PrimitiveSchemaConverter } from "./PrimitiveSchemaConverter";

export declare namespace SchemaConverter {
    export interface Args extends AbstractConverter.Args {
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

    constructor({ breadcrumbs, schema, id, inlined = false }: SchemaConverter.Args) {
        super({ breadcrumbs });
        this.schema = schema;
        this.id = id;
        this.inlined = inlined;
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<SchemaConverter.Output | undefined> {
        const maybeFernTypeDeclaration = await this.tryConvertFernTypeDeclaration({ context, errorCollector });
        if (maybeFernTypeDeclaration != null) {
            return {
                typeDeclaration: maybeFernTypeDeclaration,
                inlinedTypes: {}
            };
        }
        return this.convertSchema({ context, errorCollector });
    }

    private async convertSchema({
        context,
        errorCollector
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<SchemaConverter.Output | undefined> {
        if (this.schema.enum?.length) {
            const fernEnumConverter = new Extensions.FernEnumExtension({
                breadcrumbs: this.breadcrumbs,
                schema: this.schema
            });
            const maybeFernEnum = fernEnumConverter.convert({ context, errorCollector });

            const enumConverter = new EnumSchemaConverter({
                breadcrumbs: this.breadcrumbs,
                schema: this.schema,
                maybeFernEnum
            });
            const enumType = enumConverter.convert({ context, errorCollector });
            if (enumType != null) {
                return {
                    typeDeclaration: await this.createTypeDeclaration({
                        shape: enumType.type,
                        context,
                        errorCollector
                    }),
                    inlinedTypes: {}
                };
            }
        }

        const primitiveConverter = new PrimitiveSchemaConverter({ schema: this.schema });
        const primitiveType = primitiveConverter.convert({ context, errorCollector });
        if (primitiveType != null) {
            return {
                typeDeclaration: await this.createTypeDeclaration({
                    shape: FernIr.Type.alias({
                        aliasOf: primitiveType,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        resolvedType: primitiveType as any
                    }),
                    context,
                    errorCollector
                }),
                inlinedTypes: {}
            };
        }

        if (this.schema.type === "array") {
            const arrayConverter = new ArraySchemaConverter({
                breadcrumbs: this.breadcrumbs,
                schema: this.schema
            });
            const arrayType = await arrayConverter.convert({ context, errorCollector });
            if (arrayType != null) {
                return {
                    typeDeclaration: await this.createTypeDeclaration({
                        shape: FernIr.Type.alias({
                            aliasOf: arrayType.typeReference,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            resolvedType: arrayType.typeReference as any
                        }),
                        context,
                        errorCollector
                    }),
                    inlinedTypes: arrayType.inlinedTypes
                };
            }
        }

        if (Array.isArray(this.schema.type)) {
            const schemaTypeArray = this.schema.type;
            this.schema.type = undefined;
            this.schema.oneOf = schemaTypeArray.map((type) => ({ type: type as OpenAPIV3_1.NonArraySchemaObjectType }));
        }

        if (this.schema.oneOf != null || this.schema.anyOf != null) {
            const oneOfConverter = new OneOfSchemaConverter({
                breadcrumbs: this.breadcrumbs,
                schema: this.schema,
                inlinedTypes: {}
            });
            const oneOfType = await oneOfConverter.convert({ context, errorCollector });
            if (oneOfType != null) {
                return {
                    typeDeclaration: await this.createTypeDeclaration({
                        shape: oneOfType.type,
                        context,
                        errorCollector
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
                breadcrumbs: this.breadcrumbs,
                schema: this.schema.additionalProperties
            });
            const additionalPropertiesType = await additionalPropertiesConverter.convert({ context, errorCollector });
            if (additionalPropertiesType != null) {
                return {
                    typeDeclaration: await this.createTypeDeclaration({
                        shape: additionalPropertiesType.type,
                        context,
                        errorCollector
                    }),
                    inlinedTypes: additionalPropertiesType.inlinedTypes
                };
            }
        }

        if (this.schema.type === "object" || this.schema.properties != null || this.schema.allOf != null) {
            const objectConverter = new ObjectSchemaConverter({
                breadcrumbs: this.breadcrumbs,
                schema: this.schema
            });
            const objectType = await objectConverter.convert({ context, errorCollector });
            if (objectType != null) {
                return {
                    typeDeclaration: await this.createTypeDeclaration({
                        shape: objectType.type,
                        context,
                        errorCollector
                    }),
                    inlinedTypes: objectType.inlinedTypes
                };
            }
        }

        return undefined;
    }

    private async tryConvertFernTypeDeclaration({
        context,
        errorCollector
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<FernIr.TypeDeclaration | undefined> {
        const fernTypeConverter = new Extensions.FernTypeExtension({
            breadcrumbs: this.breadcrumbs,
            schema: this.schema
        });
        const fernType = fernTypeConverter.convert({ context, errorCollector });
        if (fernType != null) {
            const typeDeclaration = await this.createTypeDeclarationFromFernType({
                fernType,
                context,
                errorCollector
            });
            if (typeDeclaration != null) {
                return typeDeclaration;
            }
        }
        return undefined;
    }

    public async createTypeDeclaration({
        shape,
        context,
        errorCollector
    }: {
        shape: FernIr.Type;
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<FernIr.TypeDeclaration> {
        const v2Examples = await this.convertSchemaExamples({ context, errorCollector });
        return {
            name: this.convertDeclaredTypeName({ context }),
            shape,
            autogeneratedExamples: [],
            userProvidedExamples: [],
            encoding: undefined,
            availability: await context.getAvailability({
                node: this.schema,
                breadcrumbs: this.breadcrumbs,
                errorCollector
            }),
            docs: this.schema.description,
            referencedTypes: new Set(),
            source: undefined,
            inline: this.inlined,
            v2Examples
        };
    }

    public convertDeclaredTypeName({
        context
    }: {
        context: AbstractConverterContext<object>;
    }): FernIr.DeclaredTypeName {
        return {
            typeId: this.id,
            fernFilepath: context.createFernFilepath(),
            name: context.casingsGenerator.generateName(this.id)
        };
    }

    private async createTypeDeclarationFromFernType({
        fernType,
        context,
        errorCollector
    }: {
        fernType: string;
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<FernIr.TypeDeclaration | undefined> {
        const typeReference = createTypeReferenceFromFernType(fernType);
        if (typeReference == null) {
            return undefined;
        }

        return {
            name: this.convertDeclaredTypeName({ context }),
            shape: FernIr.Type.alias({
                aliasOf: typeReference,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                resolvedType: typeReference as any
            }),
            autogeneratedExamples: [],
            userProvidedExamples: [],
            encoding: undefined,
            availability: await context.getAvailability({
                node: this.schema,
                breadcrumbs: this.breadcrumbs,
                errorCollector
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

    private async convertSchemaExamples({
        context,
        errorCollector
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<FernIr.V2SchemaExamples> {
        const v2Examples = {
            userSpecifiedExamples: {},
            autogeneratedExamples: {}
        };

        const examples = this.getExamplesFromSchema(errorCollector);

        if (examples.length === 0) {
            const convertedExample = await this.generateOrValidateExample({
                shouldCollectErrors: false,
                example: undefined,
                context,
                errorCollector
            });
            v2Examples.autogeneratedExamples = {
                [`${this.id}_example_autogenerated`]: convertedExample
            };
            return v2Examples;
        }

        v2Examples.userSpecifiedExamples = await this.convertUserSpecifiedExamples(examples, context, errorCollector);
        return v2Examples;
    }

    private getExamplesFromSchema(errorCollector: ErrorCollector): unknown[] {
        const examples: unknown[] = this.schema.example != null ? [this.schema.example] : [];

        if (this.schema.examples != null) {
            if (Array.isArray(this.schema.examples)) {
                examples.push(...this.schema.examples);
            } else {
                errorCollector.collect({
                    message: "Received non-array schema examples",
                    path: this.breadcrumbs
                });
            }
        }
        return examples;
    }

    private async convertUserSpecifiedExamples(
        examples: unknown[],
        context: AbstractConverterContext<object>,
        errorCollector: ErrorCollector
    ): Promise<Record<string, unknown>> {
        const userSpecifiedExamples: Record<string, unknown> = {};

        for (const [index, example] of examples.entries()) {
            const resolvedExample = await context.resolveExample(example);
            const convertedExample = await this.generateOrValidateExample({
                shouldCollectErrors: true,
                example: resolvedExample,
                context,
                errorCollector
            });
            userSpecifiedExamples[`${this.id}_example_${index}`] = convertedExample;
        }

        return userSpecifiedExamples;
    }

    private async generateOrValidateExample({
        shouldCollectErrors,
        example,
        context,
        errorCollector
    }: {
        shouldCollectErrors: boolean;
        example: unknown;
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<unknown> {
        const exampleConverter = new ExampleConverter({
            breadcrumbs: this.breadcrumbs,
            schema: this.schema,
            example
        });
        const { validExample: convertedExample, errors } = await exampleConverter.convert({ context, errorCollector });
        if (shouldCollectErrors) {
            errors.forEach((error) => {
                errorCollector.collect({
                    message: error.message,
                    path: error.path
                });
            });
        }
        return convertedExample;
    }
}
