import { TypeName, WebSocketOperation } from "@fern-api/api";
import {
    DependencyManager,
    ErrorResolver,
    getTextOfTsKeyword,
    ModelContext,
    TypeResolver,
} from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { generateResponse } from "../commons/generate-response/generateResponse";
import { getServiceTypeReference } from "../commons/service-type-reference/get-service-type-reference/getServiceTypeReference";
import { ServiceTypesConstants } from "../constants";
import { getMetadataForWebSocketOperationType } from "./getMetadataForWebSocketOperationType";
import { GeneratedWebSocketOperationTypes } from "./types";

export declare namespace generateResponseTypes {
    export interface Args {
        channelName: TypeName;
        operation: WebSocketOperation;
        modelContext: ModelContext;
        typeResolver: TypeResolver;
        errorResolver: ErrorResolver;
        dependencyManager: DependencyManager;
    }

    export type Return = GeneratedWebSocketOperationTypes["response"];
}

export function generateResponseTypes({
    channelName,
    operation,
    modelContext,
    typeResolver,
    errorResolver,
    dependencyManager,
}: generateResponseTypes.Args): generateResponseTypes.Return {
    const { reference, successBodyReference, errorBodyReference } = generateResponse({
        modelContext,
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
                modelContext,
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
            channelName,
            operationId: operation.operationId,
            type: ServiceTypesConstants.Commons.Response.TYPE_NAME,
        }),
        successBodyMetadata: getMetadataForWebSocketOperationType({
            channelName,
            operationId: operation.operationId,
            type: ServiceTypesConstants.Commons.Response.Success.Properties.Body.TYPE_NAME,
        }),
        errorBodyMetadata: getMetadataForWebSocketOperationType({
            channelName,
            operationId: operation.operationId,
            type: ServiceTypesConstants.Commons.Response.Error.Properties.Body.TYPE_NAME,
        }),
    });

    return { reference, successBodyReference, errorBodyReference };
}
