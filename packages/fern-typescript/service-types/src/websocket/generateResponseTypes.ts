import { TypeName, WebSocketOperation } from "@fern-api/api";
import { DependencyManager, getTextOfTsKeyword, ModelContext } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { generateResponse } from "../commons/generate-response/generateResponse";
import { getWebSocketServiceTypeReference } from "../commons/service-type-reference/get-service-type-reference/getWebSocketServiceTypeReference";
import { ServiceTypesConstants } from "../constants";
import { createWebSocketChannelTypeFileWriter } from "./createWebSocketChannelTypeFileWriter";
import { GeneratedWebSocketOperationTypes } from "./types";

export declare namespace generateResponseTypes {
    export interface Args {
        channelName: TypeName;
        operation: WebSocketOperation;
        modelContext: ModelContext;
        dependencyManager: DependencyManager;
    }

    export type Return = GeneratedWebSocketOperationTypes["response"];
}

export function generateResponseTypes({
    channelName,
    operation,
    modelContext,
    dependencyManager,
}: generateResponseTypes.Args): generateResponseTypes.Return {
    const { reference, successBodyReference, errorBodyReference } = generateResponse({
        modelContext,
        dependencyManager,
        successResponse: {
            type: operation.response.ok.type,
            docs: operation.response.ok.docs,
        },
        failedResponse: operation.response.failed,
        getTypeReferenceToServiceType: ({ reference, referencedIn }) =>
            getWebSocketServiceTypeReference({
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
        writeServiceTypeFile: createWebSocketChannelTypeFileWriter({
            channelName,
            operation,
            modelContext,
        }),
    });

    return { reference, successBodyReference, errorBodyReference };
}
