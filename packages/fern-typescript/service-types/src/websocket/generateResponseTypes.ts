import { TypeName, WebSocketOperation } from "@fern-api/api";
import { DependencyManager, ErrorResolver, getTextOfTsKeyword, TypeResolver } from "@fern-typescript/commons";
import { Directory, ts } from "ts-morph";
import { generateResponse } from "../commons/generate-response/generateResponse";
import { getServiceTypeReference } from "../commons/service-type-reference/get-service-type-reference/getServiceTypeReference";
import { ServiceTypesConstants } from "../constants";
import { getMetadataForWebSocketOperationType } from "./getMetadataForWebSocketOperationType";
import { GeneratedWebSocketOperationTypes } from "./types";

export declare namespace generateResponseTypes {
    export interface Args {
        channelName: TypeName;
        operation: WebSocketOperation;
        modelDirectory: Directory;
        typeResolver: TypeResolver;
        errorResolver: ErrorResolver;
        dependencyManager: DependencyManager;
    }

    export type Return = GeneratedWebSocketOperationTypes["response"];
}

export function generateResponseTypes({
    channelName,
    operation,
    modelDirectory,
    typeResolver,
    errorResolver,
    dependencyManager,
}: generateResponseTypes.Args): generateResponseTypes.Return {
    const { reference, successBodyReference, errorBodyReference } = generateResponse({
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
                reference,
                referencedIn,
                modelDirectory,
            }),
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
        responseMetadata: getMetadataForWebSocketOperationType({
            modelDirectory,
            channelName,
            operationId: operation.operationId,
            type: ServiceTypesConstants.Commons.Response.TYPE_NAME,
        }),
        successBodyMetadata: getMetadataForWebSocketOperationType({
            modelDirectory,
            channelName,
            operationId: operation.operationId,
            type: ServiceTypesConstants.Commons.Response.Success.Properties.Body.TYPE_NAME,
        }),
        errorBodyMetadata: getMetadataForWebSocketOperationType({
            modelDirectory,
            channelName,
            operationId: operation.operationId,
            type: ServiceTypesConstants.Commons.Response.Error.Properties.Body.TYPE_NAME,
        }),
    });

    return { reference, successBodyReference, errorBodyReference };
}
