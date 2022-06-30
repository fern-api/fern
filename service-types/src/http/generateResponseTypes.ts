import { HttpEndpoint, ServiceName } from "@fern-fern/ir-model/services";
import { DependencyManager } from "@fern-typescript/commons";
import { GeneratedHttpEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { generateResponse } from "../commons/generate-response/generateResponse";
import { createHttpServiceTypeFileWriter } from "./createHttpServiceTypeFileWriter";

export declare namespace generateResponseTypes {
    export interface Args {
        serviceName: ServiceName;
        endpoint: HttpEndpoint;
        modelContext: ModelContext;
        dependencyManager: DependencyManager;
    }

    export type Return = GeneratedHttpEndpointTypes["response"];
}

export function generateResponseTypes({
    serviceName,
    endpoint,
    modelContext,
    dependencyManager,
}: generateResponseTypes.Args): generateResponseTypes.Return {
    const { reference, successBodyReference, errorBodyReference } = generateResponse({
        modelContext,
        dependencyManager,
        successResponse: {
            type: endpoint.response.ok.type,
            docs: endpoint.response.ok.docs,
        },
        failedResponse: endpoint.response.failed,
        getTypeReferenceToServiceType: ({ reference, referencedIn }) =>
            modelContext.getReferenceToHttpServiceType({
                reference,
                referencedIn,
            }),
        writeServiceTypeFile: createHttpServiceTypeFileWriter({ modelContext, serviceName, endpoint }),
    });

    return { reference, successBodyReference, errorBodyReference };
}
