import { Type, TypeDefinition } from "@fernapi/ir-generation";
import { Directory } from "ts-morph";
import { getFilePathForType } from "../utils/getFilePathForType";
import { TypeResolver } from "../utils/TypeResolver";
import { generateEnumType } from "./enum/generateEnumType";
import { generateAliasType } from "./generateAliasType";
import { generateObjectType } from "./generateObjectType";
import { generateUnionType } from "./union/generateUnionType";

export function generateType({
    type,
    typeResolver,
    directory,
}: {
    type: TypeDefinition;
    typeResolver: TypeResolver;
    directory: Directory;
}): void {
    const file = directory.createSourceFile(
        getFilePathForType({
            modelDirectory: directory,
            typeName: type.name,
        })
    );

    Type.visit(type.shape, {
        object: (object) =>
            generateObjectType({
                file,
                typeDefinition: type,
                shape: object,
                modelDirectory: directory,
            }),
        union: (union) =>
            generateUnionType({
                file,
                typeDefinition: type,
                shape: union,
                typeResolver,
                modelDirectory: directory,
            }),
        alias: (alias) =>
            generateAliasType({
                file,
                typeDefinition: type,
                shape: alias,
                modelDirectory: directory,
            }),
        enum: (_enum) =>
            generateEnumType({
                file,
                typeDefinition: type,
                shape: _enum,
            }),
        unknown: (type) => {
            throw new Error("Unexpected type: " + type);
        },
    });
}
