import {
    FernFilepath,
    WebSocketMessageOrigin,
    WebSocketMessageResponseBehavior,
    WebSocketService,
} from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { convertResponseErrors } from "./convertResponseErrors";
import { convertWireMessage } from "./convertWireMessage";

export function convertWebsocketService({
    serviceDefinition,
    fernFilepath,
    serviceId,
    imports,
}: {
    serviceId: string;
    serviceDefinition: RawSchemas.WebSocketServiceSchema;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): WebSocketService {
    return {
        docs: serviceDefinition.docs,
        name: {
            fernFilepath,
            name: serviceId,
        },
        basePath: serviceDefinition["base-path"] ?? "/",
        messages: Object.entries(serviceDefinition.messages).map(([messageName, message]) => ({
            name: messageName,
            docs: message.docs,
            origin: convertWebSocketMessageOrigin(message.origin),
            body:
                message.body != null
                    ? convertWireMessage({ wireMessage: message.body, fernFilepath, imports })
                    : undefined,
            response:
                message.response != null
                    ? {
                          ...convertWireMessage({ wireMessage: message.response, fernFilepath, imports }),
                          behavior:
                              typeof message.response !== "string"
                                  ? convertWebSocketMessageResponseBehavior(message.response.behavior)
                                  : WebSocketMessageResponseBehavior.Ongoing,
                      }
                    : undefined,
            errors: convertResponseErrors({ rawResponseErrors: message.errors, fernFilepath, imports }),
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
