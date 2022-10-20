import { RawSchemas, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import { Type, TypeDeclaration } from "@fern-fern/ir-model/types";
import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { convertDeclaration } from "../convertDeclaration";
import { convertAliasTypeDeclaration } from "./convertAliasTypeDeclaration";
import { convertEnumTypeDeclaration } from "./convertEnumTypeDeclaration";
import { convertObjectTypeDeclaration } from "./convertObjectTypeDeclaration";
import { convertUnionTypeDeclaration } from "./convertUnionTypeDeclaration";
import { getReferencedTypesFromRawDeclaration } from "./getReferencedTypesFromRawDeclaration";

export function convertTypeDeclaration({
    typeName,
    typeDeclaration,
    file,
    typeResolver,
}: {
    typeName: string;
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): TypeDeclaration {
    return {
        ...convertDeclaration(typeDeclaration),
        name: {
            fernFilepath: file.fernFilepath,
            fernFilepathV2: file.fernFilepathV2,
            name: typeName,
            nameV2: file.casingsGenerator.generateNameCasingsV1(typeName),
            nameV3: file.casingsGenerator.generateName(typeName),
        },
        shape: convertType({ typeDeclaration, file, typeResolver }),
        referencedTypes: getReferencedTypesFromRawDeclaration({ typeDeclaration, file, typeResolver }),
    };
}

export function convertType({
    typeDeclaration,
    file,
    typeResolver,
}: {
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): Type {
    return visitRawTypeDeclaration<Type>(typeDeclaration, {
        alias: (alias) => convertAliasTypeDeclaration({ alias, file, typeResolver }),
        object: (object) => convertObjectTypeDeclaration({ object, file }),
        union: (union) => convertUnionTypeDeclaration({ union, file, typeResolver }),
        enum: (enum_) => convertEnumTypeDeclaration({ _enum: enum_, file }),
    });
}
