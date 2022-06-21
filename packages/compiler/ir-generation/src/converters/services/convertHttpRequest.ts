import {
    CustomWireMessageEncoding,
    FernFilepath,
    HttpRequest,
    HttpServiceTypeReference,
    InlinedServiceTypeDefinition,
    InlinedServiceTypeName,
    NamedService,
    ServiceMessageType,
} from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { convertEncoding } from "./convertEncoding";
import { convertInlinedServiceTypeDefinition } from "./convertInlinedServiceTypeDefinition";

export function convertHttpRequest({
    serviceName,
    endpointId,
    request,
    fernFilepath,
    imports,
    nonStandardEncodings,
    addInlinedServiceType,
}: {
    serviceName: NamedService;
    endpointId: string;
    request: RawSchemas.HttpRequestSchema | string | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
    nonStandardEncodings: CustomWireMessageEncoding[];
    addInlinedServiceType: (inlinedServiceType: InlinedServiceTypeDefinition) => void;
}): HttpRequest {
    return {
        docs: typeof request !== "string" ? request?.docs : undefined,
        encoding: convertEncoding({
            rawEncoding: typeof request !== "string" ? request?.encoding : undefined,
            nonStandardEncodings,
        }),
        type: convertInlinedServiceTypeDefinition<RawSchemas.HttpRequestSchema, HttpServiceTypeReference>({
            typeDefinitionOrShorthand: request,
            getTypeDefinition: (request) => request.type,
            getModelReference: HttpServiceTypeReference.model,
            getInlinedTypeReference: (shape) => {
                const inlinedServiceTypeName: InlinedServiceTypeName = {
                    serviceName,
                    endpointId,
                    messageType: ServiceMessageType.Request,
                };
                addInlinedServiceType({ name: inlinedServiceTypeName, shape });
                return HttpServiceTypeReference.inlined(inlinedServiceTypeName);
            },
            fernFilepath,
            imports,
        }),
    };
}
