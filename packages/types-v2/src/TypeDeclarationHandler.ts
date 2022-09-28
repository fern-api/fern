import { EnumTypeDeclaration, Type, TypeDeclaration } from "@fern-fern/ir-model/types";
import { SdkDeclarationHandler, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { generateEnumType } from "./enum/generateEnumType";
import { generateAliasType } from "./generateAliasType";
import { generateObjectType } from "./generateObjectType";
import { generateUnionType } from "./union/generateUnionType";

export declare namespace TypeDeclarationHandler {
    export interface Args extends Omit<SdkDeclarationHandler.Args, "file"> {
        typeFile: SdkFile;
        schemaFile: SdkFile;
    }
}

export const TypeDeclarationHandler: SdkDeclarationHandler<TypeDeclaration, TypeDeclarationHandler.Args> = {
    run: async (typeDeclaration, { typeFile, schemaFile, exportedName: typeName }) => {
        Type._visit(typeDeclaration.shape, {
            object: (objectTypeDeclaration) => {
                generateObjectType({
                    typeName,
                    typeDeclaration,
                    typeFile,
                    schemaFile,
                    shape: objectTypeDeclaration,
                });
            },
            union: (unionTypeDeclaration) => {
                generateUnionType({
                    typeFile,
                    schemaFile,
                    typeName,
                    typeDeclaration,
                    union: unionTypeDeclaration,
                });
            },
            alias: (aliasTypeDeclaration) => {
                generateAliasType({
                    typeName,
                    typeDeclaration,
                    typeFile,
                    schemaFile,
                    shape: aliasTypeDeclaration,
                });
            },
            enum: (enumTypeDeclaration: EnumTypeDeclaration) => {
                generateEnumType({
                    typeName,
                    typeDeclaration,
                    typeFile,
                    schemaFile,
                    shape: enumTypeDeclaration,
                });
            },
            _unknown: () => {
                throw new Error("Unknown declaration type: " + typeDeclaration.shape._type);
            },
        });
    },
};
