import { ErrorDefinition, ErrorName, FernFilepath, IntermediateRepresentation } from "@fern-api/api";

type SimpleErrorName = string;

export class ErrorResolver {
    private resolvedErrors: Record<FernFilepath, Record<SimpleErrorName, ErrorDefinition>> = {};

    constructor(intermediateRepresentation: IntermediateRepresentation) {
        for (const error of intermediateRepresentation.errors) {
            let errorsAtFilepath = this.resolvedErrors[error.name.fernFilepath];
            if (errorsAtFilepath == null) {
                errorsAtFilepath = {};
                this.resolvedErrors[error.name.fernFilepath] = errorsAtFilepath;
            }

            errorsAtFilepath[error.name.name] = error;
        }
    }

    public resolveErrorName(errorName: ErrorName): ErrorDefinition {
        const resolvedError = this.resolvedErrors[errorName.fernFilepath]?.[errorName.name];
        if (resolvedError == null) {
            throw new Error("Error not found: " + errorNameToString(errorName));
        }
        return resolvedError;
    }
}

function errorNameToString(errorName: ErrorName) {
    return `${errorName.fernFilepath}.${errorName.name}`;
}
