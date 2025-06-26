import { DescriptorProto } from "@bufbuild/protobuf/wkt";

import * as FernIr from "@fern-api/ir-sdk";
import { Type, TypeId } from "@fern-api/ir-sdk";
import { AbstractConverter } from "@fern-api/v2-importer-commons";

import { ProtofileConverterContext } from "../ProtofileConverterContext";
import { capitalizeFirstLetter } from "../utils/CapitalizeFirstLetter";
import { convertFields } from "../utils/ConvertFields";
import { EnumOrMessageConverter } from "./EnumOrMessageConverter";
import { OneOfFieldConverter } from "./OneOfFieldConverter";

export declare namespace MessageConverter {
    export interface Args extends AbstractConverter.Args<ProtofileConverterContext> {
        message: DescriptorProto;
    }

    export interface Output {
        convertedSchema: EnumOrMessageConverter.ConvertedSchema;
        inlinedTypes: Record<FernIr.TypeId, EnumOrMessageConverter.ConvertedSchema>;
    }
}

export class MessageConverter extends AbstractConverter<ProtofileConverterContext, MessageConverter.Output> {
    private readonly message: DescriptorProto;
    constructor({ context, breadcrumbs, message }: MessageConverter.Args) {
        super({ context, breadcrumbs });
        this.message = message;
    }

    public convert(): MessageConverter.Output | undefined {
        // TODO: convert message (i.e. convert schema)

        let inlinedTypes: Record<FernIr.TypeId, EnumOrMessageConverter.ConvertedSchema> = {};
        const allReferencedTypes: Set<TypeId> = new Set();

        // Step 1: Convert all fields
        const { convertedFields, referencedTypes, propertiesByAudience, oneOfFields } = convertFields({
            fields: this.message.field,
            breadcrumbs: this.breadcrumbs,
            context: this.context
        });

        // Merge referenced types from fields
        for (const referencedType of referencedTypes) {
            allReferencedTypes.add(referencedType);
        }

        // Step 2: Convert all nested messages and enums
        for (const nestedEnumOrMessage of [...this.message.nestedType, ...this.message.enumType]) {
            const enumOrMessageConverter = new EnumOrMessageConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: nestedEnumOrMessage
            });
            const convertedNestedEnumOrMessage = enumOrMessageConverter.convert();
            if (convertedNestedEnumOrMessage != null) {
                // Add referenced types from nested types
                for (const referencedType of convertedNestedEnumOrMessage.convertedSchema.typeDeclaration
                    .referencedTypes) {
                    allReferencedTypes.add(referencedType);
                }

                inlinedTypes = {
                    ...inlinedTypes,
                    ...Object.fromEntries(
                        Object.entries(convertedNestedEnumOrMessage.inlinedTypes).map(([key, value]) => [
                            this.prependDelimitedParentMessageName(key),
                            this.context.updateTypeId(value, this.prependDelimitedParentMessageName(key))
                        ])
                    ),
                    [this.prependDelimitedParentMessageName(nestedEnumOrMessage.name)]: this.context.updateTypeId(
                        convertedNestedEnumOrMessage.convertedSchema,
                        this.prependDelimitedParentMessageName(nestedEnumOrMessage.name)
                    )
                };
            }
        }
        // Step 3: Convert all oneofs
        for (const [index, oneof] of this.message.oneofDecl.entries()) {
            const oneOfFieldConverter = new OneOfFieldConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                oneOfFields: oneOfFields[index] ?? []
            });
            const convertedOneOfField = oneOfFieldConverter.convert();
            if (convertedOneOfField != null) {
                // Add referenced types from oneof
                for (const referencedType of convertedOneOfField.referencedTypes) {
                    allReferencedTypes.add(referencedType);
                }

                const convertedOneOfSchema = {
                    typeDeclaration: this.createTypeDeclaration({
                        shape: convertedOneOfField.type,
                        referencedTypes: convertedOneOfField.referencedTypes,
                        typeName: this.prependParentMessageName(capitalizeFirstLetter(oneof.name))
                    }),
                    audiences: [],
                    propertiesByAudience: {}
                };

                const convertedOneOfTypeReference = this.context.convertGrpcReferenceToTypeReference({
                    typeName: convertedOneOfSchema.typeDeclaration.name.typeId
                });

                if (convertedOneOfTypeReference.ok === true) {
                    convertedFields.push({
                        name: this.context.casingsGenerator.generateNameAndWireValue({
                            name: oneof.name,
                            wireValue: oneof.name
                        }),
                        valueType: convertedOneOfTypeReference.reference,
                        docs: undefined,
                        availability: undefined,
                        propertyAccess: undefined,
                        v2Examples: undefined
                    });

                    inlinedTypes = {
                        ...inlinedTypes,
                        [convertedOneOfSchema.typeDeclaration.name.typeId]: convertedOneOfSchema
                    };
                }
            }
        }

        return {
            convertedSchema: {
                typeDeclaration: this.createTypeDeclaration({
                    shape: Type.object({
                        properties: convertedFields,
                        extends: [],
                        extendedProperties: [],
                        extraProperties: false
                    }),
                    referencedTypes: allReferencedTypes,
                    typeName: this.message.name
                }),
                audiences: [],
                propertiesByAudience
            },
            inlinedTypes
        };
    }

    public createTypeDeclaration({
        shape,
        referencedTypes,
        typeName,
        omitV2Examples
    }: {
        shape: FernIr.Type;
        referencedTypes: Set<TypeId>;
        typeName: string;
        omitV2Examples?: boolean;
    }): FernIr.TypeDeclaration {
        return {
            name: this.convertDeclaredTypeName(typeName),
            shape,
            autogeneratedExamples: [],
            userProvidedExamples: [],
            encoding: undefined,
            availability: undefined,
            docs: undefined,
            referencedTypes,
            source: undefined,
            inline: false,
            v2Examples: undefined
        };
    }

    public convertDeclaredTypeName(typeName: string): FernIr.DeclaredTypeName {
        return {
            typeId: typeName,
            fernFilepath: this.context.createFernFilepath(),
            name: this.context.casingsGenerator.generateName(typeName),
            displayName: undefined
        };
    }

    private prependDelimitedParentMessageName(name: string, delimiter: string = "."): string {
        return `${this.message.name}${delimiter}${name}`;
    }

    private prependParentMessageName(name: string): string {
        return `${this.message.name}${name}`;
    }
}
