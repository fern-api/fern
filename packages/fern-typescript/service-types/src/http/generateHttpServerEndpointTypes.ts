import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services";
import { GeneratedHttpServerEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { generateHttpRequestTypes } from "./generateHttpRequestTypes";
import { generateHttpServerResponseType } from "./generateHttpServerResponseType";

export function generateHttpServerEndpointTypes({
    service,
    endpoint,
    modelContext,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    modelContext: ModelContext;
}): GeneratedHttpServerEndpointTypes {
    return {
        request: generateHttpRequestTypes({
            service,
            endpoint,
            modelContext,
            mode: "server",
        }),
        response: generateHttpServerResponseType({
            serviceName: service.name,
            endpoint,
            modelContext,
        }),
    };
}
