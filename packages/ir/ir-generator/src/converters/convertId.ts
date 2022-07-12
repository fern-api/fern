import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFilepath, PrimitiveType, Type, TypeDeclaration, TypeReference } from "@fern-fern/ir-model";
import { getDocs } from "../utils/getDocs";
import { createTypeReferenceParser } from "../utils/parseInlineType";

export const RAW_DEFAULT_ID_TYPE = "string";
export const DEFAULT_ID_TYPE = TypeReference.primitive(PrimitiveType.String);

export function convertId({
    id,
    fernFilepath,
    imports,
}: {
    id: RawSchemas.IdSchema;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): TypeDeclaration {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });

    return {
        docs: getDocs(id),
        name: {
            fernFilepath,
            name: typeof id === "string" ? id : id.name,
        },
        shape: Type.alias({
            aliasOf: typeof id === "string" || id.type == null ? DEFAULT_ID_TYPE : parseTypeReference(id.type),
        }),
    };
}
