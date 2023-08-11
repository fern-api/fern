import { RawSchemas } from "@fern-api/yaml-schema";
import { Type } from "@fern-fern/ir-sdk/api";
import { FernFileContext } from "../../FernFileContext";

export function convertUndiscriminatedUnionTypeDeclaration({
    union,
    file,
}: {
    union: RawSchemas.UndiscriminatedUnionSchema;
    file: FernFileContext;
}): Type {
    return Type.undiscriminatedUnion({
        members: union.union.map((unionMember) => {
            if (typeof unionMember === "string") {
                return {
                    docs: undefined,
                    type_: file.parseTypeReference(unionMember),
                };
            }
            return {
                type_: file.parseTypeReference(unionMember.type),
                docs: unionMember.docs,
            };
        }),
    });
}
