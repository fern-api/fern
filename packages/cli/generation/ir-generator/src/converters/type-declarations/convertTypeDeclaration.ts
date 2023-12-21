import { FernWorkspace } from "@fern-api/workspace-loader";
import { isRawObjectDefinition, RawSchemas, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import { ExampleType, FernFilepath, Type, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { FernFileContext } from "../../FernFileContext";
import { AudienceId } from "../../filtered-ir/ids";
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
    propertiesByAudience: Record<AudienceId, Set<string>>;
}

export async function convertTypeDeclaration({
    typeName,
    typeDeclaration,
    file,
    typeResolver,
    exampleResolver,
    workspace
}: {
    typeName: string;
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    workspace: FernWorkspace;
}): Promise<TypeDeclarationWithDescendantFilepaths> {
    const declaration = await convertDeclaration(typeDeclaration);
    const declaredTypeName = parseTypeName({
        typeName,
        file
    });
    const referencedTypes = getReferencedTypesFromRawDeclaration({ typeDeclaration, file, typeResolver });

    const propertiesByAudience: Record<AudienceId, Set<string>> = {};
    if (isRawObjectDefinition(typeDeclaration)) {
        for (const [property, propertyDeclaration] of Object.entries(typeDeclaration.properties ?? {})) {
            if (typeof propertyDeclaration === "string") {
                continue;
            }
            for (const audience of propertyDeclaration.audiences ?? []) {
                if (propertiesByAudience[audience] == null) {
                    propertiesByAudience[audience] = new Set();
                }
                propertiesByAudience[audience]?.add(property);
            }
        }
    }

    return {
        propertiesByAudience,
        typeDeclaration: {
            ...declaration,
            name: declaredTypeName,
            shape: await convertType({ typeDeclaration, file, typeResolver }),
            referencedTypes: new Set(referencedTypes.map((referencedType) => referencedType.typeId)),
            examples:
                typeof typeDeclaration !== "string" && typeDeclaration.examples != null
                    ? typeDeclaration.examples.map(
                          (example): ExampleType => ({
                              name: example.name != null ? file.casingsGenerator.generateName(example.name) : undefined,
                              docs: example.docs,
                              jsonExample: exampleResolver.resolveAllReferencesInExampleOrThrow({
                                  example: example.value,
                                  file
                              }).resolvedExample,
                              shape: convertTypeExample({
                                  typeName: declaredTypeName,
                                  example: example.value,
                                  typeResolver,
                                  exampleResolver,
                                  typeDeclaration,
                                  fileContainingType: file,
                                  fileContainingExample: file,
                                  workspace
                              })
                          })
                      )
                    : []
        },
        descendantFilepaths: new Set(referencedTypes.map((referencedType) => referencedType.fernFilepath))
    };
}

export async function convertType({
    typeDeclaration,
    file,
    typeResolver
}: {
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): Promise<Type> {
    return await visitRawTypeDeclaration<Promise<Type> | Type>(typeDeclaration, {
        alias: (alias) => convertAliasTypeDeclaration({ alias, file, typeResolver }),
        object: (object) => convertObjectTypeDeclaration({ object, file }),
        discriminatedUnion: (union) => convertDiscriminatedUnionTypeDeclaration({ union, file, typeResolver }),
        undiscriminatedUnion: (union) => convertUndiscriminatedUnionTypeDeclaration({ union, file }),
        enum: (enum_) => convertEnumTypeDeclaration({ _enum: enum_, file })
    });
}
