import {
    PathParameterLocation,
    WebsocketChannel,
    WebsocketMessage,
    WebsocketMessageBody,
    WebsocketMessageId
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
    channel: RawSchemas.WebsocketChannelSchema;
    variableResolver: VariableResolver;
    file: FernFileContext;
}): Promise<WebsocketChannel> {
    const endpointPathParameters = await convertPathParameters({
        pathParameters: channel["path-parameters"] ?? {},
        location: PathParameterLocation.Endpoint,
        file,
        variableResolver
    });
    const messages: Record<WebsocketMessageId, WebsocketMessage> = {};
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
    body: RawSchemas.WebsocketChannelMessageBodySchema;
    file: FernFileContext;
}): WebsocketMessageBody {
    if (typeof body === "string") {
        return WebsocketMessageBody.reference({
            docs: undefined,
            bodyType: file.parseTypeReference(body)
        });
    } else if (isReferencedWebhookPayloadSchema(body)) {
        return WebsocketMessageBody.reference({
            docs: undefined,
            bodyType: file.parseTypeReference(body.type)
        });
    } else {
        return WebsocketMessageBody.inlinedBody({
            name: file.casingsGenerator.generateName(body.name),
            extends: getExtensionsAsList(body.extends ?? []).map((extended) =>
                parseTypeName({ typeName: extended, file })
            ),
            properties: []
        });
    }
}

export function isReferencedWebhookPayloadSchema(
    payload: RawSchemas.WebsocketChannelMessageBodySchema
): payload is RawSchemas.WebsocketChannelReferencedMessageSchema {
    return (payload as RawSchemas.WebsocketChannelReferencedMessageSchema).type != null;
}
