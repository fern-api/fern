import { FernFilepath, Type, TypeReference } from "@fern-api/api";
import { TypeDefinitionSchema } from "@fern-api/syntax-analysis/src/schemas";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { convertType } from "../type-definitions/convertTypeDefinition";

export function convertServiceTypeDefinition({
    typeDefinition,
    fernFilepath,
    imports,
}: {
    typeDefinition: string | TypeDefinitionSchema | null | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): Type {
    if (typeDefinition == null) {
        return Type.alias({ aliasOf: TypeReference.void() });
    }

    if (typeof typeDefinition === "string") {
        const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });
        return Type.alias({ aliasOf: parseTypeReference(typeDefinition) });
    }

    return convertType({ typeDefinition, fernFilepath, imports });
}
