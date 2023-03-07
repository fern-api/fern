import { Type } from "@fern-fern/ir-model/types";

export function convertUndiscriminatedUnionTypeDeclaration(): Type {
    return Type.undiscriminatedUnion({ docs: undefined, members: [] });
}
