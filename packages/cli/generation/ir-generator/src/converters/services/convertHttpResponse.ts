import { RelativeFilePath } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFilepath } from "@fern-fern/ir-model/commons";
import { HttpResponse } from "@fern-fern/ir-model/services/http";
import { TypeReference } from "@fern-fern/ir-model/types";
import { createTypeReferenceParser } from "../../utils/parseInlineType";

export function convertHttpResponse({
    response,
    fernFilepath,
    imports,
}: {
    response: RawSchemas.HttpResponseSchema | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, RelativeFilePath>;
}): HttpResponse {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });
    return {
        docs: typeof response !== "string" ? response?.docs : undefined,
        type: response != null ? parseTypeReference(response) : TypeReference.void(),
    };
}
