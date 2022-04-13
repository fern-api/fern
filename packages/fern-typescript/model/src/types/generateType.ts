import { Type, TypeDefinition } from "@fern/ir-generation";
import { SourceFile } from "ts-morph";
import { TypeResolver } from "../utils/TypeResolver";
import { generateEnumType } from "./enum/generateEnumType";
import { generateAliasType } from "./generateAliasType";
import { generateObjectType } from "./generateObjectType";
import { generateUnionType } from "./union/generateUnionType";

export function generateType({
    file,
    type,
    typeResolver,
}: {
    file: SourceFile;
    type: TypeDefinition;
    typeResolver: TypeResolver;
}): void {
    Type.visit(type.shape, {
        object: (object) => generateObjectType({ file, typeDefinition: type, shape: object }),
        union: (union) => generateUnionType({ file, typeDefinition: type, shape: union, typeResolver }),
        alias: (alias) => generateAliasType({ file, typeDefinition: type, shape: alias }),
        enum: (_enum) => generateEnumType({ file, typeDefinition: type, shape: _enum }),
        unknown: (type) => {
            throw new Error("Unexpected type: " + type);
        },
    });
}
