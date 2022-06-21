import { FernFilepath, Type, TypeReference } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { convertType } from "../type-definitions/convertTypeDefinition";

export function convertInlinedServiceTypeDefinition<T_DefinitionOrShorthand, T_ServiceTypeReference>({
    typeDefinitionOrShorthand,
    getModelReference,
    getInlinedTypeReference,
    getTypeDefinition,
    fernFilepath,
    imports,
}: {
    typeDefinitionOrShorthand: T_DefinitionOrShorthand | string | null | undefined;
    getModelReference: (typeReference: TypeReference) => T_ServiceTypeReference;
    getInlinedTypeReference: (typeDefinition: Type) => T_ServiceTypeReference;
    getTypeDefinition: (value: T_DefinitionOrShorthand) => RawSchemas.TypeDefinitionSchema | string | null | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): T_ServiceTypeReference {
    if (typeDefinitionOrShorthand == null) {
        return getModelReference(TypeReference.void());
    }

    if (typeof typeDefinitionOrShorthand === "string") {
        const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });
        return getModelReference(parseTypeReference(typeDefinitionOrShorthand));
    }

    const rawTypeDefinition = getTypeDefinition(typeDefinitionOrShorthand);
    const typeDefinition = convertType({ typeDefinition: rawTypeDefinition, fernFilepath, imports });
    return getInlinedTypeReference(typeDefinition);
}
