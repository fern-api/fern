import { OpenAPIV3_1 } from "openapi-types";

import { DeclaredTypeName, Type, TypeDeclaration, TypeId } from "@fern-api/ir-sdk";

import { AbstractConverter } from "../../AbstractConverter";
import { ErrorCollector } from "../../ErrorCollector";
import { FernEnumExtension } from "../../extensions/x-fern-enum";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";
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
        typeDeclaration: TypeDeclaration;
        inlinedTypes: Record<TypeId, TypeDeclaration>;
    }
}

export class SchemaConverter extends AbstractConverter<OpenAPIConverterContext3_1, SchemaConverter.Output> {
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
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): Promise<SchemaConverter.Output | undefined> {
        if (this.schema.enum?.length) {
            const fernEnumConverter = new FernEnumExtension({
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
                    shape: Type.alias({
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
                        shape: Type.alias({
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

        if (this.schema.oneOf != null) {
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
        shape: Type;
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): Promise<TypeDeclaration> {
        return {
            name: this.convertDeclaredTypeName({ context }),
            shape,
            autogeneratedExamples: [],
            userProvidedExamples: [],
            encoding: undefined,
            availability: await context.getAvailability({ node: this.schema, breadcrumbs: this.breadcrumbs, errorCollector }),
            docs: this.schema.description,
            referencedTypes: new Set(),
            source: undefined,
            inline: this.inlined
        };
    }

    public convertDeclaredTypeName({ context }: { context: OpenAPIConverterContext3_1 }): DeclaredTypeName {
        return {
            typeId: this.id,
            fernFilepath: {
                allParts: [],
                packagePath: [],
                file: undefined
            },
            name: context.casingsGenerator.generateName(this.id)
        };
    }
}
