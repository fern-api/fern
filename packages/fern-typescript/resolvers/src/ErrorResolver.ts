import { ErrorDeclaration, ErrorName, IntermediateRepresentation } from "@fern-fern/ir-model";
import path from "path";
import { StringifiedFernFilepath, stringifyFernFilepath } from "./stringify-fern-filepath";

type SimpleErrorName = string;

export class ErrorResolver {
    private resolvedErrors: Record<StringifiedFernFilepath, Record<SimpleErrorName, ErrorDeclaration>> = {};

    constructor(intermediateRepresentation: IntermediateRepresentation) {
        for (const error of intermediateRepresentation.errors) {
            const errorsAtFilepath = (this.resolvedErrors[stringifyFernFilepath(error.name.fernFilepath)] ??= {});
            errorsAtFilepath[error.name.name] = error;
        }
    }

    public getErrorDeclarationFromName(errorName: ErrorName): ErrorDeclaration {
        const resolvedError = this.resolvedErrors[stringifyFernFilepath(errorName.fernFilepath)]?.[errorName.name];
        if (resolvedError == null) {
            throw new Error("Error not found: " + errorNameToString(errorName));
        }
        return resolvedError;
    }
}

function errorNameToString(errorName: ErrorName) {
    return path.join(stringifyFernFilepath(errorName.fernFilepath), errorName.name);
}
