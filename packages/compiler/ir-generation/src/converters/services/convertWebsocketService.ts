import {
    CustomWireMessageEncoding,
    FernFilepath,
    WebSocketMessageOrigin,
    WebSocketMessageResponseBehavior,
    WebSocketService,
} from "@fern-api/api";
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
        basePath: serviceDefinition["base-path"],
        messages: Object.entries(serviceDefinition.messages).map(([messageName, message]) => ({
            name: messageName,
            docs: message.docs,
            origin: convertWebSocketMessageOrigin(message.origin),
            // TODO write converter
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            body: undefined!,
            response: {
                docs: typeof message.response !== "string" ? message.response?.docs : undefined,
                behavior: convertWebSocketMessageResponseBehavior(
                    typeof message.response !== "string" ? message.response?.behavior : undefined
                ),
                encoding: convertEncoding({
                    rawEncoding: typeof message.response !== "string" ? message.response?.encoding : undefined,
                    nonStandardEncodings,
                }),
                // TODO write converter
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                ok: undefined!,
                errors: convertResponseErrors({
                    rawResponseErrors: typeof message.response !== "string" ? message.response?.errors : undefined,
                    fernFilepath,
                    imports,
                }),
            },
        })),
    };
}

function convertWebSocketMessageOrigin(origin: RawSchemas.WebSocketMessageSchema["origin"]): WebSocketMessageOrigin {
    switch (origin) {
        case "client":
            return WebSocketMessageOrigin.Client;
        case "server":
            return WebSocketMessageOrigin.Server;
    }
}

function convertWebSocketMessageResponseBehavior(
    behavior: RawSchemas.WebSocketMessageResponseBehaviorSchema | undefined
): WebSocketMessageResponseBehavior {
    if (behavior == null) {
        return WebSocketMessageResponseBehavior.Ongoing;
    }
    switch (behavior) {
        case "ongoing":
            return WebSocketMessageResponseBehavior.Ongoing;
        case "request-response":
            return WebSocketMessageResponseBehavior.RequestResponse;
    }
}
