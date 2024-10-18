import { ContainerType, ObjectProperty, Type, TypeDeclaration, TypeId, TypeReference } from "@fern-api/ir-sdk";
import { RawSchemas, visitInlineableTypeReferenceSchema } from "@fern-api/fern-definition-schema";
import { FernFileContext } from "../../FernFileContext";
import { parseTypeName } from "../../utils/parseTypeName";
import { convertDeclaration } from "../convertDeclaration";
import { WithInlinedTypes } from "./ConvertInlinedTypeResponse";
import { convertType } from "./convertTypeDeclaration";
import { TypeResolver } from "../../resolvers/TypeResolver";

export async function convertObjectTypeDeclaration({
    object,
    file,
    typeResolver
}: {
    object: RawSchemas.ObjectSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): Promise<WithInlinedTypes<Type>> {
    const { response, inlinedTypes } = await getObjectPropertiesFromRawObjectSchema(object, file, typeResolver);
    return {
        inlinedTypes,
        response: Type.object({
            extends: getExtensionsAsList(object.extends).map((extended) => parseTypeName({ typeName: extended, file })),
            properties: response,
            extraProperties: object["extra-properties"] ?? false,
            extendedProperties: undefined
        })
    };
}

export async function getObjectPropertiesFromRawObjectSchema(
    object: RawSchemas.ObjectSchema,
    file: FernFileContext,
    typeResolver: TypeResolver
): Promise<WithInlinedTypes<ObjectProperty[]>> {
    const properties: ObjectProperty[] = [];
    const inlinedTypes: Record<TypeId, Type> = {};

    if (object.properties == null) {
        return { response: properties, inlinedTypes };
    }

    for (const [propertyKey, propertyDefinition] of Object.entries(object.properties)) {
        await visitInlineableTypeReferenceSchema<Promise<void>>(propertyDefinition, {
            detailedReference: async (reference) => {
                properties.push({
                    ...(await convertDeclaration(propertyDefinition)),
                    name: file.casingsGenerator.generateNameAndWireValue({
                        wireValue: propertyKey,
                        name: getPropertyName({ propertyKey, property: propertyDefinition }).name
                    }),
                    valueType: file.parseTypeReference(reference)
                });
            },
            reference: async (reference) => {
                properties.push({
                    ...(await convertDeclaration(propertyDefinition)),
                    name: file.casingsGenerator.generateNameAndWireValue({
                        wireValue: propertyKey,
                        name: getPropertyName({ propertyKey, property: propertyDefinition }).name
                    }),
                    valueType: file.parseTypeReference(reference)
                });
            },
            inlineList: async (reference) => {
                const { response, inlinedTypes: additionalInlinedTypes } = await convertType({
                    typeDeclaration: reference.value,
                    file,
                    typeResolver
                });
                for (const [typeId, inlineType] of Object.entries(additionalInlinedTypes)) {
                    inlinedTypes[typeId] = inlineType;
                }
                inlinedTypes[reference.value.name] = response;

                properties.push({
                    ...(await convertDeclaration(reference.value)),
                    name: file.casingsGenerator.generateNameAndWireValue({
                        wireValue: propertyKey,
                        name: getPropertyName({ propertyKey, property: propertyDefinition }).name
                    }),
                    valueType: TypeReference.container(
                        ContainerType.list(file.parseTypeReference(reference.value.name))
                    )
                    // add a inlined true
                });
            },
            inlineType: async (declaration) => {
                const { response, inlinedTypes: additionalInlinedTypes } = await convertType({
                    typeDeclaration: declaration,
                    file,
                    typeResolver
                });
                for (const [typeId, inlineType] of Object.entries(additionalInlinedTypes)) {
                    inlinedTypes[typeId] = inlineType;
                }
                inlinedTypes[declaration.name] = response;

                properties.push({
                    ...(await convertDeclaration(declaration)),
                    name: file.casingsGenerator.generateNameAndWireValue({
                        wireValue: propertyKey,
                        name: getPropertyName({ propertyKey, property: propertyDefinition }).name
                    }),
                    valueType: file.parseTypeReference(declaration.name)
                    // add a inlined true
                });
            }
        });
    }

    return { response: properties, inlinedTypes };
}

export function getExtensionsAsList(extensions: string | string[] | undefined): string[] {
    if (extensions == null) {
        return [];
    }
    if (typeof extensions === "string") {
        return [extensions];
    }
    return extensions;
}

export function getPropertyName({
    propertyKey,
    property
}: {
    propertyKey: string;
    property: RawSchemas.ObjectPropertySchema;
}): { name: string; wasExplicitlySet: boolean } {
    if (typeof property !== "string" && property.name != null) {
        return {
            name: property.name,
            wasExplicitlySet: true
        };
    }

    return {
        name: propertyKey,
        wasExplicitlySet: false
    };
}
