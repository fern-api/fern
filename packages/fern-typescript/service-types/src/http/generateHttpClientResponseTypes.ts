import { FernConstants } from "@fern-fern/ir-model";
import { HttpEndpoint, ServiceName } from "@fern-fern/ir-model/services";
import { DependencyManager } from "@fern-typescript/commons";
import { GeneratedHttpClientEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { generateResponse } from "../commons/generate-response/generateResponse";
import { generateServiceTypeReference } from "../commons/service-type-reference/generateServiceTypeReference";
import { createHttpServiceTypeFileWriter } from "./createHttpServiceTypeFileWriter";

export declare namespace generateHttpClientResponseTypes {
    export interface Args {
        serviceName: ServiceName;
        endpoint: HttpEndpoint;
        modelContext: ModelContext;
        dependencyManager: DependencyManager;
        fernConstants: FernConstants;
    }

    export type Return = GeneratedHttpClientEndpointTypes["response"];
}

export function generateHttpClientResponseTypes({
    serviceName,
    endpoint,
    modelContext,
    dependencyManager,
    fernConstants,
}: generateHttpClientResponseTypes.Args): generateHttpClientResponseTypes.Return {
    const successBodyReference = generateServiceTypeReference({
        typeReference: endpoint.response.type,
    });

    const { reference, errorBodyReference } = generateResponse({
        modelContext,
        dependencyManager,
        successBodyReference,
        responseErrors: endpoint.errors,
        getTypeReferenceToServiceType: ({ reference, referencedIn }) =>
            modelContext.getReferenceToHttpServiceType({
                reference,
                referencedIn,
            }),
        writeServiceTypeFile: createHttpServiceTypeFileWriter({ modelContext, serviceName, endpoint }),
        fernConstants,
    });

    return { reference, successBodyReference, errorBodyReference };
}
