import { RelativeFilePath } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFilepath } from "@fern-fern/ir-model/commons";
import { HttpRequest } from "@fern-fern/ir-model/services/http";
import { TypeReference } from "@fern-fern/ir-model/types";
import { createTypeReferenceParser } from "../../utils/parseInlineType";

export function convertHttpRequest({
    request,
    fernFilepath,
    imports,
}: {
    request: RawSchemas.HttpRequestSchema | null | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, RelativeFilePath>;
}): HttpRequest {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });
    return {
        docs: typeof request !== "string" ? request?.docs : undefined,
        type: request != null ? parseTypeReference(request) : TypeReference.void(),
    };
}
