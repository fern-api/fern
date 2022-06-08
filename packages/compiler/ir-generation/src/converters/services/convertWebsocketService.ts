import { CustomWireMessageEncoding, FernFilepath, WebSocketMessenger, WebSocketService } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { convertEncoding } from "./convertEncoding";
import { convertResponseErrors } from "./convertResponseErrors";
import { convertServiceTypeDefinition } from "./convertServiceTypeDefinition";

export function convertWebsocketService({
    serviceDefinition,
    fernFilepath,
    serviceId,
    imports,
    nonStandardEncodings,
}: {
    serviceId: string;
    serviceDefinition: RawSchemas.WebSocketChannelSchema;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
    nonStandardEncodings: CustomWireMessageEncoding[];
}): WebSocketService {
    return {
        docs: serviceDefinition.docs,
        init: {
            docs: typeof serviceDefinition.init !== "string" ? serviceDefinition.init?.docs : undefined,
            type: convertServiceTypeDefinition({
                typeDefinition: serviceDefinition.init,
                fernFilepath,
                imports,
            }),
            encoding: convertEncoding({
                rawEncoding: typeof serviceDefinition.init !== "string" ? serviceDefinition.init?.encoding : undefined,
                nonStandardEncodings,
            }),
            operationName: "_init",
        },
        name: {
            fernFilepath,
            name: serviceId,
        },
        path: serviceDefinition.path,
        client: convertWebSocketMessenger({
            messenger: serviceDefinition.client,
            fernFilepath,
            imports,
            nonStandardEncodings,
        }),
        server: convertWebSocketMessenger({
            messenger: serviceDefinition.server,
            fernFilepath,
            imports,
            nonStandardEncodings,
        }),
        messagePropertyKeys: {
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
        messages:
            messenger?.messages != null
                ? Object.entries(messenger.messages).map(([messageName, message]) => ({
                      docs: message.docs,
                      name: messageName,
                      request: {
                          docs: typeof message.request !== "string" ? message.request?.docs : undefined,
                          type: convertServiceTypeDefinition({
                              typeDefinition: message.request,
                              fernFilepath,
                              imports,
                          }),
                          encoding: convertEncoding({
                              rawEncoding: typeof message.request !== "string" ? message.request?.encoding : undefined,
                              nonStandardEncodings,
                          }),
                      },
                      response: {
                          docs: typeof message.response !== "string" ? message.response?.docs : undefined,
                          encoding: convertEncoding({
                              rawEncoding:
                                  typeof message.response !== "string" ? message.response?.encoding : undefined,
                              nonStandardEncodings,
                          }),
                          ok: convertServiceTypeDefinition({
                              typeDefinition:
                                  typeof message.response !== "string" ? message.response?.ok : message.response,
                              fernFilepath,
                              imports,
                          }),
                          errors: convertResponseErrors({
                              rawResponseErrors:
                                  typeof message.response !== "string" ? message.response?.errors : undefined,
                              fernFilepath,
                              imports,
                          }),
                      },
                  }))
                : [],
    };
}
