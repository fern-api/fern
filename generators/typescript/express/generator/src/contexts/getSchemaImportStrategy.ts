import { ImportStrategy } from "../declaration-referencers/DeclarationReferencer.js";

export function getSchemaImportStrategy({ useDynamicImport }: { useDynamicImport: boolean }): ImportStrategy {
    return {
        type: "fromRoot",
        namespaceImport: "serializers",
        useDynamicImport
    };
}
