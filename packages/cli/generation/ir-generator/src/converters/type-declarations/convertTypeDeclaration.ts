import { RawSchemas, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import { Type, TypeDeclaration, TypeReference } from "@fern-fern/ir-model/types";
import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../type-resolver/TypeResolver";
import { getDocs } from "../../utils/getDocs";
import { convertAliasTypeDeclaration } from "./convertAliasTypeDeclaration";
import { convertEnumTypeDeclaration } from "./convertEnumTypeDeclaration";
import { convertObjectTypeDeclaration } from "./convertObjectTypeDeclaration";
import { convertUnionTypeDeclaration } from "./convertUnionTypeDeclaration";

export function convertTypeDeclaration({
    typeName,
    typeDeclaration,
    file,
    typeResolver,
}: {
    typeName: string;
    typeDeclaration: RawSchemas.TypeDeclarationSchema | string;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): TypeDeclaration {
    return {
        docs: getDocs(typeDeclaration),
        name: {
            fernFilepath: file.fernFilepath,
            name: typeName,
        },
        shape: convertType({ typeDeclaration, file, typeResolver }),
    };
}

export function convertType({
    typeDeclaration,
    file,
    typeResolver,
}: {
    typeDeclaration: RawSchemas.TypeDeclarationSchema | string | null | undefined;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): Type {
    if (typeDeclaration == null) {
        return Type.alias({
            aliasOf: TypeReference.void(),
            resolvedType: TypeReference.void(),
        });
    }

    return visitRawTypeDeclaration<Type>(typeDeclaration, {
        alias: (alias) => convertAliasTypeDeclaration({ alias, file, typeResolver }),
        object: (object) => convertObjectTypeDeclaration({ object, file }),
        union: (union) => convertUnionTypeDeclaration({ union, file, typeResolver }),
        enum: convertEnumTypeDeclaration,
    });
}
