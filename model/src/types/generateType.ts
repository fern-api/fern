import { Type } from "@fern-api/api";
import { Directory, SourceFile } from "ts-morph";
import { TypeResolver } from "../utils/TypeResolver";
import { generateEnumType } from "./enum/generateEnumType";
import { generateAliasType } from "./generateAliasType";
import { generateObjectType } from "./generateObjectType";
import { generateUnionType } from "./union/generateUnionType";

export function generateType({
    type,
    typeName,
    docs,
    typeResolver,
    modelDirectory,
    file,
}: {
    type: Type;
    typeName: string;
    docs: string | null | undefined;
    typeResolver: TypeResolver;
    modelDirectory: Directory;
    file: SourceFile;
}): void {
    Type._visit(type, {
        object: (object) => {
            generateObjectType({
                file,
                typeName,
                docs,
                shape: object,
                modelDirectory,
            });
        },
        union: (unionTypeDefinition) => {
            generateUnionType({
                file,
                typeName,
                docs,
                unionTypeDefinition,
                typeResolver,
                modelDirectory,
            });
        },
        alias: (alias) => {
            generateAliasType({
                file,
                typeName,
                docs,
                shape: alias,
                modelDirectory,
            });
        },
        enum: (_enum) => {
            generateEnumType({
                file,
                typeName,
                docs,
                shape: _enum,
            });
        },
        unknown: (type) => {
            throw new Error("Unexpected type: " + type);
        },
    });
}
