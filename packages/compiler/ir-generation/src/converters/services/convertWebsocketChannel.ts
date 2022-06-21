import {
    CustomWireMessageEncoding,
    FernFilepath,
    InlinedOperationTypeDefinition,
    InlinedOperationTypeName,
    NamedChannel,
    ServiceMessageType,
    WebSocketChannel,
    WebSocketMessenger,
    WebSocketOperationInlinedTypeReference,
    WebSocketOperationOrigin,
} from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { convertEncoding } from "./convertEncoding";
import { convertFailedResponse } from "./convertFailedResponse";
import { convertInlinedServiceTypeDefinition } from "./convertInlinedServiceTypeDefinition";

export function convertWebsocketChannel({
    channelDefinition,
    fernFilepath,
    channelId,
    imports,
    nonStandardEncodings,
    addInlinedOperationType,
}: {
    channelId: string;
    channelDefinition: RawSchemas.WebSocketChannelSchema;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
    nonStandardEncodings: CustomWireMessageEncoding[];
    addInlinedOperationType: (inlinedOperationType: InlinedOperationTypeDefinition) => void;
}): WebSocketChannel {
    const channelName: NamedChannel = {
        fernFilepath,
        name: channelId,
    };

    return {
        docs: channelDefinition.docs,
        name: channelName,
        path: channelDefinition.path,
        client: convertWebSocketMessenger({
            channelName,
            messenger: channelDefinition.client,
            origin: WebSocketOperationOrigin.Client,
            fernFilepath,
            imports,
            nonStandardEncodings,
            addInlinedOperationType,
        }),
        server: convertWebSocketMessenger({
            channelName,
            messenger: channelDefinition.server,
            origin: WebSocketOperationOrigin.Server,
            fernFilepath,
            imports,
            nonStandardEncodings,
            addInlinedOperationType,
        }),
        operationProperties: {
            id: "id",
            operation: "operation",
            body: "body",
        },
    };
}

function convertWebSocketMessenger({
    channelName,
    origin,
    messenger,
    fernFilepath,
    imports,
    nonStandardEncodings,
    addInlinedOperationType,
}: {
    channelName: NamedChannel;
    origin: WebSocketOperationOrigin;
    messenger: RawSchemas.WebSocketMessengerSchema | null | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
    nonStandardEncodings: CustomWireMessageEncoding[];
    addInlinedOperationType: (inlinedOperationType: InlinedOperationTypeDefinition) => void;
}): WebSocketMessenger {
    return {
        operations:
            messenger?.operations != null
                ? Object.entries(messenger.operations).map(([operationId, operation]) => ({
                      docs: operation.docs,
                      operationId,
                      request: {
                          docs: typeof operation.request !== "string" ? operation.request?.docs : undefined,
                          type: convertInlinedServiceTypeDefinition<
                              RawSchemas.WebSocketRequestSchema,
                              WebSocketOperationInlinedTypeReference
                          >({
                              typeDefinitionOrShorthand: operation.request,
                              getTypeDefinition: (request) => request.type,
                              getModelReference: WebSocketOperationInlinedTypeReference.model,
                              getInlinedTypeReference: (shape) => {
                                  const inlinedOperationTypeName: InlinedOperationTypeName = {
                                      channelName,
                                      operationId,
                                      origin,
                                      messageType: ServiceMessageType.Request,
                                  };
                                  addInlinedOperationType({ name: inlinedOperationTypeName, shape });
                                  return WebSocketOperationInlinedTypeReference.inlined(inlinedOperationTypeName);
                              },
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
                              type: convertInlinedServiceTypeDefinition<
                                  RawSchemas.WebSocketResponseSchema,
                                  WebSocketOperationInlinedTypeReference
                              >({
                                  typeDefinitionOrShorthand: operation.response,
                                  getTypeDefinition: (response) =>
                                      typeof response.ok == "string" ? response.ok : response.ok?.type,
                                  getModelReference: WebSocketOperationInlinedTypeReference.model,
                                  getInlinedTypeReference: (shape) => {
                                      const inlinedOperationTypeName: InlinedOperationTypeName = {
                                          channelName,
                                          operationId,
                                          origin,
                                          messageType: ServiceMessageType.Request,
                                      };
                                      addInlinedOperationType({ name: inlinedOperationTypeName, shape });
                                      return WebSocketOperationInlinedTypeReference.inlined(inlinedOperationTypeName);
                                  },
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
