import { titleCase } from "@fern-api/core-utils"
import { RawSchemas } from "@fern-api/fern-definition-schema"
import { Type } from "@fern-api/ir-sdk"

import { FernFileContext } from "../../FernFileContext"

export function convertUndiscriminatedUnionTypeDeclaration({
    union,
    file
}: {
    union: RawSchemas.UndiscriminatedUnionSchema
    file: FernFileContext
}): Type {
    // Filter out duplicate members from the union by comparing their types
    const uniqueMembers = union.union.filter((currentMember, currentIndex) => {
        // Get the type, handling both string and object member formats
        const currentMemberTypeReference = typeof currentMember === "string" ? currentMember : currentMember.type

        // Keep this member only if it's the first occurrence of its type
        return (
            union.union.findIndex((otherMember) => {
                const otherMemberType = typeof otherMember === "string" ? otherMember : otherMember.type
                return otherMemberType === currentMemberTypeReference
            }) === currentIndex
        )
    })

    return Type.undiscriminatedUnion({
        members: uniqueMembers.map((member) => {
            const parsedType = file.parseTypeReference(typeof member === "string" ? member : member.type)

            const typeWithDisplayName =
                parsedType.type === "named"
                    ? {
                          ...parsedType,
                          displayName:
                              typeof member === "string"
                                  ? titleCase(parsedType.name.originalName)
                                  : (member["display-name"] ?? titleCase(parsedType.name.originalName))
                      }
                    : parsedType

            return {
                type: typeWithDisplayName,
                docs: typeof member === "string" ? undefined : member.docs
            }
        })
    })
}
