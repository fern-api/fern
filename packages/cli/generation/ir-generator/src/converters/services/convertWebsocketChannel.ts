import { RawSchemas } from "@fern-api/yaml-schema";
import { WebSocketChannel, WebSocketMessenger } from "@fern-fern/ir-model/services/websocket";
import { TypeReference } from "@fern-fern/ir-model/types";
import { FernFileContext } from "../../FernFileContext";
import { generateWireStringWithAllCasings } from "../../utils/generateCasings";
import { convertResponseErrors } from "./convertResponseErrors";

export function convertWebsocketChannel({
    channelDefinition,
    channelId,
    file,
}: {
    channelId: string;
    channelDefinition: RawSchemas.WebSocketChannelSchema;
    file: FernFileContext;
}): WebSocketChannel {
    return {
        docs: channelDefinition.docs,
        name: {
            fernFilepath: file.fernFilepath,
            name: channelId,
        },
        path: channelDefinition.path,
        client: convertWebSocketMessenger({
            messenger: channelDefinition.client,
            file,
        }),
        server: convertWebSocketMessenger({
            messenger: channelDefinition.server,
            file,
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
    file,
}: {
    messenger: RawSchemas.WebSocketMessengerSchema | null | undefined;
    file: FernFileContext;
}): WebSocketMessenger {
    return {
        operations:
            messenger?.operations != null
                ? Object.entries(messenger.operations).map(([operationKey, operation]) => {
                      return {
                          docs: operation.docs,
                          name: generateWireStringWithAllCasings({
                              wireValue: operationKey,
                              name: operation.name ?? operationKey,
                          }),
                          request: {
                              docs: typeof operation.request !== "string" ? operation.request?.docs : undefined,
                              type:
                                  operation.request != null
                                      ? file.parseTypeReference(operation.request)
                                      : TypeReference.void(),
                          },
                          response: {
                              docs: typeof operation.response !== "string" ? operation.response?.docs : undefined,
                              type:
                                  operation.response != null
                                      ? file.parseTypeReference(operation.response)
                                      : TypeReference.void(),
                          },
                          errors: convertResponseErrors({
                              errors: operation.errors,
                              file,
                          }),
                      };
                  })
                : [],
    };
}
