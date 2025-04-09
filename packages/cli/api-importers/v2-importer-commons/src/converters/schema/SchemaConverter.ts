import { OpenAPIV3_1 } from "openapi-types";

import * as FernIr from "@fern-api/ir-sdk";

import { AbstractConverter, AbstractConverterContext, ErrorCollector, Extensions } from "../..";
import { createTypeReferenceFromFernType } from "../../utils/CreateTypeReferenceFromFernType";
import { ArraySchemaConverter } from "./ArraySchemaConverter";
import { EnumSchemaConverter } from "./EnumSchemaConverter";
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
    private readonly SUPPORTED_UNION_PRIMITIVE_TYPES = ["boolean", "number", "string", "integer"];

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
                return {
                    typeDeclaration,
                    inlinedTypes: {}
                };
            }
        }

        if (Array.isArray(this.schema.type)) {
            return this.convertPrimitiveTypeArraySchema({ context, errorCollector });
        }
        return this.convertSchema({ context, errorCollector });
    }

    private async convertPrimitiveTypeArraySchema({
        context,
        errorCollector
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<SchemaConverter.Output | undefined> {
        if (this.schema.type == null) {
            errorCollector.collect({
                message: `Received null schema type: ${JSON.stringify(this.schema)}`,
                path: this.breadcrumbs
            });
            return undefined;
        }
        if (!Array.isArray(this.schema.type) || this.schema.type.length === 0) {
            errorCollector.collect({
                message: `Received invalid array schema: ${JSON.stringify(this.schema.type)}`,
                path: this.breadcrumbs
            });
            return undefined;
        }
        const updatedSchema: OpenAPIV3_1.SchemaObject = this.schema;
        const wrapAsNullable = this.schema.type.includes("null");
        updatedSchema.type = this.schema.type.filter((type) => type !== "null");
        if (updatedSchema.type.length === 0) {
            errorCollector.collect({
                message: `Received schema ${JSON.stringify(this.schema)} with unsupported primitive types: ${JSON.stringify(this.schema.type)}`,
                path: this.breadcrumbs
            });
            return undefined;
        }

        if (updatedSchema.type.length === 1) {
            updatedSchema.type = updatedSchema.type[0];
            if (updatedSchema.type == null) {
                return undefined;
            }
            if (this.SUPPORTED_UNION_PRIMITIVE_TYPES.includes(updatedSchema.type)) {
                const primitiveConverter = new PrimitiveSchemaConverter({ schema: updatedSchema });
                const primitiveType = primitiveConverter.convert({ context, errorCollector });
                if (primitiveType != null) {
                    const maybeWrappedType = wrapAsNullable
                        ? this.wrapTypeReferenceAsNullable(primitiveType)
                        : primitiveType;
                    return {
                        typeDeclaration: await this.createTypeDeclaration({
                            shape: FernIr.Type.alias({
                                aliasOf: maybeWrappedType,
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                resolvedType: maybeWrappedType as any
                            }),
                            context,
                            errorCollector
                        }),
                        inlinedTypes: {}
                    };
                }
            } else if (updatedSchema.type === "object") {
                const objectConverter = new ObjectSchemaConverter({
                    breadcrumbs: this.breadcrumbs,
                    schema: updatedSchema,
                    inlinedTypes: {}
                });
                const objectType = await objectConverter.convert({ context, errorCollector });
                if (objectType != null) {
                    const typeDeclaration = await this.createTypeDeclaration({
                        shape: objectType.object,
                        context,
                        errorCollector
                    });
                    return {
                        typeDeclaration: {
                            ...typeDeclaration,
                            shape: wrapAsNullable
                                ? this.wrapObjectTypeAsNullable(context, typeDeclaration.shape)
                                : typeDeclaration.shape
                        },
                        inlinedTypes: {
                            ...objectType.inlinedTypes,
                            [this.id]: typeDeclaration
                        }
                    };
                }
            } else if (updatedSchema.type === "array") {
                const arrayConverter = new ArraySchemaConverter({
                    breadcrumbs: this.breadcrumbs,
                    schema: updatedSchema
                });
                const arrayType = await arrayConverter.convert({ context, errorCollector });
                if (arrayType != null) {
                    return {
                        typeDeclaration: await this.createTypeDeclaration({
                            shape: FernIr.Type.alias({
                                aliasOf: wrapAsNullable
                                    ? this.wrapTypeReferenceAsNullable(arrayType.typeReference)
                                    : arrayType.typeReference,
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                resolvedType: arrayType.typeReference as any
                            }),
                            context,
                            errorCollector
                        }),
                        inlinedTypes: arrayType.inlinedTypes ?? {}
                    };
                }
            }
        } else {
            updatedSchema.type = updatedSchema.type.filter((type) =>
                this.SUPPORTED_UNION_PRIMITIVE_TYPES.includes(type)
            );
            updatedSchema.oneOf = updatedSchema.type.map((type) => ({
                // Array schema types must be NonArraySchemaObjectType values.
                type: type as OpenAPIV3_1.NonArraySchemaObjectType
            }));
            const oneOfConverter = new OneOfSchemaConverter({
                breadcrumbs: this.breadcrumbs,
                schema: updatedSchema,
                inlinedTypes: {}
            });
            const oneOfType = await oneOfConverter.convert({ context, errorCollector });
            if (oneOfType != null && oneOfType.union.type === "undiscriminatedUnion") {
                let wrappedUnion = oneOfType.union;
                if (wrapAsNullable) {
                    wrappedUnion = FernIr.Type.undiscriminatedUnion({
                        members: wrappedUnion.members.map((member) => ({
                            ...member,
                            type: this.wrapTypeReferenceAsNullable(member.type)
                        }))
                    });
                }
                return {
                    typeDeclaration: await this.createTypeDeclaration({
                        shape: wrappedUnion,
                        context,
                        errorCollector
                    }),
                    inlinedTypes: oneOfType.inlinedTypes ?? {}
                };
            }
        }
        return undefined;
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
                        shape: enumType.enum,
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
                    inlinedTypes: arrayType.inlinedTypes ?? {}
                };
            }
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
                        shape: oneOfType.union,
                        context,
                        errorCollector
                    }),
                    inlinedTypes: oneOfType.inlinedTypes ?? {}
                };
            }
        }

        if (this.schema.type === "object" || this.schema.properties != null || this.schema.allOf != null) {
            const objectConverter = new ObjectSchemaConverter({
                breadcrumbs: this.breadcrumbs,
                schema: this.schema,
                inlinedTypes: {}
            });
            const objectType = await objectConverter.convert({ context, errorCollector });
            if (objectType != null) {
                return {
                    typeDeclaration: await this.createTypeDeclaration({
                        shape: objectType.object,
                        context,
                        errorCollector
                    }),
                    inlinedTypes: objectType.inlinedTypes ?? {}
                };
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
            v2Examples: undefined
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
            v2Examples: undefined
        };
    }

    private wrapTypeReferenceAsNullable(typeReference: FernIr.TypeReference): FernIr.TypeReference {
        return FernIr.TypeReference.container(FernIr.ContainerType.nullable(typeReference));
    }

    private wrapObjectTypeAsNullable(context: AbstractConverterContext<object>, object: FernIr.Type): FernIr.Type {
        const objectTypeReference = context.createNamedTypeReference(this.id);
        return FernIr.Type.alias({
            aliasOf: this.wrapTypeReferenceAsNullable(objectTypeReference),
            resolvedType: objectTypeReference as any
        });
    }
}
