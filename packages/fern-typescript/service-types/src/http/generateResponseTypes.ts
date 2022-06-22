import { HttpEndpoint, TypeName } from "@fern-api/api";
import {
    DependencyManager,
    GeneratedHttpEndpointTypes,
    getTextOfTsKeyword,
    ModelContext,
} from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { generateResponse } from "../commons/generate-response/generateResponse";
import { ServiceTypesConstants } from "../constants";
import { createHttpServiceTypeFileWriter } from "./createHttpServiceTypeFileWriter";

export declare namespace generateResponseTypes {
    export interface Args {
        serviceName: TypeName;
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
        additionalProperties: [
            {
                name: ServiceTypesConstants.HttpEndpint.Response.Properties.STATUS_CODE,
                type: getTextOfTsKeyword(ts.SyntaxKind.NumberKeyword),
            },
        ],
        writeServiceTypeFile: createHttpServiceTypeFileWriter({ modelContext, serviceName, endpoint }),
    });

    return { reference, successBodyReference, errorBodyReference };
}
