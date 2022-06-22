import { TypeName, WebSocketOperation } from "@fern-api/api";
import {
    getTextOfTsKeyword,
    getTextOfTsNode,
    ModelContext,
    WebSocketChannelTypeMetadata,
} from "@fern-typescript/commons";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { GeneratedRequest, generateRequest } from "../commons/generate-request/generateRequest";
import { getWebSocketServiceTypeReference } from "../commons/service-type-reference/get-service-type-reference/getWebSocketServiceTypeReference";
import { ServiceTypesConstants } from "../constants";
import { createWebSocketChannelTypeFileWriter } from "./createWebSocketChannelTypeFileWriter";

export declare namespace generateRequestTypes {
    export interface Args {
        channelName: TypeName;
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
            getWebSocketServiceTypeReference({
                reference,
                referencedIn,
                modelContext,
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
