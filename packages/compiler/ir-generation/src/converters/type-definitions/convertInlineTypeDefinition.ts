import { FernFilepath, Type, TypeReference } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { convertType } from "./convertTypeDefinition";

export function convertInlineTypeDefinition<T>({
    typeDefinitionOrShorthand,
    getTypeDefinition,
    fernFilepath,
    imports,
}: {
    typeDefinitionOrShorthand: T | string | null | undefined;
    getTypeDefinition: (value: T) => RawSchemas.TypeDefinitionSchema | string | null | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): Type {
    if (typeDefinitionOrShorthand == null) {
        return Type.alias({ aliasOf: TypeReference.void() });
    }

    if (typeof typeDefinitionOrShorthand === "string") {
        const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });
        return Type.alias({ aliasOf: parseTypeReference(typeDefinitionOrShorthand) });
    }

    const typeDefinition = getTypeDefinition(typeDefinitionOrShorthand);
    return convertType({ typeDefinition, fernFilepath, imports });
}
