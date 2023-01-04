import { ImportStrategy } from "../../declaration-referencers/DeclarationReferencer";

export function getSchemaImportStrategy(): ImportStrategy {
    return {
        type: "fromRoot",
        namespaceImport: "serializers",
    };
}
