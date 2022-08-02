import { TypeReference } from "@fern-fern/ir-model";
import { ts } from "@ts-morph/common";
import { File } from "../../../../client/types";

export function getReferenceToMaybeVoidType(reference: TypeReference, file: File): ts.TypeNode | undefined {
    if (reference._type === "void") {
        return undefined;
    }
    return file.getReferenceToType(reference);
}
