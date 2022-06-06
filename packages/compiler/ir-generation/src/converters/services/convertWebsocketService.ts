import { CustomWireMessageEncoding, FernFilepath, WebSocketMessenger, WebSocketService } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { convertEncoding } from "./convertEncoding";
import { convertResponseErrors } from "./convertResponseErrors";

export function convertWebsocketService({
    serviceDefinition,
    fernFilepath,
    serviceId,
    imports,
    nonStandardEncodings,
}: {
    serviceId: string;
    serviceDefinition: RawSchemas.WebSocketServiceSchema;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
    nonStandardEncodings: CustomWireMessageEncoding[];
}): WebSocketService {
    return {
        docs: serviceDefinition.docs,
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
                      // TODO write converter
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      request: undefined!,
                      response: {
                          docs: typeof message.response !== "string" ? message.response?.docs : undefined,
                          encoding: convertEncoding({
                              rawEncoding:
                                  typeof message.response !== "string" ? message.response?.encoding : undefined,
                              nonStandardEncodings,
                          }),
                          // TODO write converter
                          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                          ok: undefined!,
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
