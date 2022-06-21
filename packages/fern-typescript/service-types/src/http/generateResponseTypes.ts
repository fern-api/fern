import { HttpEndpoint, TypeName } from "@fern-api/api";
import { DependencyManager, ErrorResolver, getTextOfTsKeyword, TypeResolver } from "@fern-typescript/commons";
import { Directory, ts } from "ts-morph";
import { generateResponse } from "../commons/generate-response/generateResponse";
import { getServiceTypeReference } from "../commons/service-type-reference/get-service-type-reference/getServiceTypeReference";
import { ServiceTypesConstants } from "../constants";
import { GeneratedHttpEndpointTypes } from "./types";

export declare namespace generateResponseTypes {
    export interface Args {
        serviceName: TypeName;
        endpoint: HttpEndpoint;
        endpointDirectory: Directory;
        modelDirectory: Directory;
        servicesDirectory: Directory;
        typeResolver: TypeResolver;
        errorResolver: ErrorResolver;
        dependencyManager: DependencyManager;
    }

    export type Return = GeneratedHttpEndpointTypes["response"];
}

export function generateResponseTypes({
    serviceName,
    endpoint,
    endpointDirectory,
    modelDirectory,
    servicesDirectory,
    typeResolver,
    errorResolver,
    dependencyManager,
}: generateResponseTypes.Args): generateResponseTypes.Return {
    const { reference, successBodyReference } = generateResponse({
        modelDirectory,
        typeResolver,
        errorResolver,
        dependencyManager,
        successResponse: {
            type: endpoint.response.ok.type,
            docs: endpoint.response.ok.docs,
        },
        failedResponse: endpoint.response.failed,
        getTypeReferenceToServiceType: ({ reference, referencedIn }) =>
            getServiceTypeReference({
                serviceOrChannelName: serviceName,
                endpointOrOperationId: endpoint.endpointId,
                reference,
                referencedIn,
                servicesDirectory,
                modelDirectory,
            }),
        directory: endpointDirectory,
        additionalProperties: [
            {
                name: ServiceTypesConstants.HttpEndpint.Response.Properties.STATUS_CODE,
                type: getTextOfTsKeyword(ts.SyntaxKind.NumberKeyword),
            },
        ],
    });

    return { reference, successBodyReference };
}
