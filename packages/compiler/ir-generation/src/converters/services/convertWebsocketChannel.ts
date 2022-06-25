import { CustomWireMessageEncoding, FernFilepath, WebSocketChannel, WebSocketMessenger } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { convertInlineTypeDeclaration } from "../type-definitions/convertInlineTypeDeclaration";
import { convertEncoding } from "./convertEncoding";
import { convertFailedResponse } from "./convertFailedResponse";

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
    return {
        docs: channelDefinition.docs,
        name: {
            fernFilepath,
            name: channelId,
        },
        path: channelDefinition.path,
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
        operations:
            messenger?.operations != null
                ? Object.entries(messenger.operations).map(([operationId, operation]) => ({
                      docs: operation.docs,
                      operationId,
                      request: {
                          docs: typeof operation.request !== "string" ? operation.request?.docs : undefined,
                          type: convertInlineTypeDeclaration({
                              typeDeclarationOrShorthand: operation.request,
                              getTypeDeclaration: (request) => request.type,
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
                              type: convertInlineTypeDeclaration({
                                  typeDeclarationOrShorthand: operation.response,
                                  getTypeDeclaration: (response) =>
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
