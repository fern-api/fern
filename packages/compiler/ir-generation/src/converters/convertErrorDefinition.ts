import { ErrorDefinition, FernFilepath } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { getDocs } from "../utils/getDocs";
import { createInlinableTypeParser } from "../utils/parseInlineType";

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
    const parseInlinableType = createInlinableTypeParser({ fernFilepath, imports });

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
        properties:
            errorDefinition.properties != null
                ? Object.entries(errorDefinition.properties).map(([propertyName, property]) => ({
                      name: propertyName,
                      docs: getDocs(property),
                      type: parseInlinableType(property),
                  }))
                : [],
    };
}
