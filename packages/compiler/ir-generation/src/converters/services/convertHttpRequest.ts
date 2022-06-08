import { CustomWireMessageEncoding, FernFilepath, HttpRequest } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { convertEncoding } from "./convertEncoding";
import { convertServiceTypeDefinition } from "./convertServiceTypeDefinition";

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
    return {
        docs: typeof request !== "string" ? request?.docs : undefined,
        encoding: convertEncoding({
            rawEncoding: typeof request !== "string" ? request?.encoding : undefined,
            nonStandardEncodings,
        }),
        type: convertServiceTypeDefinition({
            typeDefinitionOrShorthand: request,
            getTypeDefinition: (request) => request.type,
            fernFilepath,
            imports,
        }),
    };
}
