import { NamedType, WebSocketOperation } from "@fern-api/api";
import { getTextOfTsKeyword, getTextOfTsNode, TypeResolver } from "@fern-typescript/commons";
import { Directory, OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { GeneratedRequest, generateRequest } from "../../../commons/generate-request/generateRequest";
import { getServiceTypeReference } from "../../../commons/service-types/get-service-type-reference/getServiceTypeReference";
import { ClientConstants } from "../../../constants";

export declare namespace generateRequestTypes {
    export interface Args {
        channelName: NamedType;
        operation: WebSocketOperation;
        operationDirectory: Directory;
        modelDirectory: Directory;
        servicesDirectory: Directory;
        typeResolver: TypeResolver;
    }
}

export function generateRequestTypes({
    channelName,
    operation,
    operationDirectory,
    modelDirectory,
    servicesDirectory,
    typeResolver,
}: generateRequestTypes.Args): GeneratedRequest {
    const additionalProperties: OptionalKind<PropertySignatureStructure>[] = [
        {
            name: ClientConstants.WebsocketChannel.Operation.Types.Request.Properties.ID,
            type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
        },
        {
            name: ClientConstants.WebsocketChannel.Operation.Types.Request.Properties.OPERATION,
            type: getTextOfTsNode(
                ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(operation.operationId))
            ),
        },
    ];

    return generateRequest({
        directory: operationDirectory,
        modelDirectory,
        getTypeReferenceToServiceType: ({ reference, referencedIn }) =>
            getServiceTypeReference({
                serviceOrChannelName: channelName,
                endpointOrOperationId: operation.operationId,
                reference,
                referencedIn,
                servicesDirectory,
                modelDirectory,
            }),
        body: {
            type: operation.request.type,
            docs: operation.request.docs,
        },
        typeResolver,
        additionalProperties,
    });
}
