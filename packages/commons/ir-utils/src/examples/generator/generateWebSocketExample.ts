import {
    ExampleHeader,
    ExamplePathParameter,
    ExampleQueryParameterShape,
    ExampleWebSocketMessageBody,
    ExampleWebSocketSession,
    HttpHeader,
    IntermediateRepresentation,
    PathParameter,
    TypeDeclaration,
    TypeId,
    WebSocketChannel,
    WebSocketMessage
} from "@fern-api/ir-sdk";

import { ExampleGenerationResult } from "./ExampleGenerationResult";
import { generateTypeReferenceExample } from "./generateTypeReferenceExample";
import { isOptional } from "./isTypeReferenceOptional";

export declare namespace generateWebSocketExample {
    interface Args {
        ir: Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage">;
        channel: WebSocketChannel;
        typeDeclarations: Record<TypeId, TypeDeclaration>;
        skipOptionalRequestProperties: boolean;
    }

    interface ParameterGroup<T, K> {
        params: T[];
        add: (example: K) => void;
    }
}

export function generateWebSocketExample({
    ir,
    channel,
    typeDeclarations,
    skipOptionalRequestProperties
}: generateWebSocketExample.Args): ExampleGenerationResult<ExampleWebSocketSession> {
    const result: Omit<ExampleWebSocketSession, "url"> = {
        name: undefined,
        pathParameters: [],
        headers: [],
        queryParameters: [],
        messages: [],
        docs: undefined
    };

    const pathParameterGroups: generateWebSocketExample.ParameterGroup<PathParameter, ExamplePathParameter>[] = [
        {
            params: channel.pathParameters,
            add: (example: ExamplePathParameter) => result.pathParameters.push(example)
        },
        {
            params: channel.pathParameters,
            add: (example: ExamplePathParameter) => result.pathParameters.push(example)
        },
        {
            params: ir.pathParameters,
            add: (example: ExamplePathParameter) => result.pathParameters.push(example)
        }
    ];

    for (const group of pathParameterGroups) {
        for (const pathParameter of group.params) {
            const generatedExample = generateTypeReferenceExample({
                fieldName: pathParameter.name.originalName,
                currentDepth: 0,
                maxDepth: 1,
                typeDeclarations,
                typeReference: pathParameter.valueType,
                skipOptionalProperties: skipOptionalRequestProperties
            });
            if (generatedExample.type === "failure") {
                return generatedExample;
            }
            const { example } = generatedExample;
            group.add({
                name: pathParameter.name,
                value: example
            });
        }
    }

    for (const queryParameter of channel.queryParameters) {
        if (
            skipOptionalRequestProperties &&
            isOptional({ typeDeclarations, typeReference: queryParameter.valueType })
        ) {
            continue;
        }
        const generatedExample = generateTypeReferenceExample({
            fieldName: queryParameter.name.name.originalName,
            currentDepth: 0,
            maxDepth: 10,
            typeDeclarations,
            typeReference: queryParameter.valueType,
            skipOptionalProperties: skipOptionalRequestProperties
        });
        if (generatedExample.type === "failure") {
            return generatedExample;
        }
        const { example } = generatedExample;
        result.queryParameters.push({
            name: queryParameter.name,
            shape: queryParameter.allowMultiple
                ? ExampleQueryParameterShape.exploded()
                : ExampleQueryParameterShape.single(),
            value: example
        });
    }

    const headerGroup: generateWebSocketExample.ParameterGroup<HttpHeader, ExampleHeader>[] = [
        {
            params: channel.headers,
            add: (example: ExampleHeader) => result.headers.push(example)
        },
        {
            params: ir.headers,
            add: (example: ExampleHeader) => result.headers.push(example)
        }
    ];

    for (const group of headerGroup) {
        for (const header of group.params) {
            if (skipOptionalRequestProperties && isOptional({ typeDeclarations, typeReference: header.valueType })) {
                continue;
            }
            const generatedExample = generateTypeReferenceExample({
                fieldName: header.name.name.originalName,
                currentDepth: 0,
                maxDepth: 1,
                typeDeclarations,
                typeReference: header.valueType,
                skipOptionalProperties: skipOptionalRequestProperties
            });
            if (generatedExample.type === "failure") {
                return generatedExample;
            }
            const { example } = generatedExample;
            group.add({
                name: header.name,
                value: example
            });
        }
    }

    const sendMessages = channel.messages.filter((message) => message.origin === "client");
    const sendMessage = sendMessages[0];
    if (sendMessage != null) {
        const generatedExampleMessage = generateExampleMessage({
            message: sendMessage,
            typeDeclarations,
            skipOptionalRequestProperties
        });
        if (generatedExampleMessage != null) {
            result.messages.push({
                type: sendMessage.type,
                body: generatedExampleMessage
            });
        }
    }
    const receiveMessages = channel.messages.filter((message) => message.origin === "server");
    const receiveMessage = receiveMessages[0];
    if (receiveMessage != null) {
        const generatedExampleMessage = generateExampleMessage({
            message: receiveMessage,
            typeDeclarations,
            skipOptionalRequestProperties
        });
        if (generatedExampleMessage != null) {
            result.messages.push({
                type: receiveMessage.type,
                body: generatedExampleMessage
            });
        }
    }

    return {
        type: "success",
        example: {
            ...result,
            url: getUrlForExample(channel, result)
        },
        jsonExample: undefined // dummy
    };
}

function generateExampleMessage({
    message,
    typeDeclarations,
    skipOptionalRequestProperties
}: {
    message: WebSocketMessage;
    typeDeclarations: Record<TypeId, TypeDeclaration>;
    skipOptionalRequestProperties: boolean;
}): ExampleWebSocketMessageBody | undefined {
    if (message.body.type === "inlinedBody") {
        return undefined;
    }
    const generatedExampleMessage = generateTypeReferenceExample({
        currentDepth: 0,
        maxDepth: 10,
        typeDeclarations,
        typeReference: message.body.bodyType,
        skipOptionalProperties: skipOptionalRequestProperties
    });
    if (generatedExampleMessage.type === "success") {
        return ExampleWebSocketMessageBody.reference(generatedExampleMessage.example);
    }
    return undefined;
}

function getUrlForExample(channel: WebSocketChannel, example: Omit<ExampleWebSocketSession, "id" | "url">): string {
    const pathParameters: Record<string, string> = {};
    [...example.pathParameters].forEach((examplePathParameter) => {
        const value = examplePathParameter.value.jsonExample;
        const stringValue = typeof value === "string" ? value : JSON.stringify(value);
        pathParameters[examplePathParameter.name.originalName] = stringValue;
    });
    const url =
        channel.path.head +
        channel.path.parts.map((pathPart) => pathParameters[pathPart.pathParameter] + pathPart.tail).join("");
    return url.startsWith("/") || url === "" ? url : `/${url}`;
}
