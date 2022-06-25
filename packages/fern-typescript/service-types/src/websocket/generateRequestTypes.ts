import { ServiceName, WebSocketOperation } from "@fern-api/api";
import { getTextOfTsKeyword, getTextOfTsNode } from "@fern-typescript/commons";
import { ModelContext, WebSocketChannelTypeMetadata } from "@fern-typescript/model-context";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { GeneratedRequest, generateRequest } from "../commons/generate-request/generateRequest";
import { ServiceTypesConstants } from "../constants";
import { createWebSocketChannelTypeFileWriter } from "./createWebSocketChannelTypeFileWriter";

export declare namespace generateRequestTypes {
    export interface Args {
        channelName: ServiceName;
        operation: WebSocketOperation;
        modelContext: ModelContext;
    }
}

export function generateRequestTypes({
    channelName,
    operation,
    modelContext,
}: generateRequestTypes.Args): GeneratedRequest<WebSocketChannelTypeMetadata> {
    const additionalProperties: OptionalKind<PropertySignatureStructure>[] = [
        {
            name: ServiceTypesConstants.WebsocketChannel.Request.Properties.ID,
            type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
        },
        {
            name: ServiceTypesConstants.WebsocketChannel.Request.Properties.OPERATION,
            type: getTextOfTsNode(
                ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(operation.operationId))
            ),
        },
    ];

    return generateRequest({
        modelContext,
        getTypeReferenceToServiceType: ({ reference, referencedIn }) =>
            modelContext.getReferenceToWebSocketChannelType({
                reference,
                referencedIn,
            }),
        body: {
            type: operation.request.type,
            docs: operation.request.docs,
        },
        additionalProperties,
        writeServiceTypeFile: createWebSocketChannelTypeFileWriter({
            channelName,
            operation,
            modelContext,
        }),
    });
}
