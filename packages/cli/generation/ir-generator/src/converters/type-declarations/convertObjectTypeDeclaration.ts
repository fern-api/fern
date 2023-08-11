import { RawSchemas } from "@fern-api/yaml-schema";
import { Type } from "@fern-fern/ir-sdk/api";
import { FernFileContext } from "../../FernFileContext";
import { parseTypeName } from "../../utils/parseTypeName";
import { convertDeclaration } from "../convertDeclaration";

export function convertObjectTypeDeclaration({
    object,
    file,
}: {
    object: RawSchemas.ObjectSchema;
    file: FernFileContext;
}): Type {
    return Type.object({
        extends_: getExtensionsAsList(object.extends).map((extended) => parseTypeName({ typeName: extended, file })),
        properties:
            object.properties != null
                ? Object.entries(object.properties).map(([propertyKey, propertyDefinition]) => ({
                      ...convertDeclaration(propertyDefinition),
                      name: file.casingsGenerator.generateNameAndWireValue({
                          wireValue: propertyKey,
                          name: getPropertyName({ propertyKey, property: propertyDefinition }).name,
                      }),
                      valueType: file.parseTypeReference(propertyDefinition),
                  }))
                : [],
    });
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
