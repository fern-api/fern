import { RawSchemas } from "@fern-api/yaml-schema";
import { Type } from "@fern-fern/ir-model/types";
import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../type-resolver/TypeResolver";

export function convertAliasTypeDeclaration({
    alias,
    file,
    typeResolver,
}: {
    alias: string | RawSchemas.AliasSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): Type {
    const aliasOfStr = typeof alias === "string" ? alias : alias.alias;
    return Type.alias({
        aliasOf: file.parseTypeReference(aliasOfStr),
        resolvedType: typeResolver.resolveType({ type: aliasOfStr, file }),
    });
}
