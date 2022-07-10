import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFilepath, TypeReference } from "@fern-fern/ir-model";
import { CustomWireMessageEncoding, WebSocketChannel, WebSocketMessenger } from "@fern-fern/ir-model/services";
import { createTypeReferenceParser, TypeReferenceParser } from "../../utils/parseInlineType";
import { convertEncoding } from "./convertEncoding";
import { convertResponseErrors } from "./convertResponseErrors";

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
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });
    return {
        operations:
            messenger?.operations != null
                ? Object.entries(messenger.operations).map(([operationId, operation]) => {
                      return {
                          docs: operation.docs,
                          operationId,
                          request: {
                              docs: typeof operation.request !== "string" ? operation.request?.docs : undefined,
                              type:
                                  operation.request != null
                                      ? parseTypeReference(operation.request)
                                      : TypeReference.void(),
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
                                  type: getResponseTypeReference({
                                      parseTypeReference,
                                      response: operation.response,
                                  }),
                              },
                              failed: convertResponseErrors({
                                  errors:
                                      typeof operation.response !== "string" ? operation.response?.failed : undefined,
                                  fernFilepath,
                                  imports,
                              }),
                          },
                      };
                  })
                : [],
    };
}

function getResponseTypeReference({
    parseTypeReference,
    response,
}: {
    parseTypeReference: TypeReferenceParser;
    response: RawSchemas.WebSocketResponseSchema | undefined;
}): TypeReference {
    if (response == null) {
        return TypeReference.void();
    } else if (typeof response === "string") {
        return parseTypeReference(response);
    } else if (response.ok == null) {
        return TypeReference.void();
    }
    return parseTypeReference(response.ok);
}
