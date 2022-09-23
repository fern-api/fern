import { EnumTypeDeclaration, Type, TypeDeclaration } from "@fern-fern/ir-model/types";
import { SdkDeclarationHandler } from "@fern-typescript/sdk-declaration-handler";
import { generateEnumType } from "./enum/generateEnumType";
import { generateAliasType } from "./generateAliasType";
import { generateObjectType } from "./generateObjectType";
import { generateUnionType } from "./union/generateUnionType";

export const TypeDeclarationHandler: SdkDeclarationHandler<TypeDeclaration> = {
    run: async (typeDeclaration, { file }) => {
        const typeName = file.sourceFile.getBaseNameWithoutExtension();

        Type._visit(typeDeclaration.shape, {
            object: (objectTypeDeclaration) => {
                generateObjectType({
                    typeName,
                    docs: typeDeclaration.docs,
                    file,
                    shape: objectTypeDeclaration,
                });
            },
            union: (unionTypeDeclaration) => {
                generateUnionType({
                    file,
                    typeName,
                    docs: typeDeclaration.docs,
                    union: unionTypeDeclaration,
                });
            },
            alias: (aliasTypeDeclaration) => {
                generateAliasType({
                    typeName,
                    docs: typeDeclaration.docs,
                    file,
                    shape: aliasTypeDeclaration,
                });
            },
            enum: (enumTypeDeclaration: EnumTypeDeclaration) => {
                generateEnumType({
                    typeName,
                    docs: typeDeclaration.docs,
                    file,
                    shape: enumTypeDeclaration,
                });
            },
            _unknown: () => {
                throw new Error("Unknown declaration type: " + typeDeclaration.shape._type);
            },
        });
    },
};
