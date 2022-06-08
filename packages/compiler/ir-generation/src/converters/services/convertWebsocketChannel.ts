import {
    CustomWireMessageEncoding,
    FernFilepath,
    Type,
    TypeReference,
    WebSocketChannel,
    WebSocketMessenger,
} from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { convertType } from "../type-definitions/convertTypeDefinition";
import { convertEncoding } from "./convertEncoding";
import { convertFailedResponse } from "./convertFailedResponse";
import { convertServiceTypeDefinition } from "./convertServiceTypeDefinition";

export function convertWebsocketChannel({
    channelDefinition,
    fernFilepath,
    channelId,
    imports,
    nonStandardEncodings,
}: {
    channelId: string;
    channelDefinition: RawSchemas.WebSocketChannelSchema;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
    nonStandardEncodings: CustomWireMessageEncoding[];
}): WebSocketChannel {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });
    return {
        docs: channelDefinition.docs,
        name: {
            fernFilepath,
            name: channelId,
        },
        path: channelDefinition.path,
        init: {
            docs: typeof channelDefinition.init !== "string" ? channelDefinition.init?.docs : undefined,
            type:
                channelDefinition.init != null
                    ? typeof channelDefinition.init === "string"
                        ? Type.alias({ aliasOf: parseTypeReference(channelDefinition.init) })
                        : convertType({ typeDefinition: channelDefinition.init.type, fernFilepath, imports })
                    : Type.alias({ aliasOf: TypeReference.void() }),
            encoding: convertEncoding({
                rawEncoding: typeof channelDefinition.init !== "string" ? channelDefinition.init?.encoding : undefined,
                nonStandardEncodings,
            }),
            operationId: "_init",
        },
        client: convertWebSocketMessenger({
            messenger: channelDefinition.client,
            fernFilepath,
            imports,
            nonStandardEncodings,
        }),
        server: convertWebSocketMessenger({
            messenger: channelDefinition.server,
            fernFilepath,
            imports,
            nonStandardEncodings,
        }),
        operationProperties: {
            id: "id",
            operation: "operation",
            body: "body",
        },
    };
}

function convertWebSocketMessenger({
    messenger,
    fernFilepath,
    imports,
    nonStandardEncodings,
}: {
    messenger: RawSchemas.WebSocketMessengerSchema | null | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
    nonStandardEncodings: CustomWireMessageEncoding[];
}): WebSocketMessenger {
    return {
        docs: messenger?.docs,
        operations:
            messenger?.operations != null
                ? Object.entries(messenger.operations).map(([operationId, operation]) => ({
                      docs: operation.docs,
                      operationId,
                      request: {
                          docs: typeof operation.request !== "string" ? operation.request?.docs : undefined,
                          type: convertServiceTypeDefinition({
                              typeDefinitionOrShorthand: operation.request,
                              getTypeDefinition: (request) => request.type,
                              fernFilepath,
                              imports,
                          }),
                          encoding: convertEncoding({
                              rawEncoding:
                                  typeof operation.request !== "string" ? operation.request?.encoding : undefined,
                              nonStandardEncodings,
                          }),
                      },
                      response: {
                          docs: typeof operation.response !== "string" ? operation.response?.docs : undefined,
                          encoding: convertEncoding({
                              rawEncoding:
                                  typeof operation.response !== "string" ? operation.response?.encoding : undefined,
                              nonStandardEncodings,
                          }),
                          ok: {
                              docs: typeof operation.response !== "string" ? operation.response?.docs : undefined,
                              type: convertServiceTypeDefinition({
                                  typeDefinitionOrShorthand: operation.response,
                                  getTypeDefinition: (response) =>
                                      typeof response.ok == "string" ? response.ok : response.ok?.type,
                                  fernFilepath,
                                  imports,
                              }),
                          },
                          failed: convertFailedResponse({
                              rawFailedResponse:
                                  typeof operation.response !== "string" ? operation.response?.failed : undefined,
                              fernFilepath,
                              imports,
                          }),
                      },
                  }))
                : [],
    };
}
