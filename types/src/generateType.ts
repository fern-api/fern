import { Type } from "@fern-api/api";
import { ModelContext } from "@fern-typescript/model-context";
import { SourceFile } from "ts-morph";
import { generateEnumType } from "./enum/generateEnumType";
import { generateAliasType } from "./generateAliasType";
import { generateObjectType } from "./generateObjectType";
import { generateUnionType } from "./union/generateUnionType";
import { getResolvedValueTypeForSingleUnionType } from "./union/utils";

export function generateType({
    type,
    typeName,
    docs,
    modelContext,
    file,
}: {
    type: Type;
    typeName: string;
    docs: string | null | undefined;
    modelContext: ModelContext;
    file: SourceFile;
}): void {
    Type._visit(type, {
        object: (object) => {
            generateObjectType({
                file,
                typeName,
                docs,
                shape: object,
                modelContext,
            });
        },
        union: (unionTypeDeclaration) => {
            generateUnionType({
                file,
                typeName,
                docs,
                discriminant: unionTypeDeclaration.discriminant,
                resolvedTypes: unionTypeDeclaration.types.map((singleUnionType) => ({
                    docs: singleUnionType.docs,
                    discriminantValue: singleUnionType.discriminantValue,
                    valueType: getResolvedValueTypeForSingleUnionType({
                        valueType: singleUnionType.valueType,
                        modelContext,
                        file,
                    }),
                })),
                modelContext,
            });
        },
        alias: (alias) => {
            generateAliasType({
                file,
                typeName,
                docs,
                shape: alias,
                modelContext,
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
        _unknown: () => {
            throw new Error("Unexpected type: " + type._type);
        },
    });
}
