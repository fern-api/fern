import { TypeName, WebSocketOperation } from "@fern-api/api";
import { DependencyManager, getTextOfTsKeyword } from "@fern-typescript/commons";
import { GeneratedWebSocketOperationTypes, ModelContext } from "@fern-typescript/model-context";
import { ts } from "ts-morph";
import { generateResponse } from "../commons/generate-response/generateResponse";
import { ServiceTypesConstants } from "../constants";
import { createWebSocketChannelTypeFileWriter } from "./createWebSocketChannelTypeFileWriter";

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
            modelContext.getReferenceToWebSocketChannelType({
                reference,
                referencedIn,
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
