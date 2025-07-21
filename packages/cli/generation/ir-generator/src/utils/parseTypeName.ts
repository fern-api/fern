import { RawSchemas } from "@fern-api/fern-definition-schema";
import { DeclaredTypeName } from "@fern-api/ir-sdk";
import { IdGenerator } from "@fern-api/ir-utils";

import { FernFileContext } from "../FernFileContext";
import { convertToFernFilepath } from "./convertToFernFilepath";
import { getCasingOverrides } from "./getCasingOverrides";
import { getTypeDeclarationName } from "./getTypeDeclarationName";
import { parseReferenceToTypeName } from "./parseReferenceToTypeName";

export function parseTypeName({
    typeName,
    typeDeclaration,
    file
}: {
    typeName: string;
    typeDeclaration: RawSchemas.TypeDeclarationSchema | undefined;
    file: FernFileContext;
}): DeclaredTypeName {
    console.log(`Parsing type name: ${typeName} with declaration: ${JSON.stringify(typeDeclaration)}`);
    const reference = parseReferenceToTypeName({
        reference: typeName,
        referencedIn: file.relativeFilepath,
        imports: file.imports
    });
    if (reference == null) {
        throw new Error("Failed to locate type: " + typeName);
    }

    const casing = undefined; //typeDeclaration != null ? getCasingOverrides(typeDeclaration) : undefined;
    const nameWithoutId = {
        name: file.casingsGenerator.generateName(
            typeDeclaration != null ? getTypeDeclarationName(typeDeclaration, typeName) : typeName,
            {
                casingOverrides: casing
            }
        ),
        fernFilepath: convertToFernFilepath({
            relativeFilepath: reference.relativeFilepath,
            casingsGenerator: file.casingsGenerator
        }),
        displayName: undefined
    };

    return {
        ...nameWithoutId,
        typeId: IdGenerator.generateTypeId(nameWithoutId)
    };
}
