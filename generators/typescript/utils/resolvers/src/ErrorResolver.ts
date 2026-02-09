import { FernIr } from "@fern-fern/ir-sdk";

type SimpleErrorName = string;

export class ErrorResolver {
    private resolvedErrors: Record<FernIr.ErrorId, Record<SimpleErrorName, FernIr.ErrorDeclaration>> = {};

    constructor(intermediateRepresentation: FernIr.IntermediateRepresentation) {
        for (const error of Object.values(intermediateRepresentation.errors)) {
            const errorsAtFilepath = (this.resolvedErrors[error.name.errorId] ??= {});
            errorsAtFilepath[getSimpleErrorName(error.name)] = error;
        }
    }

    public getErrorDeclarationFromName(errorName: FernIr.DeclaredErrorName): FernIr.ErrorDeclaration {
        const resolvedError = this.resolvedErrors[errorName.errorId]?.[getSimpleErrorName(errorName)];
        if (resolvedError == null) {
            throw new Error("Error not found: " + errorName.errorId);
        }
        return resolvedError;
    }
}

function getSimpleErrorName(errorName: FernIr.DeclaredErrorName): SimpleErrorName {
    return errorName.name.originalName;
}
