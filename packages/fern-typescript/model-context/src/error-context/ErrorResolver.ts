import { ErrorDeclaration, ErrorName } from "@fern-fern/ir-model/errors";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { StringifiedFernFilepath, stringifyFernFilepath } from "../stringifyFernFilepath";

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
    return `${stringifyFernFilepath(errorName.fernFilepath)}.${errorName.name}`;
}
