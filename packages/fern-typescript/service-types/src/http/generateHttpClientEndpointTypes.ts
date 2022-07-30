import { FernConstants } from "@fern-fern/ir-model";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services";
import { DependencyManager } from "@fern-typescript/commons";
import { GeneratedHttpClientEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { generateHttpClientResponseTypes } from "./generateHttpClientResponseTypes";
import { generateHttpRequestTypes } from "./generateHttpRequestTypes";

export function generateHttpClientEndpointTypes({
    service,
    endpoint,
    modelContext,
    dependencyManager,
    fernConstants,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
    fernConstants: FernConstants;
}): GeneratedHttpClientEndpointTypes {
    return {
        request: generateHttpRequestTypes({
            service,
            endpoint,
            modelContext,
            mode: "client",
        }),
        response: generateHttpClientResponseTypes({
            serviceName: service.name,
            endpoint,
            modelContext,
            dependencyManager,
            fernConstants,
        }),
    };
}
