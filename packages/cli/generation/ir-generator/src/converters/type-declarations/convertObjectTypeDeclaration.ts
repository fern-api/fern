import { RawSchemas } from "@fern-api/yaml-schema";
import { Type } from "@fern-fern/ir-model/types";
import { FernFileContext } from "../../FernFileContext";
import { generateWireStringWithAllCasings } from "../../utils/generateCasings";
import { getDocs } from "../../utils/getDocs";
import { parseTypeName } from "../../utils/parseTypeName";

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
                ? Object.entries(object.properties).map(([propertyName, propertyDefinition]) => ({
                      name: generateWireStringWithAllCasings({
                          wireValue: propertyName,
                          name:
                              typeof propertyDefinition !== "string" && propertyDefinition.name
                                  ? propertyDefinition.name
                                  : propertyName,
                      }),
                      valueType: file.parseTypeReference(propertyDefinition),
                      docs: getDocs(propertyDefinition),
                  }))
                : [],
    });
}
