import { TypeName, WebSocketOperation } from "@fern-api/api";
import { getTextOfTsKeyword, getTextOfTsNode, ModelContext, TypeResolver } from "@fern-typescript/commons";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { GeneratedRequest, generateRequest } from "../commons/generate-request/generateRequest";
import { getServiceTypeReference } from "../commons/service-type-reference/get-service-type-reference/getServiceTypeReference";
import { ServiceTypesConstants } from "../constants";
import { getMetadataForWebSocketOperationType } from "./getMetadataForWebSocketOperationType";

export declare namespace generateRequestTypes {
    export interface Args {
        channelName: TypeName;
        operation: WebSocketOperation;
        modelContext: ModelContext;
        typeResolver: TypeResolver;
    }
}

export function generateRequestTypes({
    channelName,
    operation,
    modelContext,
    typeResolver,
}: generateRequestTypes.Args): GeneratedRequest {
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
            getServiceTypeReference({
                reference,
                referencedIn,
                modelContext,
            }),
        body: {
            type: operation.request.type,
            docs: operation.request.docs,
        },
        typeResolver,
        additionalProperties,
        requestMetadata: getMetadataForWebSocketOperationType({
            channelName,
            operationId: operation.operationId,
            type: ServiceTypesConstants.Commons.Request.TYPE_NAME,
        }),
        requestBodyMetadata: getMetadataForWebSocketOperationType({
            channelName,
            operationId: operation.operationId,
            type: ServiceTypesConstants.Commons.Request.Properties.Body.TYPE_NAME,
        }),
    });
}
