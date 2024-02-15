import { ImportStrategy } from "../declaration-referencers/DeclarationReferencer";

export function getSchemaImportStrategy({ useDynamicImport }: { useDynamicImport: boolean }): ImportStrategy {
    return {
        type: "fromRoot",
        namespaceImport: "serializers",
        useDynamicImport
    };
}
