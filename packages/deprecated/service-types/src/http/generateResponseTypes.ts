import { FernConstants } from "@fern-fern/ir-model/ir";
import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
import { DependencyManager } from "@fern-typescript/commons";
import { GeneratedHttpEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { generateResponse } from "../commons/generate-response/generateResponse";
import { createHttpServiceTypeFileWriter } from "./createHttpServiceTypeFileWriter";

export declare namespace generateResponseTypes {
    export interface Args {
        serviceName: DeclaredServiceName;
        endpoint: HttpEndpoint;
        modelContext: ModelContext;
        dependencyManager: DependencyManager;
        fernConstants: FernConstants;
    }

    export type Return = GeneratedHttpEndpointTypes["response"];
}

export function generateResponseTypes({
    serviceName,
    endpoint,
    modelContext,
    dependencyManager,
    fernConstants,
}: generateResponseTypes.Args): generateResponseTypes.Return {
    const { reference, successBodyReference, errorBodyReference } = generateResponse({
        modelContext,
        dependencyManager,
        successResponse: {
            typeReference: endpoint.response.type,
            docs: endpoint.response.docs,
        },
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
