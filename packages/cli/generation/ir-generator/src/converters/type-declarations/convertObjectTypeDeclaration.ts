import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { ObjectProperty, ObjectPropertyAccess, Type } from "@fern-api/ir-sdk";

import { FernFileContext } from "../../FernFileContext";
import { parseTypeName } from "../../utils/parseTypeName";
import { convertDeclaration } from "../convertDeclaration";

export function convertObjectTypeDeclaration({
    object,
    file
}: {
    object: RawSchemas.ObjectSchema;
    file: FernFileContext;
}): Type {
    return Type.object({
        extends: getExtensionsAsList(object.extends).map((extended) => parseTypeName({ typeName: extended, file })),
        properties: getObjectPropertiesFromRawObjectSchema(object, file),
        extraProperties: object["extra-properties"] ?? false,
        extendedProperties: undefined
    });
}

export function getObjectPropertiesFromRawObjectSchema(
    object: RawSchemas.ObjectSchema,
    file: FernFileContext
): ObjectProperty[] {
    if (object.properties == null) {
        return [];
    }
    return Object.entries(object.properties).map(([propertyKey, propertyDefinition]) => ({
        ...convertDeclaration(propertyDefinition),
        name: file.casingsGenerator.generateNameAndWireValue({
            wireValue: propertyKey,
            name: getPropertyName({ propertyKey, property: propertyDefinition }).name
        }),
        valueType: file.parseTypeReference(propertyDefinition),
        propertyAccess: getPropertyAccess({ property: propertyDefinition })
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

export function getPropertyAccess({
    property
}: {
    property: RawSchemas.ObjectPropertySchema;
}): ObjectPropertyAccess | undefined {
    if (typeof property === "string") {
        return undefined;
    }
    const propertyAccess = property["access"];
    if (propertyAccess != null) {
        switch (propertyAccess) {
            case "read-only":
                return ObjectPropertyAccess.ReadOnly;
            case "write-only":
                return ObjectPropertyAccess.WriteOnly;
            default:
                assertNever(propertyAccess);
        }
    }
    return undefined;
}
