/*
 * (c) Copyright 2025 Birch Solutions Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.fern.java.client.generators.websocket;

import com.fern.ir.model.http.HttpHeader;
import com.fern.ir.model.http.HttpPath;
import com.fern.ir.model.http.HttpPathPart;
import com.fern.ir.model.http.PathParameter;
import com.fern.ir.model.http.QueryParameter;
import com.fern.ir.model.ir.Subpackage;
import com.fern.ir.model.websocket.WebSocketChannel;
import com.fern.ir.model.websocket.WebSocketMessage;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import javax.lang.model.element.Modifier;
import okhttp3.HttpUrl;
import okhttp3.Request;

public class SyncWebSocketChannelWriter extends AbstractWebSocketChannelWriter {

    // Field for connection latch
    private final FieldSpec connectionLatchField;

    // Field for reconnecting listener
    private final FieldSpec reconnectingListenerField;

    public SyncWebSocketChannelWriter(
            WebSocketChannel websocketChannel,
            ClientGeneratorContext clientGeneratorContext,
            GeneratedClientOptions generatedClientOptions,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            GeneratedObjectMapper generatedObjectMapper,
            FieldSpec clientOptionsField,
            Optional<Subpackage> subpackage) {
        super(
                websocketChannel,
                clientGeneratorContext,
                generatedClientOptions,
                generatedEnvironmentsClass,
                generatedObjectMapper,
                clientOptionsField,
                subpackage);

        this.connectionLatchField = FieldSpec.builder(CountDownLatch.class, "connectionLatch", Modifier.PRIVATE)
                .build();

        this.reconnectingListenerField = FieldSpec.builder(
                        ClassName.get(
                                clientGeneratorContext
                                        .getPoetClassNameFactory()
                                        .getCoreClassName("ReconnectingWebSocketListener")
                                        .packageName(),
                                "ReconnectingWebSocketListener"),
                        "reconnectingListener",
                        Modifier.PRIVATE)
                .build();
    }

    @Override
    protected void addFields(TypeSpec.Builder classBuilder) {
        super.addFields(classBuilder);
        classBuilder.addField(connectionLatchField);
        classBuilder.addField(reconnectingListenerField);
    }

    @Override
    protected MethodSpec generateConstructor() {
        MethodSpec.Builder builder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc(
                        "Creates a new WebSocket client for the $L channel.\n",
                        websocketChannel.getName().get().getCamelCase().getSafeName())
                .addParameter(clientOptionsField.type, clientOptionsField.name);

        // Add path parameters
        for (PathParameter pathParam : websocketChannel.getPathParameters()) {
            TypeName paramType =
                    clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, pathParam.getValueType());
            builder.addParameter(paramType, pathParam.getName().getCamelCase().getSafeName())
                    .addJavadoc(
                            "@param $L $L\n",
                            pathParam.getName().getCamelCase().getSafeName(),
                            pathParam
                                    .getDocs()
                                    .orElse("the "
                                            + pathParam.getName().getCamelCase().getSafeName() + " path parameter"));
        }

        // Add query parameters
        for (QueryParameter queryParam : websocketChannel.getQueryParameters()) {
            TypeName paramType =
                    clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, queryParam.getValueType());
            String paramName = queryParam.getName().getName().getCamelCase().getSafeName();

            // Check if already optional
            if (queryParam.getValueType().getContainer().isPresent()
                    && queryParam.getValueType().getContainer().get().isOptional()) {
                builder.addParameter(paramType, paramName);
            } else {
                builder.addParameter(ParameterizedTypeName.get(ClassName.get(Optional.class), paramType), paramName);
            }
            builder.addJavadoc(
                    "@param $L $L\n",
                    paramName,
                    queryParam.getDocs().orElse("Optional " + paramName + " query parameter"));
        }

        // Constructor body
        builder.addStatement("this.$N = $N", clientOptionsField, clientOptionsField)
                .addStatement("this.$N = $T.JSON_MAPPER", objectMapperField, generatedObjectMapper.getClassName())
                .addStatement("this.$N = $N.httpClient()", okHttpClientField, clientOptionsField);

        // Assign path parameters
        for (PathParameter pathParam : websocketChannel.getPathParameters()) {
            String paramName = pathParam.getName().getCamelCase().getSafeName();
            builder.addStatement("this.$L = $L", paramName, paramName);
        }

        // Assign query parameters
        for (QueryParameter queryParam : websocketChannel.getQueryParameters()) {
            String paramName = queryParam.getName().getName().getCamelCase().getSafeName();
            builder.addStatement("this.$L = $L", paramName, paramName);
        }

        return builder.build();
    }

    @Override
    protected MethodSpec generateConnectMethod() {
        MethodSpec.Builder builder = MethodSpec.methodBuilder("connect")
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("Establishes the WebSocket connection with automatic reconnection.\n")
                .addJavadoc("@throws RuntimeException if connection fails\n");

        // Build WebSocket URL
        builder.addStatement("$N = new $T(1)", connectionLatchField, CountDownLatch.class);
        builder.addStatement("String baseUrl = $N.environment().getUrl()", clientOptionsField);

        // Build path with parameters
        builder.addStatement("$T pathBuilder = new $T()", StringBuilder.class, StringBuilder.class);

        HttpPath path = websocketChannel.getPath();
        builder.addStatement("pathBuilder.append($S)", path.getHead());

        for (HttpPathPart part : path.getParts()) {
            String pathParamId = part.getPathParameter();
            if (pathParamId != null && !pathParamId.isEmpty()) {
                // Find the matching path parameter
                PathParameter matchingParam = websocketChannel.getPathParameters().stream()
                        .filter(p -> p.getName().getOriginalName().equals(pathParamId))
                        .findFirst()
                        .orElseThrow();
                String paramFieldName = matchingParam.getName().getCamelCase().getSafeName();
                builder.addStatement("pathBuilder.append($L)", paramFieldName);
            }
            builder.addStatement("pathBuilder.append($S)", part.getTail());
        }

        // Build HttpUrl with query parameters
        builder.addStatement("String fullPath = pathBuilder.toString()");
        builder.beginControlFlow("if (baseUrl.endsWith(\"/\") && fullPath.startsWith(\"/\"))");
        builder.addStatement("fullPath = fullPath.substring(1)");
        builder.endControlFlow();
        builder.beginControlFlow("else if (!baseUrl.endsWith(\"/\") && !fullPath.startsWith(\"/\"))");
        builder.addStatement("fullPath = \"/\" + fullPath");
        builder.endControlFlow();
        builder.addStatement(
                "$T.Builder urlBuilder = $T.parse(baseUrl + fullPath).newBuilder()", HttpUrl.class, HttpUrl.class);

        // Add query parameters
        for (QueryParameter queryParam : websocketChannel.getQueryParameters()) {
            String paramName = queryParam.getName().getName().getCamelCase().getSafeName();
            String wireValue = queryParam.getName().getWireValue();

            builder.beginControlFlow("if ($L != null && $L.isPresent())", paramName, paramName);
            builder.addStatement("urlBuilder.addQueryParameter($S, String.valueOf($L.get()))", wireValue, paramName);
            builder.endControlFlow();
        }

        // Build request with authentication
        builder.addStatement(
                "$T.Builder requestBuilder = new $T.Builder().url(urlBuilder.build())", Request.class, Request.class);

        // Apply authentication if needed
        if (websocketChannel.getAuth()) {
            builder.addStatement("$N.headers(null).forEach(requestBuilder::addHeader)", clientOptionsField);
        }

        // Add any additional headers
        for (HttpHeader header : websocketChannel.getHeaders()) {
            // Check if header value comes from environment variable
            if (header.getEnv().isPresent()) {
                String envVar = header.getEnv().get();
                builder.addStatement("$T envValue = $T.getenv($S)", String.class, System.class, envVar);
                builder.beginControlFlow("if (envValue != null)");
                builder.addStatement(
                        "requestBuilder.addHeader($S, envValue)",
                        header.getName().getWireValue());
                builder.endControlFlow();
            } else {
                // For now, skip headers without env vars as we don't support literal values yet
                // TODO: Support literal header values when IR provides them
                builder.addComment(
                        "Header $L requires literal value support",
                        header.getName().getWireValue());
            }
        }

        builder.addStatement("final $T request = requestBuilder.build()", Request.class);

        // Set state to CONNECTING
        ClassName readyStateClassName =
                ClassName.get(className.packageName(), className.simpleName(), "WebSocketReadyState");
        builder.addStatement("this.$N = $T.CONNECTING", readyStateField, readyStateClassName);

        // Create ReconnectingWebSocketListener with connection supplier
        ClassName reconnectingListenerClass = ClassName.get(
                clientGeneratorContext
                        .getPoetClassNameFactory()
                        .getCoreClassName("ReconnectingWebSocketListener")
                        .packageName(),
                "ReconnectingWebSocketListener");
        ClassName reconnectOptionsClass = ClassName.get(
                clientGeneratorContext
                        .getPoetClassNameFactory()
                        .getCoreClassName("ReconnectingWebSocketListener")
                        .packageName(),
                "ReconnectingWebSocketListener",
                "ReconnectOptions");

        // Create reconnection options with defaults
        builder.addStatement(
                "$T reconnectOptions = $T.builder().build()", reconnectOptionsClass, reconnectOptionsClass);

        // Create the connection supplier lambda
        builder.addCode(
                "this.$N = new $T(reconnectOptions, () -> {\n", reconnectingListenerField, reconnectingListenerClass);
        builder.beginControlFlow("    if ($N.webSocketFactory().isPresent())", clientOptionsField);
        builder.addStatement(
                "return $N.webSocketFactory().get().create(request, this.$N)",
                clientOptionsField,
                reconnectingListenerField);
        builder.endControlFlow();
        builder.beginControlFlow("    else");
        builder.addStatement("return $N.newWebSocket(request, this.$N)", okHttpClientField, reconnectingListenerField);
        builder.endControlFlow();
        builder.addCode("}) {\n");

        // Override abstract methods to handle lifecycle events
        builder.addCode("    @Override\n");
        builder.addCode(
                "    protected void onWebSocketOpen($T webSocket, $T response) {\n",
                ClassName.get("okhttp3", "WebSocket"),
                ClassName.get("okhttp3", "Response"));
        // webSocket is set internally in ReconnectingWebSocketListener.onOpen()
        builder.addStatement("        $N = $T.OPEN", readyStateField, readyStateClassName);
        builder.beginControlFlow("        if ($N != null)", onConnectedHandlerField);
        builder.addStatement("            $N.run()", onConnectedHandlerField);
        builder.endControlFlow();
        builder.addStatement("        $N.countDown()", connectionLatchField);
        builder.addCode("    }\n\n");

        builder.addCode("    @Override\n");
        builder.addCode(
                "    protected void onWebSocketMessage($T webSocket, String text) {\n",
                ClassName.get("okhttp3", "WebSocket"));
        builder.addStatement("        handleIncomingMessage(text)");
        builder.addCode("    }\n\n");

        builder.addCode("    @Override\n");
        builder.addCode(
                "    protected void onWebSocketFailure($T webSocket, Throwable t, $T response) {\n",
                ClassName.get("okhttp3", "WebSocket"),
                ClassName.get("okhttp3", "Response"));
        builder.addStatement("        $N = $T.CLOSED", readyStateField, readyStateClassName);
        builder.beginControlFlow("        if ($N != null)", onErrorHandlerField);
        builder.addStatement("            $N.accept(new $T(t))", onErrorHandlerField, RuntimeException.class);
        builder.endControlFlow();
        builder.addCode("    }\n\n");

        builder.addCode("    @Override\n");
        builder.addCode(
                "    protected void onWebSocketClosed($T webSocket, int code, String reason) {\n",
                ClassName.get("okhttp3", "WebSocket"));
        builder.addStatement("        $N = $T.CLOSED", readyStateField, readyStateClassName);
        builder.beginControlFlow("        if ($N != null)", onDisconnectedHandlerField);
        builder.addStatement(
                "    $N.accept(new $T(code, reason))",
                onDisconnectedHandlerField,
                ClassName.get(className.packageName(), className.simpleName(), "DisconnectReason"));
        builder.endControlFlow();
        builder.addCode("    }\n");
        builder.addStatement("}");

        // Trigger connection
        builder.addStatement("$N.connect()", reconnectingListenerField);

        // Wait for connection with timeout
        builder.beginControlFlow("try");
        builder.beginControlFlow("if (!$N.await(10, $T.SECONDS))", connectionLatchField, TimeUnit.class);
        builder.addStatement("$N.disconnect()", reconnectingListenerField);
        builder.addStatement("this.$N = $T.CLOSED", readyStateField, readyStateClassName);
        builder.addStatement("throw new $T($S)", RuntimeException.class, "WebSocket connection timeout");
        builder.endControlFlow();
        builder.endControlFlow();
        builder.beginControlFlow("catch ($T e)", InterruptedException.class);
        builder.addStatement("$N.disconnect()", reconnectingListenerField);
        builder.addStatement("this.$N = $T.CLOSED", readyStateField, readyStateClassName);
        builder.addStatement("throw new $T($S, e)", RuntimeException.class, "WebSocket connection interrupted");
        builder.endControlFlow();

        return builder.build();
    }

    @Override
    protected MethodSpec generateSendMethod(WebSocketMessage message) {
        TypeName messageType = getMessageBodyType(message);
        // Convert message type to valid Java method name
        String messageTypeStr = message.getType().get();
        String methodName = "send" + capitalize(messageTypeStr);

        return MethodSpec.methodBuilder(methodName)
                .addModifiers(Modifier.PUBLIC)
                .addParameter(messageType, "message")
                .addJavadoc(
                        "Sends a $L message to the server.\n", message.getType().get())
                .addJavadoc("@param message the message to send\n")
                .addJavadoc("@throws RuntimeException if send fails\n")
                .addStatement("sendMessage($S, message)", message.getType().get())
                .build();
    }

    @Override
    protected MethodSpec generateSendMessageHelper() {
        return MethodSpec.methodBuilder("sendMessage")
                .addModifiers(Modifier.PRIVATE)
                .addParameter(String.class, "type")
                .addParameter(Object.class, "body")
                .addStatement("assertSocketIsOpen()")
                .beginControlFlow("try")
                .addStatement("$T<String, Object> envelope = new $T<>()", Map.class, HashMap.class)
                .addStatement("envelope.put($S, type)", "type")
                .addStatement("envelope.put($S, body)", "body")
                .addStatement("String json = $N.writeValueAsString(envelope)", objectMapperField)
                .addComment("Use reconnecting listener's send method which handles queuing")
                .addStatement("boolean sent = $N.send(json)", reconnectingListenerField)
                .beginControlFlow("if (!sent)")
                .addComment("Message was queued for later delivery when reconnected")
                .endControlFlow()
                .endControlFlow()
                .beginControlFlow("catch ($T e)", IllegalStateException.class)
                .addStatement("throw e")
                .endControlFlow()
                .beginControlFlow("catch ($T e)", Exception.class)
                .addStatement("throw new $T($S, e)", RuntimeException.class, "Failed to send message")
                .endControlFlow()
                .build();
    }

    @Override
    protected MethodSpec generateAssertSocketIsOpen() {
        ClassName readyStateClassName =
                ClassName.get(className.packageName(), className.simpleName(), "WebSocketReadyState");

        return MethodSpec.methodBuilder("assertSocketIsOpen")
                .addModifiers(Modifier.PRIVATE)
                .addJavadoc("Ensures the WebSocket is connected and ready to send messages.\n")
                .addJavadoc("@throws IllegalStateException if the socket is not connected or not open\n")
                .beginControlFlow("if ($N.getWebSocket() == null)", reconnectingListenerField)
                .addStatement(
                        "throw new $T($S)",
                        IllegalStateException.class,
                        "WebSocket is not connected. Call connect() first.")
                .endControlFlow()
                .beginControlFlow("if ($N != $T.OPEN)", readyStateField, readyStateClassName)
                .addStatement(
                        "throw new $T($S + $N)",
                        IllegalStateException.class,
                        "WebSocket is not open. Current state: ",
                        readyStateField)
                .endControlFlow()
                .build();
    }

    @Override
    protected MethodSpec generateDisconnectMethod() {
        return MethodSpec.methodBuilder("disconnect")
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("Disconnects the WebSocket connection and releases resources.\n")
                .addStatement("$N.disconnect()", reconnectingListenerField)
                .beginControlFlow("if ($N != null)", timeoutExecutorField)
                .addStatement("$N.shutdownNow()", timeoutExecutorField)
                .addStatement("$N = null", timeoutExecutorField)
                .endControlFlow()
                .build();
    }
}
