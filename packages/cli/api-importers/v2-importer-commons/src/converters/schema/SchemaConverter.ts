import { OpenAPIV3_1 } from "openapi-types";

import * as FernIr from "@fern-api/ir-sdk";

import { AbstractConverter, AbstractConverterContext, ErrorCollector, Extensions } from "../..";
import { createTypeReferenceFromFernType } from "../../utils/CreateTypeReferenceFromFernType";
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

    public async convert({
        errorCollector
    }: {
        errorCollector: ErrorCollector;
    }): Promise<SchemaConverter.Output | undefined> {
        const maybeFernTypeDeclaration = await this.tryConvertFernTypeDeclaration({ errorCollector });
        if (maybeFernTypeDeclaration != null) {
            return {
                typeDeclaration: maybeFernTypeDeclaration,
                inlinedTypes: {}
            };
        }
        return this.convertSchema({ errorCollector });
    }

    private async convertSchema({
        errorCollector
    }: {
        errorCollector: ErrorCollector;
    }): Promise<SchemaConverter.Output | undefined> {
        if (this.schema.enum?.length) {
            const fernEnumConverter = new Extensions.FernEnumExtension({
                breadcrumbs: this.breadcrumbs,
                schema: this.schema
            });
            const maybeFernEnum = fernEnumConverter.convert({ errorCollector });

            const enumConverter = new EnumSchemaConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: this.schema,
                maybeFernEnum
            });
            const enumType = enumConverter.convert({ errorCollector });
            if (enumType != null) {
                return {
                    typeDeclaration: await this.createTypeDeclaration({
                        shape: enumType.type,
                        errorCollector
                    }),
                    inlinedTypes: {}
                };
            }
        }

        const primitiveConverter = new PrimitiveSchemaConverter({ context: this.context, schema: this.schema });
        const primitiveType = primitiveConverter.convert({ errorCollector });
        if (primitiveType != null) {
            return {
                typeDeclaration: await this.createTypeDeclaration({
                    shape: FernIr.Type.alias({
                        aliasOf: primitiveType,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        resolvedType: primitiveType as any
                    }),
                    errorCollector
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
            const arrayType = await arrayConverter.convert({ errorCollector });
            if (arrayType != null) {
                return {
                    typeDeclaration: await this.createTypeDeclaration({
                        shape: FernIr.Type.alias({
                            aliasOf: arrayType.typeReference,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            resolvedType: arrayType.typeReference as any
                        }),
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
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: this.schema,
                inlinedTypes: {}
            });
            const oneOfType = await oneOfConverter.convert({ errorCollector });
            if (oneOfType != null) {
                return {
                    typeDeclaration: await this.createTypeDeclaration({
                        shape: oneOfType.type,
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
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: this.schema.additionalProperties
            });
            const additionalPropertiesType = await additionalPropertiesConverter.convert({ errorCollector });
            if (additionalPropertiesType != null) {
                return {
                    typeDeclaration: await this.createTypeDeclaration({
                        shape: additionalPropertiesType.type,
                        errorCollector
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
            const objectType = await objectConverter.convert({ errorCollector });
            if (objectType != null) {
                return {
                    typeDeclaration: await this.createTypeDeclaration({
                        shape: objectType.type,
                        errorCollector
                    }),
                    inlinedTypes: objectType.inlinedTypes
                };
            }
        }

        return undefined;
    }

    private async tryConvertFernTypeDeclaration({
        errorCollector
    }: {
        errorCollector: ErrorCollector;
    }): Promise<FernIr.TypeDeclaration | undefined> {
        const fernTypeConverter = new Extensions.FernTypeExtension({
            breadcrumbs: this.breadcrumbs,
            schema: this.schema
        });
        const fernType = fernTypeConverter.convert({ errorCollector });
        if (fernType != null) {
            const typeDeclaration = await this.createTypeDeclarationFromFernType({
                fernType,
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
        errorCollector
    }: {
        shape: FernIr.Type;
        errorCollector: ErrorCollector;
    }): Promise<FernIr.TypeDeclaration> {
        return {
            name: this.convertDeclaredTypeName(),
            shape,
            autogeneratedExamples: [],
            userProvidedExamples: [],
            encoding: undefined,
            availability: await this.context.getAvailability({
                node: this.schema,
                breadcrumbs: this.breadcrumbs,
                errorCollector
            }),
            docs: this.schema.description,
            referencedTypes: new Set(),
            source: undefined,
            inline: this.inlined,
            v2Examples: {
                userSpecifiedExamples: await this.convertSchemaExamples({ errorCollector }),
                autogeneratedExamples: {}
            }
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
        fernType,
        errorCollector
    }: {
        fernType: string;
        errorCollector: ErrorCollector;
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
        errorCollector
    }: {
        errorCollector: ErrorCollector;
    }): Promise<Record<string, unknown>> {
        // OAS 3.1 allows schema & property-level examples as an array of example values. See:
        // https://stackoverflow.com/questions/73714802/multiple-examples-for-object-properties-swagger
        const schemaExample = this.schema.example;
        const schemaExamples = this.schema.examples;
        let examples: unknown[] = [];
        if (schemaExample != null) {
            examples = [schemaExample];
        }
        if (schemaExamples != null) {
            if (Array.isArray(schemaExamples)) {
                examples = [...examples, ...schemaExamples];
            } else {
                errorCollector.collect({
                    message: "Received non-array schema examples",
                    path: this.breadcrumbs
                });
            }
        }
        if (examples.length === 0) {
            return {};
        }
        const userSpecifiedExamples: Record<string, unknown> = {};
        for (const [index, example] of examples.entries()) {
            const schemaExampleName = `${this.id}_example_${index}`;
            if (this.context.isReferenceObject(example)) {
                const resolved = await this.context.resolveReference(example);
                if (resolved.resolved) {
                    userSpecifiedExamples[schemaExampleName] = resolved.value;
                }
            } else {
                userSpecifiedExamples[schemaExampleName] = example;
            }
        }
        return userSpecifiedExamples;
    }
}
