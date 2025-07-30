import { DescriptorProto } from "@bufbuild/protobuf/wkt";

import * as FernIr from "@fern-api/ir-sdk";
import { Type, TypeId } from "@fern-api/ir-sdk";
import { AbstractConverter } from "@fern-api/v3-importer-commons";

import { ProtofileConverterContext } from "../ProtofileConverterContext";
import { capitalizeFirstLetter } from "../utils/CapitalizeFirstLetter";
import { convertFields } from "../utils/ConvertFields";
import { PATH_FIELD_NUMBERS } from "../utils/PathFieldNumbers";
import { EnumOrMessageConverter } from "./EnumOrMessageConverter";
import { OneOfFieldConverter } from "./OneOfFieldConverter";

export declare namespace MessageConverter {
    export interface Args extends AbstractConverter.Args<ProtofileConverterContext> {
        message: DescriptorProto;
        sourceCodeInfoPath: number[];
    }

    export interface Output {
        convertedSchema: EnumOrMessageConverter.ConvertedSchema;
        inlinedTypes: Record<FernIr.TypeId, EnumOrMessageConverter.ConvertedSchema>;
    }
}

export class MessageConverter extends AbstractConverter<ProtofileConverterContext, MessageConverter.Output> {
    private readonly message: DescriptorProto;
    private readonly sourceCodeInfoPath: number[];
    constructor({ context, breadcrumbs, message, sourceCodeInfoPath }: MessageConverter.Args) {
        super({ context, breadcrumbs });
        this.message = message;
        this.sourceCodeInfoPath = sourceCodeInfoPath;
    }

    public convert(): MessageConverter.Output | undefined {
        let inlinedTypes: Record<FernIr.TypeId, EnumOrMessageConverter.ConvertedSchema> = {};
        const allReferencedTypes: Set<TypeId> = new Set();

        // Step 1: Convert all fields
        const { convertedFields, referencedTypes, propertiesByAudience, oneOfFields } = convertFields({
            fields: this.message.field,
            breadcrumbs: this.breadcrumbs,
            context: this.context,
            sourceCodeInfoPath: this.sourceCodeInfoPath
        });

        // Merge referenced types from fields
        for (const referencedType of referencedTypes) {
            allReferencedTypes.add(referencedType);
        }

        // Step 2: Convert all nested messages and enums
        for (const [nestedMessageIndex, nestedEnumOrMessage] of this.message.nestedType.entries()) {
            const enumOrMessageConverter = new EnumOrMessageConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: nestedEnumOrMessage,
                sourceCodeInfoPath: [
                    ...this.sourceCodeInfoPath,
                    PATH_FIELD_NUMBERS.MESSAGE.NESTED_TYPE,
                    nestedMessageIndex
                ],
                schemaIndex: nestedMessageIndex
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

        for (const [nestedEnumIndex, nestedEnumOrMessage] of this.message.enumType.entries()) {
            const enumOrMessageConverter = new EnumOrMessageConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: nestedEnumOrMessage,
                sourceCodeInfoPath: [...this.sourceCodeInfoPath, PATH_FIELD_NUMBERS.MESSAGE.ENUM_TYPE, nestedEnumIndex],
                schemaIndex: nestedEnumIndex
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
                oneOfFields: oneOfFields[index] ?? [],
                sourceCodeInfoPath: [...this.sourceCodeInfoPath, PATH_FIELD_NUMBERS.MESSAGE.ONEOF_DECL, index]
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
                    typeName: this.context.maybePrependPackageName(convertedOneOfSchema.typeDeclaration.name.typeId)
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
                    typeName: this.message.name,
                    docs: this.context.getCommentForPath(this.sourceCodeInfoPath)
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
        docs
    }: {
        shape: FernIr.Type;
        referencedTypes: Set<TypeId>;
        typeName: string;
        docs?: string;
    }): FernIr.TypeDeclaration {
        return {
            name: this.convertDeclaredTypeName(typeName),
            shape,
            autogeneratedExamples: [],
            userProvidedExamples: [],
            encoding: undefined,
            availability: undefined,
            docs,
            referencedTypes,
            source: undefined,
            inline: false,
            v2Examples: {
                userSpecifiedExamples: {},
                autogeneratedExamples: {}
            }
        };
    }

    public convertDeclaredTypeName(typeName: string): FernIr.DeclaredTypeName {
        const fullyQualifiedName = this.context.maybePrependPackageName(typeName);
        return {
            typeId: fullyQualifiedName,
            fernFilepath: this.context.createFernFilepath(),
            name: this.context.casingsGenerator.generateName(fullyQualifiedName),
            displayName: typeName
        };
    }

    private prependDelimitedParentMessageName(name: string, delimiter: string = "."): string {
        return `${this.message.name}${delimiter}${name}`;
    }

    private prependParentMessageName(name: string): string {
        return `${this.message.name}${name}`;
    }
}
