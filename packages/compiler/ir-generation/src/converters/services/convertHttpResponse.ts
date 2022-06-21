import {
    CustomWireMessageEncoding,
    FernFilepath,
    HttpResponse,
    HttpServiceTypeReference,
    InlinedServiceTypeDefinition,
    InlinedServiceTypeName,
    NamedService,
    ServiceMessageType,
} from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { convertEncoding } from "./convertEncoding";
import { convertFailedResponse } from "./convertFailedResponse";
import { convertInlinedServiceTypeDefinition } from "./convertInlinedServiceTypeDefinition";

export function convertHttpResponse({
    serviceName,
    endpointId,
    response,
    fernFilepath,
    imports,
    nonStandardEncodings,
    addInlinedServiceType,
}: {
    serviceName: NamedService;
    endpointId: string;
    response: RawSchemas.HttpResponseSchema | string | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
    nonStandardEncodings: CustomWireMessageEncoding[];
    addInlinedServiceType: (inlinedServiceType: InlinedServiceTypeDefinition) => void;
}): HttpResponse {
    return {
        docs: typeof response !== "string" ? response?.docs : undefined,
        encoding: convertEncoding({
            rawEncoding: typeof response !== "string" ? response?.encoding : undefined,
            nonStandardEncodings,
        }),
        ok: {
            docs: typeof response !== "string" && typeof response?.ok !== "string" ? response?.ok?.docs : undefined,
            type: convertInlinedServiceTypeDefinition<RawSchemas.HttpResponseSchema, HttpServiceTypeReference>({
                typeDefinitionOrShorthand: response,
                getTypeDefinition: (response) => (typeof response.ok == "string" ? response.ok : response.ok?.type),
                getModelReference: HttpServiceTypeReference.model,
                getInlinedTypeReference: (shape) => {
                    const inlinedServiceTypeName: InlinedServiceTypeName = {
                        serviceName,
                        endpointId,
                        messageType: ServiceMessageType.OkResponse,
                    };
                    addInlinedServiceType({ name: inlinedServiceTypeName, shape });
                    return HttpServiceTypeReference.inlined(inlinedServiceTypeName);
                },
                fernFilepath,
                imports,
            }),
        },
        failed: convertFailedResponse({
            rawFailedResponse: typeof response !== "string" ? response?.failed : undefined,
            fernFilepath,
            imports,
        }),
    };
}
