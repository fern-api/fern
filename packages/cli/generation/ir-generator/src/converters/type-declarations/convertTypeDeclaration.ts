import { RawSchemas, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import { ExampleType, Type, TypeDeclaration } from "@fern-fern/ir-model/types";
import { FernFileContext } from "../../FernFileContext";
import { ExampleResolver } from "../../resolvers/ExampleResolver";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { parseTypeName } from "../../utils/parseTypeName";
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
    const declaredTypeName = parseTypeName({
        typeName,
        file,
    });
    return {
        ...declaration,
        name: declaredTypeName,
        shape: convertType({ typeDeclaration, file, typeResolver }),
        referencedTypes: getReferencedTypesFromRawDeclaration({ typeDeclaration, file, typeResolver }),
        examples:
            typeof typeDeclaration !== "string" && typeDeclaration.examples != null
                ? typeDeclaration.examples.map(
                      (example): ExampleType => ({
                          name: example.name != null ? file.casingsGenerator.generateName(example.name) : undefined,
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
                              fileContainingType: file,
                              fileContainingExample: file,
                          }),
                      })
                  )
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
