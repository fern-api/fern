import { EnumTypeDeclaration, Type, TypeDeclaration } from "@fern-fern/ir-model/types";
import { GeneratorContext, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { AliasTypeGenerator } from "./alias/AliasTypeGenerator";
import { EnumTypeGenerator } from "./enum/EnumTypeGenerator";
import { ObjectTypeGenerator } from "./object/ObjectTypeGenerator";
import { UnionTypeGenerator } from "./union/UnionTypeGenerator";

export declare namespace TypeDeclarationHandler {
    export interface Args {
        typeFile: SdkFile;
        schemaFile: SdkFile;
        typeName: string;
        context: GeneratorContext;
    }
}

export function TypeDeclarationHandler(
    typeDeclaration: TypeDeclaration,
    { typeFile, schemaFile, typeName }: TypeDeclarationHandler.Args
): void {
    Type._visit(typeDeclaration.shape, {
        object: (objectTypeDeclaration) => {
            new ObjectTypeGenerator({
                typeName,
                typeDeclaration,
                shape: objectTypeDeclaration,
            }).generate({
                typeFile,
                schemaFile,
            });
        },
        union: (union) => {
            new UnionTypeGenerator({
                typeName,
                typeDeclaration,
                union,
            }).generate({ typeFile, schemaFile });
        },
        alias: (aliasTypeDeclaration) => {
            new AliasTypeGenerator({
                typeName,
                typeDeclaration,
                shape: aliasTypeDeclaration,
            }).generate({
                typeFile,
                schemaFile,
            });
        },
        enum: (enumTypeDeclaration: EnumTypeDeclaration) => {
            new EnumTypeGenerator({
                typeName,
                typeDeclaration,
                shape: enumTypeDeclaration,
            }).generate({
                typeFile,
                schemaFile,
            });
        },
        _unknown: () => {
            throw new Error("Unknown declaration type: " + typeDeclaration.shape._type);
        },
    });
}
