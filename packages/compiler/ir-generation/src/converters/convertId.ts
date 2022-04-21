import { FernFilepath, PrimitiveType, Type, TypeDefinition, TypeReference } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { getDocs } from "../utils/getDocs";
import { createInlinableTypeParser } from "../utils/parseInlineType";

export function convertId({
    id,
    fernFilepath,
    imports,
}: {
    id: RawSchemas.IdSchema;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): TypeDefinition {
    const parseInlinableType = createInlinableTypeParser({ fernFilepath, imports });

    return {
        docs: getDocs(id),
        name: {
            fernFilepath,
            name: typeof id === "string" ? id : id.name,
        },
        shape: Type.alias({
            aliasOf:
                typeof id === "string" || id.type == null
                    ? TypeReference.primitive(PrimitiveType.String)
                    : parseInlinableType(id.type),
            isId: true,
        }),
    };
}
