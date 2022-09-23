import { TypeReference } from "@fern-fern/ir-model/types";
import { SdkFile, TypeReferenceNode } from "@fern-typescript/sdk-declaration-handler";

export function getReferenceToMaybeVoidType(reference: TypeReference, file: SdkFile): TypeReferenceNode | undefined {
    if (reference._type === "void") {
        return undefined;
    }
    return file.getReferenceToType(reference);
}
