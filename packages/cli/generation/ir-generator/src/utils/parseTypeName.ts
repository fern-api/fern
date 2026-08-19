import { DeclaredTypeName } from "@fern-api/ir-sdk";
import { IdGenerator } from "@fern-api/ir-utils";
import { CliError } from "@fern-api/task-context";
import { FernFileContext } from "../FernFileContext.js";
import { convertToFernFilepath } from "./convertToFernFilepath.js";
import { parseReferenceToTypeName } from "./parseReferenceToTypeName.js";

export function parseTypeName({ typeName, file }: { typeName: string; file: FernFileContext }): DeclaredTypeName {
    const reference = parseReferenceToTypeName({
        reference: typeName,
        referencedIn: file.relativeFilepath,
        imports: file.imports
    });
    if (reference == null) {
        throw new CliError({ message: "Failed to locate type: " + typeName, code: CliError.Code.ResolutionError });
    }

    const nameWithoutId = {
        name: file.casingsGenerator.generateName(reference.typeName),
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
