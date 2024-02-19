import {
    PathParameterLocation,
    WebSocketChannel,
    WebSocketMessage,
    WebSocketMessageBody,
    WebSocketMessageId
} from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../FernFileContext";
import { VariableResolver } from "../resolvers/VariableResolver";
import { parseTypeName } from "../utils/parseTypeName";
import { convertAvailability, convertDeclaration } from "./convertDeclaration";
import { constructHttpPath } from "./services/constructHttpPath";
import { convertPathParameters, getQueryParameterName } from "./services/convertHttpService";
import { getExtensionsAsList } from "./type-declarations/convertObjectTypeDeclaration";

export async function convertChannel({
    channel,
    variableResolver,
    file
}: {
    channel: RawSchemas.WebSocketChannelSchema;
    variableResolver: VariableResolver;
    file: FernFileContext;
}): Promise<WebSocketChannel> {
    const messages: Record<WebSocketMessageId, WebSocketMessage> = {};
    for (const [messageId, message] of Object.entries(channel.messages ?? {})) {
        messages[messageId] = {
            availability: undefined,
            docs: message.docs,
            origin: message.origin,
            body: convertMessageSchema({ body: message.body, file }),
            displayName: undefined
        };
    }
    return {
        availability: convertAvailability(channel.availability),
        path: constructHttpPath(channel.path),
        auth: channel.auth,
        headers: [],
        docs: channel.docs,
        pathParameters:
            channel["path-parameters"] != null
                ? await convertPathParameters({
                      pathParameters: channel["path-parameters"],
                      location: PathParameterLocation.Endpoint,
                      file,
                      variableResolver
                  })
                : [],
        queryParameters:
            channel["query-parameters"] != null
                ? await Promise.all(
                      Object.entries(channel["query-parameters"]).map(async ([queryParameterKey, queryParameter]) => {
                          const { name } = getQueryParameterName({ queryParameterKey, queryParameter });
                          const valueType = file.parseTypeReference(queryParameter);
                          return {
                              ...(await convertDeclaration(queryParameter)),
                              name: file.casingsGenerator.generateNameAndWireValue({
                                  wireValue: queryParameterKey,
                                  name
                              }),
                              valueType,
                              allowMultiple:
                                  typeof queryParameter !== "string" && queryParameter["allow-multiple"] != null
                                      ? queryParameter["allow-multiple"]
                                      : false
                          };
                      })
                  )
                : [],
        messages
    };
}

function convertMessageSchema({
    body,
    file
}: {
    body: RawSchemas.WebSocketChannelMessageBodySchema;
    file: FernFileContext;
}): WebSocketMessageBody {
    if (typeof body === "string") {
        return WebSocketMessageBody.reference({
            docs: undefined,
            bodyType: file.parseTypeReference(body)
        });
    } else if (isReferencedWebhookPayloadSchema(body)) {
        return WebSocketMessageBody.reference({
            docs: undefined,
            bodyType: file.parseTypeReference(body.type)
        });
    } else {
        return WebSocketMessageBody.inlinedBody({
            name: file.casingsGenerator.generateName(body.name),
            extends: getExtensionsAsList(body.extends ?? []).map((extended) =>
                parseTypeName({ typeName: extended, file })
            ),
            properties: []
        });
    }
}

export function isReferencedWebhookPayloadSchema(
    payload: RawSchemas.WebSocketChannelMessageBodySchema
): payload is RawSchemas.WebSocketChannelReferencedMessageSchema {
    return (payload as RawSchemas.WebSocketChannelReferencedMessageSchema).type != null;
}
