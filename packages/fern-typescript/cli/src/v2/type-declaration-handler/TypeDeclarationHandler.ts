import { EnumTypeDeclaration, Type, TypeDeclaration } from "@fern-fern/ir-model";
import { DeclarationHandlerArgs } from "../client/types";
import { getGeneratedTypeName } from "../client/utils/getGeneratedTypeName";
import { generateEnumType } from "./enum/generateEnumType";
import { generateAliasType } from "./generateAliasType";
import { generateObjectType } from "./generateObjectType";
import { generateUnionType } from "./union/generateUnionType";
import { getResolvedValueTypeForSingleUnionType } from "./union/utils";

export interface TypeDeclarationHandler {
    run: (typeDeclaration: TypeDeclaration, args: DeclarationHandlerArgs) => Promise<void>;
}

export const TypeDeclarationHandler: TypeDeclarationHandler = {
    run: async (typeDeclaration, args) => {
        const typeName = getGeneratedTypeName(typeDeclaration.name);
        await args.withFile((file) => {
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
                        discriminant: unionTypeDeclaration.discriminant,
                        resolvedTypes: unionTypeDeclaration.types.map((singleUnionType) => ({
                            docs: singleUnionType.docs,
                            discriminantValue: singleUnionType.discriminantValue,
                            valueType: getResolvedValueTypeForSingleUnionType({
                                valueType: singleUnionType.valueType,
                                file,
                            }),
                        })),
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
        });
    },
};
