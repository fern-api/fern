import { Type, TypeDefinition } from "@fern-api/api";
import { getFilePathForType, withSourceFile } from "@fern-api/typescript-commons";
import { Directory } from "ts-morph";
import { TypeResolver } from "../utils/TypeResolver";
import { generateEnumType } from "./enum/generateEnumType";
import { generateAliasType } from "./generateAliasType";
import { generateObjectType } from "./generateObjectType";
import { generateUnionType } from "./union/generateUnionType";

export function generateType({
    type,
    typeResolver,
    modelDirectory,
}: {
    type: TypeDefinition;
    typeResolver: TypeResolver;
    modelDirectory: Directory;
}): void {
    const filepath = getFilePathForType({
        modelDirectory,
        typeName: type.name,
    });

    withSourceFile({ directory: modelDirectory, filepath }, (file) => {
        Type._visit(type.shape, {
            object: (object) => {
                generateObjectType({
                    file,
                    typeDefinition: type,
                    shape: object,
                    modelDirectory,
                });
            },
            union: (union) => {
                generateUnionType({
                    file,
                    typeDefinition: type,
                    shape: union,
                    typeResolver,
                    modelDirectory,
                });
            },
            alias: (alias) => {
                generateAliasType({
                    file,
                    typeDefinition: type,
                    shape: alias,
                    modelDirectory,
                });
            },
            enum: (_enum) => {
                generateEnumType({
                    file,
                    typeDefinition: type,
                    shape: _enum,
                });
            },
            unknown: (type) => {
                throw new Error("Unexpected type: " + type);
            },
        });
    });
}
