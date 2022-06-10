import { NamedType, WebSocketOperation } from "@fern-api/api";
import { getTextOfTsKeyword, TypeResolver } from "@fern-typescript/commons";
import { Directory, ts } from "ts-morph";
import { generateResponse } from "../../../commons/generate-response/generateResponse";
import { getServiceTypeReference } from "../../../commons/service-types/get-service-type-reference/getServiceTypeReference";
import { ClientConstants } from "../../../constants";
import { GeneratedOperationTypes } from "./types";

export declare namespace generateResponseTypes {
    export interface Args {
        channelName: NamedType;
        operation: WebSocketOperation;
        operationDirectory: Directory;
        modelDirectory: Directory;
        errorsDirectory: Directory;
        servicesDirectory: Directory;
        typeResolver: TypeResolver;
    }

    export type Return = GeneratedOperationTypes["response"];
}

export function generateResponseTypes({
    channelName,
    operation,
    operationDirectory,
    modelDirectory,
    errorsDirectory,
    servicesDirectory,
    typeResolver,
}: generateResponseTypes.Args): generateResponseTypes.Return {
    const { reference, successBodyReference } = generateResponse({
        errorsDirectory,
        modelDirectory,
        typeResolver,
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
