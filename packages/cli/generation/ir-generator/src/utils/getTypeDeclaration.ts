import { TypeDeclaration } from "@fern-api/ir-sdk";
import { LoggableFernCliError } from "@fern-api/task-context";

export function getTypeDeclaration(typeId: string, types: Record<string, TypeDeclaration>): TypeDeclaration {
    const maybeTypeDeclaration = types[typeId];
    if (maybeTypeDeclaration == null) {
        throw new LoggableFernCliError(`Illegal Error: Failed to load type declaration for type ${typeId}`);
    }
    return maybeTypeDeclaration;
}
