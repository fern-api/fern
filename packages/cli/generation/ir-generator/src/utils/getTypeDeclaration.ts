import { TypeDeclaration } from "@fern-api/ir-sdk";
import { CliError } from "@fern-api/task-context";

export function getTypeDeclaration(typeId: string, types: Record<string, TypeDeclaration>): TypeDeclaration {
    const maybeTypeDeclaration = types[typeId];
    if (maybeTypeDeclaration == null) {
        throw CliError.internalError(`Failed to load type declaration for type ${typeId}`);
    }
    return maybeTypeDeclaration;
}
