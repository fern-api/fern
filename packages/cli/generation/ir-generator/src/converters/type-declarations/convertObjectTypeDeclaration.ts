import { ObjectProperty, Type } from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { FernFileContext } from "../../FernFileContext";
import { parseTypeName } from "../../utils/parseTypeName";
import { convertDeclaration } from "../convertDeclaration";
import {
    isNonInlinedTypeReference,
    isStringTypeReference
} from "../../utils/isNonInlinedTypeReferenceSchema";

export async function convertObjectTypeDeclaration({
    object,
    file
}: {
    object: RawSchemas.ObjectSchema;
    file: FernFileContext;
}): Promise<Type> {
    return Type.object({
        extends: getExtensionsAsList(object.extends).map((extended) => parseTypeName({ typeName: extended, file })),
        properties: await getObjectPropertiesFromRawObjectSchema(object, file),
        extraProperties: object["extra-properties"] ?? false,
        extendedProperties: undefined
    });
}

export async function getObjectPropertiesFromRawObjectSchema(
    object: RawSchemas.ObjectSchema,
    file: FernFileContext
): Promise<ObjectProperty[]> {
    if (object.properties == null) {
        return [];
    }

    const properties: ObjectProperty[] = [];
    for (const [propertyKey, propertyDefinition] of Object.entries(object.properties)) {
        if (isNonInlinedTypeReference(propertyDefinition) || isStringTypeReference(propertyDefinition)) {
            properties.push({
                ...(await convertDeclaration(propertyDefinition)),
                name: file.casingsGenerator.generateNameAndWireValue({
                    wireValue: propertyKey,
                    name: getPropertyName({ propertyKey, property: propertyDefinition }).name
                }),
                valueType: file.parseTypeReference(propertyDefinition)
            });
        }
        // TODO: handle inlined case
    }

    return properties;
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
