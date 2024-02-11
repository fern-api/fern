import { DeclaredErrorName, ErrorDeclaration, ErrorId, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

type SimpleErrorName = string;

export class ErrorResolver {
    private resolvedErrors: Record<ErrorId, Record<SimpleErrorName, ErrorDeclaration>> = {};

    constructor(intermediateRepresentation: IntermediateRepresentation) {
        for (const error of Object.values(intermediateRepresentation.errors)) {
            const errorsAtFilepath = (this.resolvedErrors[error.name.errorId] ??= {});
            errorsAtFilepath[getSimpleErrorName(error.name)] = error;
        }
    }

    public getErrorDeclarationFromName(errorName: DeclaredErrorName): ErrorDeclaration {
        const resolvedError = this.resolvedErrors[errorName.errorId]?.[getSimpleErrorName(errorName)];
        if (resolvedError == null) {
            throw new Error("Error not found: " + errorName.errorId);
        }
        return resolvedError;
    }
}

function getSimpleErrorName(errorName: DeclaredErrorName): SimpleErrorName {
    return errorName.name.originalName;
}
