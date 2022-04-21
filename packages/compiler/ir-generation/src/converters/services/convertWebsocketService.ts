import {
    FernFilepath,
    WebSocketMessageOrigin,
    WebSocketMessageResponseBehavior,
    WebSocketService,
} from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { getDocs } from "../../utils/getDocs";
import { createInlinableTypeParser } from "../../utils/parseInlineType";
import { convertErrorReferences } from "./convertErrorReferences";

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
    const parseInlinableType = createInlinableTypeParser({ fernFilepath, imports });

    return {
        docs: serviceDefinition.docs,
        name: {
            fernFilepath,
            name: serviceId,
        },
        displayName: serviceDefinition.name ?? serviceId,
        basePath: serviceDefinition["base-path"] ?? "/",
        messages: Object.entries(serviceDefinition.messages).map(([messageName, message]) => ({
            name: messageName,
            docs: message.docs,
            origin: convertWebSocketMessageOrigin(message.origin),
            body:
                message.body != null
                    ? {
                          docs: getDocs(message.body),
                          bodyType: parseInlinableType(message.body),
                      }
                    : undefined,
            response:
                message.response != null
                    ? {
                          docs: typeof message.response !== "string" ? message.response.docs : undefined,
                          bodyType: parseInlinableType(message.response),
                          behavior:
                              typeof message.response !== "string"
                                  ? convertWebSocketMessageResponseBehavior(message.response.behavior)
                                  : WebSocketMessageResponseBehavior.Ongoing,
                      }
                    : undefined,
            errors: convertErrorReferences({ errors: message.errors, fernFilepath, imports }),
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
