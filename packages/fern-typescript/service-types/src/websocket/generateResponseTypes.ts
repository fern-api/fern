import { TypeName, WebSocketOperation } from "@fern-api/api";
import { DependencyManager, ErrorResolver, getTextOfTsKeyword, TypeResolver } from "@fern-typescript/commons";
import { Directory, ts } from "ts-morph";
import { generateResponse } from "../commons/generate-response/generateResponse";
import { getServiceTypeReference } from "../commons/service-type-reference/get-service-type-reference/getServiceTypeReference";
import { ServiceTypesConstants } from "../constants";
import { GeneratedWebSocketOperationTypes } from "./types";

export declare namespace generateResponseTypes {
    export interface Args {
        channelName: TypeName;
        operation: WebSocketOperation;
        operationDirectory: Directory;
        modelDirectory: Directory;
        servicesDirectory: Directory;
        typeResolver: TypeResolver;
        errorResolver: ErrorResolver;
        dependencyManager: DependencyManager;
    }

    export type Return = GeneratedWebSocketOperationTypes["response"];
}

export function generateResponseTypes({
    channelName,
    operation,
    operationDirectory,
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
            type: operation.response.ok.type,
            docs: operation.response.ok.docs,
        },
        failedResponse: operation.response.failed,
        getTypeReferenceToServiceType: ({ reference, referencedIn }) =>
            getServiceTypeReference({
                serviceOrChannelName: channelName,
                endpointOrOperationId: operation.operationId,
                reference,
                referencedIn,
                servicesDirectory,
                modelDirectory,
            }),
        directory: operationDirectory,
        additionalProperties: [
            {
                name: ServiceTypesConstants.WebsocketChannel.Response.Properties.ID,
                type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
            },
            {
                name: ServiceTypesConstants.WebsocketChannel.Response.Properties.REPLY_TO,
                type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
            },
        ],
    });

    return { reference, successBodyReference };
}
