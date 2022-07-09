import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFilepath } from "@fern-fern/ir-model";
import { CustomWireMessageEncoding, HttpRequest } from "@fern-fern/ir-model/services";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { convertEncoding } from "./convertEncoding";

export function convertHttpRequest({
    request,
    fernFilepath,
    imports,
    nonStandardEncodings,
}: {
    request: RawSchemas.HttpRequestSchema | null | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
    nonStandardEncodings: CustomWireMessageEncoding[];
}): HttpRequest {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });
    return {
        docs: typeof request !== "string" ? request?.docs : undefined,
        encoding: convertEncoding({
            rawEncoding: typeof request !== "string" ? request?.encoding : undefined,
            nonStandardEncodings,
        }),
        type: request != null ? parseTypeReference(request) : TypeReference.void(),
    };
}
