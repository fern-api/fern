import { RawSchemas } from "@fern-api/yaml-schema";
import { Type } from "@fern-fern/ir-model/types";
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
        extends:
            object.extends != null
                ? typeof object.extends === "string"
                    ? [parseTypeName({ typeName: object.extends, file })]
                    : object.extends.map((extended) => parseTypeName({ typeName: extended, file }))
                : [],
        properties:
            object.properties != null
                ? Object.entries(object.properties).map(([propertyKey, propertyDefinition]) => ({
                      ...convertDeclaration(propertyDefinition),
                      name: file.casingsGenerator.generateWireCasingsV1({
                          wireValue: propertyKey,
                          name: getPropertyName({ propertyKey, declaration: propertyDefinition }).name,
                      }),
                      nameV2: file.casingsGenerator.generateNameAndWireValue({
                          wireValue: propertyKey,
                          name: getPropertyName({ propertyKey, declaration: propertyDefinition }).name,
                      }),
                      valueType: file.parseTypeReference(propertyDefinition),
                  }))
                : [],
    });
}

export function getPropertyName({
    propertyKey,
    declaration,
}: {
    propertyKey: string;
    declaration: RawSchemas.ObjectPropertySchema;
}): { name: string; wasExplicitlySet: boolean } {
    if (typeof declaration !== "string" && declaration.name != null) {
        return {
            name: declaration.name,
            wasExplicitlySet: true,
        };
    }

    return {
        name: propertyKey,
        wasExplicitlySet: false,
    };
}
