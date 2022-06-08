import { ErrorDefinition, FernFilepath } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { convertType } from "./type-definitions/convertTypeDefinition";

export function convertErrorDefinition({
    errorName,
    fernFilepath,
    errorDefinition,
    imports,
}: {
    errorName: string;
    fernFilepath: FernFilepath;
    errorDefinition: RawSchemas.ErrorDefinitionSchema;
    imports: Record<string, string>;
}): ErrorDefinition {
    return {
        name: {
            name: errorName,
            fernFilepath,
        },
        docs: errorDefinition.docs,
        http:
            errorDefinition.http != null
                ? {
                      statusCode: errorDefinition.http.statusCode,
                  }
                : undefined,
        type: convertType({ typeDefinition: errorDefinition.type, fernFilepath, imports }),
    };
}
