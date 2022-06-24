import { ErrorDefinition, ErrorName, FernFilepath, IntermediateRepresentation } from "@fern-api/api";

type SimpleErrorName = string;

export class ErrorResolver {
    private resolvedErrors: Record<FernFilepath, Record<SimpleErrorName, ErrorDefinition>> = {};

    constructor(intermediateRepresentation: IntermediateRepresentation) {
        for (const error of intermediateRepresentation.errors) {
            const errorsAtFilepath = (this.resolvedErrors[error.name.fernFilepath] ??= {});
            errorsAtFilepath[error.name.name] = error;
        }
    }

    public getErrorDefinitionFromName(errorName: ErrorName): ErrorDefinition {
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
