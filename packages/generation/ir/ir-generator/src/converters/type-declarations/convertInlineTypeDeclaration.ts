import { RelativeFilePath } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFilepath, Type, TypeReference } from "@fern-fern/ir-model";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { convertType } from "./convertTypeDeclaration";

export function convertInlineTypeDeclaration<T>({
    typeDeclarationOrShorthand,
    getTypeDeclaration,
    fernFilepath,
    imports,
}: {
    typeDeclarationOrShorthand: T | string | null | undefined;
    getTypeDeclaration: (value: T) => RawSchemas.TypeDeclarationSchema | string | null | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, RelativeFilePath>;
}): Type {
    if (typeDeclarationOrShorthand == null) {
        return Type.alias({ aliasOf: TypeReference.void() });
    }

    if (typeof typeDeclarationOrShorthand === "string") {
        const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });
        return Type.alias({ aliasOf: parseTypeReference(typeDeclarationOrShorthand) });
    }

    const typeDeclaration = getTypeDeclaration(typeDeclarationOrShorthand);
    return convertType({ typeDeclaration, fernFilepath, imports });
}
