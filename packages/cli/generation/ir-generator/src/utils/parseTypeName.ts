import { DeclaredTypeName } from "@fern-fern/ir-model/types";
import { FernFileContext } from "../FernFileContext";
import { convertToFernFilepath, convertToFernFilepathV2 } from "./convertToFernFilepath";
import { parseReferenceToTypeName } from "./parseReferenceToTypeName";

export function parseTypeName({ typeName, file }: { typeName: string; file: FernFileContext }): DeclaredTypeName {
    const reference = parseReferenceToTypeName({
        reference: typeName,
        referencedIn: file.relativeFilepath,
        imports: file.imports,
    });
    if (reference == null) {
        throw new Error("Failed to locate type: " + typeName);
    }
    return {
        name: reference.typeName,
        nameV2: file.casingsGenerator.generateNameCasingsV1(reference.typeName),
        nameV3: file.casingsGenerator.generateName(reference.typeName),
        fernFilepath: convertToFernFilepath({
            relativeFilepath: reference.relativeFilepath,
            casingsGenerator: file.casingsGenerator,
        }),
        fernFilepathV2: convertToFernFilepathV2({
            relativeFilepath: reference.relativeFilepath,
            casingsGenerator: file.casingsGenerator,
        }),
    };
}
