import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Type } from "@fern-api/ir-sdk";

import { FernFileContext } from "../../FernFileContext";

export function convertUndiscriminatedUnionTypeDeclaration({
    union,
    file
}: {
    union: RawSchemas.UndiscriminatedUnionSchema;
    file: FernFileContext;
}): Type {
    return Type.undiscriminatedUnion({
        members: union.union.map((unionMember) => {
            if (typeof unionMember === "string") {
                return {
                    docs: undefined,
                    type: file.parseTypeReference(unionMember)
                };
            }
            return {
                type: file.parseTypeReference(unionMember),
                docs: unionMember.docs
            };
        })
    });
}
