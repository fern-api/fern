import { ErrorDeclaration, Type } from "@fern-fern/ir-model";
import {
    convertAlias,
    ConvertedType,
    convertEnum,
    convertObject,
    convertUnion,
    getNameFromDeclaredTypeName,
} from "./typeConverter";

export function convertError(errorDeclaration: ErrorDeclaration): ConvertedType {
    const docs = errorDeclaration.docs ?? undefined;
    const openApiSchema = Type._visit(errorDeclaration.type, {
        alias: (aliasTypeDeclaration) => {
            return convertAlias({ aliasTypeDeclaration, docs });
        },
        enum: (enumTypeDeclaration) => {
            return convertEnum({ enumTypeDeclaration, docs });
        },
        object: (objectTypeDeclaration) => {
            return convertObject({ objectTypeDeclaration, docs });
        },
        union: (unionTypeDeclaration) => {
            return convertUnion({ unionTypeDeclaration, docs });
        },
        _unknown: () => {
            throw new Error("Encountered unknown type: " + errorDeclaration.type._type);
        },
    });
    return {
        openApiSchema,
        schemaName: getNameFromDeclaredTypeName(errorDeclaration.name),
    };
}
