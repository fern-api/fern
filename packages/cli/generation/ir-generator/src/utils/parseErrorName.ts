import { DeclaredErrorName } from "@fern-api/ir-sdk";
import { IdGenerator } from "@fern-api/ir-utils";
import { CliError } from "@fern-api/task-context";
import { FernFileContext } from "../FernFileContext.js";
import { convertToFernFilepath } from "./convertToFernFilepath.js";
import { parseReferenceToTypeName } from "./parseReferenceToTypeName.js";

export function parseErrorName({ errorName, file }: { errorName: string; file: FernFileContext }): DeclaredErrorName {
    const reference = parseReferenceToTypeName({
        reference: errorName,
        referencedIn: file.relativeFilepath,
        imports: file.imports
    });
    if (reference == null) {
        throw new CliError({ message: "Failed to locate error " + errorName, code: CliError.Code.ResolutionError });
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
        errorId: IdGenerator.generateErrorId(nameWithoutId)
    };
}
