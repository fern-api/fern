import { RawSchemas, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import { DeclaredTypeName, Type, TypeDeclaration } from "@fern-fern/ir-model/types";
import { FernFileContext } from "../../FernFileContext";
import { ExampleResolver } from "../../resolvers/ExampleResolver";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { convertDeclaration } from "../convertDeclaration";
import { convertAliasTypeDeclaration } from "./convertAliasTypeDeclaration";
import { convertEnumTypeDeclaration } from "./convertEnumTypeDeclaration";
import { convertTypeExample } from "./convertExampleType";
import { convertObjectTypeDeclaration } from "./convertObjectTypeDeclaration";
import { convertUnionTypeDeclaration } from "./convertUnionTypeDeclaration";
import { getReferencedTypesFromRawDeclaration } from "./getReferencedTypesFromRawDeclaration";

export function convertTypeDeclaration({
    typeName,
    typeDeclaration,
    file,
    typeResolver,
    exampleResolver,
}: {
    typeName: string;
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
}): TypeDeclaration {
    const declaration = convertDeclaration(typeDeclaration);
    const declaredTypeName: DeclaredTypeName = {
        fernFilepath: file.fernFilepath,
        name: file.casingsGenerator.generateName(typeName),
    };
    return {
        ...declaration,
        name: declaredTypeName,
        shape: convertType({ typeDeclaration, file, typeResolver }),
        referencedTypes: getReferencedTypesFromRawDeclaration({ typeDeclaration, file, typeResolver }),
        examples:
            typeof typeDeclaration !== "string" && typeDeclaration.examples != null
                ? typeDeclaration.examples.map((example) => ({
                      name: example.name,
                      docs: example.docs,
                      jsonExample: exampleResolver.resolveAllReferencesInExampleOrThrow({
                          example: example.value,
                          file,
                      }).resolvedExample,
                      shape: convertTypeExample({
                          typeName: declaredTypeName,
                          example: example.value,
                          typeResolver,
                          exampleResolver,
                          typeDeclaration,
                          file,
                      }),
                  }))
                : [],
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
