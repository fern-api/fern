import { HttpEndpoint, NamedType } from "@fern-api/api";
import { getTextOfTsKeyword, TypeResolver } from "@fern-typescript/commons";
import { Directory, ts } from "ts-morph";
import { generateResponse } from "../../../commons/generate-response/generateResponse";
import { getServiceTypeReference } from "../../../commons/service-types/get-service-type-reference/getServiceTypeReference";
import { ClientConstants } from "../../../constants";
import { GeneratedEndpointTypes } from "./types";

export declare namespace generateResponseTypes {
    export interface Args {
        serviceName: NamedType;
        endpoint: HttpEndpoint;
        endpointDirectory: Directory;
        modelDirectory: Directory;
        errorsDirectory: Directory;
        servicesDirectory: Directory;
        typeResolver: TypeResolver;
    }

    export type Return = GeneratedEndpointTypes["response"];
}

export function generateResponseTypes({
    serviceName,
    endpoint,
    endpointDirectory,
    modelDirectory,
    errorsDirectory,
    servicesDirectory,
    typeResolver,
}: generateResponseTypes.Args): generateResponseTypes.Return {
    const { reference, successBodyReference } = generateResponse({
        errorsDirectory,
        modelDirectory,
        typeResolver,
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
                name: ClientConstants.HttpService.Endpoint.Types.Response.Properties.STATUS_CODE,
                type: getTextOfTsKeyword(ts.SyntaxKind.NumberKeyword),
            },
        ],
    });

    return { reference, successBodyReference };
}
