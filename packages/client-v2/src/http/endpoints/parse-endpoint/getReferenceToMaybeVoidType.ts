import { TypeReference } from "@fern-fern/ir-model";
import { File } from "@fern-typescript/declaration-handler";
import { ts } from "ts-morph";

export function getReferenceToMaybeVoidType(reference: TypeReference, file: File): ts.TypeNode | undefined {
    if (reference._type === "void") {
        return undefined;
    }
    return file.getReferenceToType(reference);
}
