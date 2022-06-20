import { NamedType, WebSocketOperation } from "@fern-api/api";
import { DependencyManager, getTextOfTsKeyword, TypeResolver } from "@fern-typescript/commons";
import { generateResponse, getServiceTypeReference } from "@fern-typescript/service-types";
import { Directory, ts } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { GeneratedOperationTypes } from "./types";

export declare namespace generateResponseTypes {
    export interface Args {
        channelName: NamedType;
        operation: WebSocketOperation;
        operationDirectory: Directory;
        modelDirectory: Directory;
        servicesDirectory: Directory;
        typeResolver: TypeResolver;
        dependencyManager: DependencyManager;
    }

    export type Return = GeneratedOperationTypes["response"];
}

export function generateResponseTypes({
    channelName,
    operation,
    operationDirectory,
    modelDirectory,
    servicesDirectory,
    typeResolver,
    dependencyManager,
}: generateResponseTypes.Args): generateResponseTypes.Return {
    const { reference, successBodyReference } = generateResponse({
        modelDirectory,
        typeResolver,
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
                name: ClientConstants.WebsocketChannel.Operation.Types.Response.Properties.ID,
                type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
            },
            {
                name: ClientConstants.WebsocketChannel.Operation.Types.Response.Properties.REPLY_TO,
                type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
            },
        ],
    });

    return { reference, successBodyReference };
}
