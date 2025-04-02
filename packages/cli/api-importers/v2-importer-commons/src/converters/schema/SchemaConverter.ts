import { OpenAPIV3_1 } from "openapi-types";

import { recursivelyVisitRawTypeReference } from "@fern-api/fern-definition-schema";
import * as FernIr from "@fern-api/ir-sdk";

import { AbstractConverter, AbstractConverterContext, ErrorCollector, Extensions } from "../..";
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
            inline: this.inlined
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
        const typeReference = this.createTypeReferenceFromFernType(fernType);
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
            inline: this.inlined
        };
    }

    private createTypeReferenceFromFernType(fernType: string): FernIr.TypeReference | undefined {
        return recursivelyVisitRawTypeReference<FernIr.TypeReference | undefined>({
            type: fernType,
            _default: undefined,
            validation: undefined,
            visitor: {
                primitive: (primitive) => {
                    switch (primitive.v1) {
                        case "BASE_64":
                            return FernIr.TypeReference.primitive({
                                v1: "BASE_64",
                                v2: FernIr.PrimitiveTypeV2.base64({})
                            });
                        case "BOOLEAN":
                            return FernIr.TypeReference.primitive({
                                v1: "BOOLEAN",
                                v2: FernIr.PrimitiveTypeV2.boolean({
                                    default: undefined
                                })
                            });
                        case "DATE":
                            return FernIr.TypeReference.primitive({
                                v1: "DATE",
                                v2: FernIr.PrimitiveTypeV2.date({})
                            });
                        case "DATE_TIME":
                            return FernIr.TypeReference.primitive({
                                v1: "DATE_TIME",
                                v2: FernIr.PrimitiveTypeV2.dateTime({})
                            });
                        case "FLOAT":
                            return FernIr.TypeReference.primitive({
                                v1: "FLOAT",
                                v2: FernIr.PrimitiveTypeV2.float({})
                            });
                        case "DOUBLE":
                            return FernIr.TypeReference.primitive({
                                v1: "DOUBLE",
                                v2: FernIr.PrimitiveTypeV2.double({
                                    default: undefined,
                                    validation: undefined
                                })
                            });
                        case "UINT":
                            return FernIr.TypeReference.primitive({
                                v1: "UINT",
                                v2: FernIr.PrimitiveTypeV2.uint({})
                            });
                        case "UINT_64":
                            return FernIr.TypeReference.primitive({
                                v1: "UINT_64",
                                v2: FernIr.PrimitiveTypeV2.uint64({})
                            });
                        case "INTEGER":
                            return FernIr.TypeReference.primitive({
                                v1: "INTEGER",
                                v2: FernIr.PrimitiveTypeV2.integer({
                                    default: undefined,
                                    validation: undefined
                                })
                            });
                        case "LONG":
                            return FernIr.TypeReference.primitive({
                                v1: "LONG",
                                v2: FernIr.PrimitiveTypeV2.long({
                                    default: undefined
                                })
                            });
                        case "STRING":
                            return FernIr.TypeReference.primitive({
                                v1: "STRING",
                                v2: FernIr.PrimitiveTypeV2.string({
                                    default: undefined,
                                    validation: undefined
                                })
                            });
                        case "UUID":
                            return FernIr.TypeReference.primitive({
                                v1: "UUID",
                                v2: FernIr.PrimitiveTypeV2.uuid({})
                            });
                        case "BIG_INTEGER":
                            return FernIr.TypeReference.primitive({
                                v1: "BIG_INTEGER",
                                v2: FernIr.PrimitiveTypeV2.bigInteger({
                                    default: undefined
                                })
                            });
                        default:
                            return undefined;
                    }
                },
                unknown: () => {
                    return FernIr.TypeReference.unknown();
                },
                map: ({ keyType, valueType }) => {
                    if (keyType == null || valueType == null) {
                        return undefined;
                    }
                    return FernIr.TypeReference.container(
                        FernIr.ContainerType.map({
                            keyType,
                            valueType
                        })
                    );
                },
                list: (itemType) => {
                    if (itemType == null) {
                        return undefined;
                    }
                    return FernIr.TypeReference.container(FernIr.ContainerType.list(itemType));
                },
                optional: (itemType) => {
                    if (itemType == null) {
                        return undefined;
                    }
                    return FernIr.TypeReference.container(FernIr.ContainerType.optional(itemType));
                },
                nullable: (itemType) => {
                    if (itemType == null) {
                        return undefined;
                    }
                    return FernIr.TypeReference.container(FernIr.ContainerType.nullable(itemType));
                },
                set: (itemType) => {
                    if (itemType == null) {
                        return undefined;
                    }
                    return FernIr.TypeReference.container(FernIr.ContainerType.set(itemType));
                },
                literal: (literal) => {
                    return FernIr.TypeReference.container(
                        FernIr.ContainerType.literal(
                            literal._visit<FernIr.Literal>({
                                string: (value) => FernIr.Literal.string(value),
                                boolean: (value) => FernIr.Literal.boolean(value),
                                _other: () => {
                                    throw new Error("Unexpected literal type");
                                }
                            })
                        )
                    );
                },
                named: () => {
                    return undefined;
                }
            }
        });
    }
}
