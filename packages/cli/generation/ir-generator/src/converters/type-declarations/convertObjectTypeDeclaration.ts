import { RawSchemas } from "@fern-api/yaml-schema";
import { ObjectProperty, Type } from "@fern-fern/ir-sdk/api";
import { FernFileContext } from "../../FernFileContext";
import { parseTypeName } from "../../utils/parseTypeName";
import { convertDeclaration } from "../convertDeclaration";

export function convertObjectTypeDeclaration({
    object,
    file,
    audiences,
}: {
    object: RawSchemas.ObjectSchema;
    file: FernFileContext;
    audiences: Set<string>;
}): Type {
    return Type.object({
        extends: getExtensionsAsList(object.extends).map((extended) => parseTypeName({ typeName: extended, file })),
        properties: getObjectPropertiesFromRawObjectSchema(object, file, audiences),
    });
}

export function getObjectPropertiesFromRawObjectSchema(
    object: RawSchemas.ObjectSchema,
    file: FernFileContext,
    audiences: Set<string>,
): ObjectProperty[] {
    if (object.properties == null) {
        return [];
    }
    const audienceFilteredProperties = filterPropertiesByAudiences(object, audiences);
    return Object.entries(audienceFilteredProperties).map(([propertyKey, propertyDefinition]) => ({
        ...convertDeclaration(propertyDefinition),
        name: file.casingsGenerator.generateNameAndWireValue({
            wireValue: propertyKey,
            name: getPropertyName({ propertyKey, property: propertyDefinition }).name,
        }),
        valueType: file.parseTypeReference(propertyDefinition),
    }));
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
    property,
}: {
    propertyKey: string;
    property: RawSchemas.ObjectPropertySchema;
}): { name: string; wasExplicitlySet: boolean } {
    if (typeof property !== "string" && property.name != null) {
        return {
            name: property.name,
            wasExplicitlySet: true,
        };
    }

    return {
        name: propertyKey,
        wasExplicitlySet: false,
    };
}


export function filterPropertiesByAudiences(objectSchema: RawSchemas.ObjectSchema,
                                     audiences: Set<string>): Record<string, RawSchemas.ObjectPropertySchema> {
    if(audiences.size === 0 || !objectSchema.properties)
    {
        return objectSchema.properties ?? {};
    }

    const filteredProperties = Object.fromEntries(Object.entries(objectSchema.properties)
        .filter(([, propertySchema]) => {
            if(typeof propertySchema !== "string"){
                const propertyAudiences = propertySchema.audiences ?? [];
                return propertyAudiences.some(audience => audiences.has(audience));
            }
            return false;
        }));
    // If there are some properties with matching audience we return only those otherwise all are included
    return Object.keys(filteredProperties).length >= 0 ? filteredProperties : objectSchema.properties;

}
