import { DeclaredTypeName } from "@fern-api/ir-sdk";
import { FernFileContext } from "../FernFileContext";
import { IdGenerator } from "../IdGenerator";
import { convertToFernFilepath } from "./convertToFernFilepath";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { parseReferenceToTypeName } from "./parseReferenceToTypeName";

export function parseTypeName({
    typeName,
    file,
    typeDeclaration
}: {
    typeName: string;
    file: FernFileContext;
    typeDeclaration?: RawSchemas.TypeDeclarationSchema;
}): DeclaredTypeName {
    const reference = parseReferenceToTypeName({
        reference: typeName,
        referencedIn: file.relativeFilepath,
        imports: file.imports
    });
    if (reference == null) {
        throw new Error("Failed to locate type: " + typeName);
    }

    const nameWithoutId = {
        name: file.casingsGenerator.generateName(reference.typeName),
        fernFilepath: convertToFernFilepath({
            relativeFilepath: reference.relativeFilepath,
            casingsGenerator: file.casingsGenerator
        })
    };

    return {
        ...nameWithoutId,
        typeId: IdGenerator.generateTypeId(nameWithoutId),
        originalName:
            typeof typeDeclaration !== "string" && typeDeclaration != null && typeDeclaration.originalName != null
                ? file.casingsGenerator.generateName(typeDeclaration.originalName)
                : undefined
    };
}
