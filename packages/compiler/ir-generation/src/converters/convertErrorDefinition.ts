import { ErrorDefinition, FernFilepath, Type } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { createTypeReferenceParser } from "../utils/parseInlineType";
import { convertType } from "./type-definitions/convertTypeDefinition";

export function convertErrorDefinition({
    errorName,
    fernFilepath,
    errorDefinition,
    imports,
}: {
    errorName: string;
    fernFilepath: FernFilepath;
    errorDefinition: RawSchemas.ErrorDefinitionSchema | string;
    imports: Record<string, string>;
}): ErrorDefinition {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });

    return {
        name: {
            name: errorName,
            fernFilepath,
        },
        docs: typeof errorDefinition !== "string" ? errorDefinition.docs : undefined,
        http:
            typeof errorDefinition !== "string" && errorDefinition.http != null
                ? {
                      statusCode: errorDefinition.http.statusCode,
                  }
                : undefined,
        type:
            typeof errorDefinition === "string"
                ? Type.alias({
                      aliasOf: parseTypeReference(errorDefinition),
                  })
                : convertType({ typeDefinition: errorDefinition.type, fernFilepath, imports }),
    };
}
