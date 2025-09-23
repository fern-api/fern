import { IrVersions } from "../../ir-versions";
import { convertName, convertNameAndWireValue } from "./convertCommons";


function convertWebsocketChannels(websocketChannels: Record<IrVersions.V61.WebSocketChannelId, IrVersions.V61.WebSocketChannel>): Record<IrVersions.V60.WebSocketChannelId, IrVersions.V60.WebSocketChannel> {
    return Object.fromEntries(
        Object.entries(websocketChannels).map(([key, channel]) => [
            key,
            convertWebSocketChannel(channel)
        ])
    );
}

function convertWebSocketChannel(channel: IrVersions.V61.WebSocketChannel): IrVersions.V60.WebSocketChannel {
    return {
        ...channel,
        name: convertNameAndWireValue(channel.name),
        pathParameters: channel.pathParameters.map(pathParam => ({
            ...pathParam,
            name: convertName(pathParam.name),
            valueType: convertTypeReference(pathParam.valueType)
        })),
        queryParameters: channel.queryParameters.map(param => ({
            ...param,
            name: convertNameAndWireValue(param.name),
            valueType: convertTypeReference(param.valueType)
        })),
        headers: channel.headers.map(header => ({
            ...header,
            name: convertNameAndWireValue(header.name),
            valueType: convertTypeReference(header.valueType)
        })),
        messages: channel.messages.map(convertWebSocketMessage)
    };
}

function convertWebSocketMessage(message: IrVersions.V61.WebSocketMessage): IrVersions.V60.WebSocketMessage {
    return {
        ...message,
        name: convertName(message.name),
        body: message.body != null ? convertWebSocketMessageBody(message.body) : undefined
    };
}

function convertWebSocketMessageBody(body: IrVersions.V61.WebSocketMessageBody): IrVersions.V60.WebSocketMessageBody {
    switch (body.type) {
        case "inlinedBody":
            return {
                ...body,
                name: convertName(body.name),
                extends: body.extends.map(convertDeclaredTypeName),
                properties: body.properties.map(property => ({
                    ...property,
                    name: convertNameAndWireValue(property.name),
                    valueType: convertTypeReference(property.valueType)
                }))
            };
        case "reference":
            return {
                ...body,
                bodyType: convertTypeReference(body.bodyType)
            };
        default:
            return assertNever(body);
    }
}

