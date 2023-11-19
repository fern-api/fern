import { RawSchemas, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import { ExampleType, FernFilepath, Type, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { FernFileContext } from "../../FernFileContext";
import { ExampleResolver } from "../../resolvers/ExampleResolver";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { parseTypeName } from "../../utils/parseTypeName";
import { convertDeclaration } from "../convertDeclaration";
import { convertAliasTypeDeclaration } from "./convertAliasTypeDeclaration";
import { convertDiscriminatedUnionTypeDeclaration } from "./convertDiscriminatedUnionTypeDeclaration";
import { convertEnumTypeDeclaration } from "./convertEnumTypeDeclaration";
import { convertTypeExample } from "./convertExampleType";
import { convertObjectTypeDeclaration } from "./convertObjectTypeDeclaration";
import { convertUndiscriminatedUnionTypeDeclaration } from "./convertUndiscriminatedUnionTypeDeclaration";
import { getReferencedTypesFromRawDeclaration } from "./getReferencedTypesFromRawDeclaration";

export interface TypeDeclarationWithDescendantFilepaths {
    typeDeclaration: TypeDeclaration;
    descendantFilepaths: Set<FernFilepath>;
}

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
}): TypeDeclarationWithDescendantFilepaths {
    const declaration = convertDeclaration(typeDeclaration);
    const declaredTypeName = parseTypeName({
        typeName,
        file,
    });
    const referencedTypes = getReferencedTypesFromRawDeclaration({ typeDeclaration, file, typeResolver });
    return {
        typeDeclaration: {
            ...declaration,
            name: declaredTypeName,
            shape: convertType({ typeDeclaration, file, typeResolver }),
            referencedTypes: new Set(referencedTypes.map((referencedType) => referencedType.typeId)),
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
        },
        descendantFilepaths: new Set(referencedTypes.map((referencedType) => referencedType.fernFilepath)),
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
        discriminatedUnion: (union) => convertDiscriminatedUnionTypeDeclaration({ union, file, typeResolver }),
        undiscriminatedUnion: (union) => convertUndiscriminatedUnionTypeDeclaration({ union, file }),
        enum: (enum_) => convertEnumTypeDeclaration({ _enum: enum_, file }),
    });
}
