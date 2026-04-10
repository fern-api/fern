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

import com.fern.ir.model.http.PathParameter;
import com.fern.ir.model.http.QueryParameter;
import com.fern.ir.model.ir.Subpackage;
import com.fern.ir.model.websocket.WebSocketChannel;
import com.fern.ir.model.websocket.WebSocketMessage;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.output.GeneratedObjectMapper;
import com.fern.java.utils.NameUtils;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
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
            Optional<Subpackage> subpackage,
            Optional<ClassName> connectOptionsClassName) {
        super(
                websocketChannel,
                clientGeneratorContext,
                generatedClientOptions,
                generatedEnvironmentsClass,
                generatedObjectMapper,
                clientOptionsField,
                subpackage,
                connectOptionsClassName);

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
                        NameUtils.toName(websocketChannel.getName().get())
                                .getCamelCase()
                                .getSafeName())
                .addParameter(clientOptionsField.type, clientOptionsField.name);

        // Add path parameters
        for (PathParameter pathParam : websocketChannel.getPathParameters()) {
            TypeName paramType =
                    clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, pathParam.getValueType());
            builder.addParameter(
                            paramType,
                            NameUtils.toName(pathParam.getName()).getCamelCase().getSafeName())
                    .addJavadoc(
                            "@param $L $L\n",
                            NameUtils.toName(pathParam.getName()).getCamelCase().getSafeName(),
                            pathParam
                                    .getDocs()
                                    .orElse("the "
                                            + NameUtils.toName(pathParam.getName())
                                                    .getCamelCase()
                                                    .getSafeName() + " path parameter"));
        }

        // Constructor body
        builder.addStatement("this.$N = $N", clientOptionsField, clientOptionsField)
                .addStatement("this.$N = $T.JSON_MAPPER", objectMapperField, generatedObjectMapper.getClassName())
                .addStatement("this.$N = $N.httpClient()", okHttpClientField, clientOptionsField);

        // Assign path parameters
        for (PathParameter pathParam : websocketChannel.getPathParameters()) {
            String paramName =
                    NameUtils.toName(pathParam.getName()).getCamelCase().getSafeName();
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

        // Add connect options parameter if channel has query params
        if (connectOptionsClassName.isPresent()) {
            builder.addParameter(connectOptionsClassName.get(), "options")
                    .addJavadoc("@param options connection options including query parameters\n");
        }

        // Build WebSocket URL
        builder.addStatement("$N = new $T(1)", connectionLatchField, CountDownLatch.class);
        builder.addStatement(
                "String baseUrl = $N.environment().$L()", clientOptionsField, getEnvironmentUrlMethodName());

        // Build path with parameters
        appendPathBuildingCode(builder);
        builder.beginControlFlow("if (baseUrl.endsWith(\"/\") && fullPath.startsWith(\"/\"))");
        builder.addStatement("fullPath = fullPath.substring(1)");
        builder.endControlFlow();
        builder.beginControlFlow("else if (!baseUrl.endsWith(\"/\") && !fullPath.startsWith(\"/\"))");
        builder.addStatement("fullPath = \"/\" + fullPath");
        builder.endControlFlow();
        // Convert WebSocket schemes to HTTP schemes for OkHttp's HttpUrl parser
        builder.addComment("OkHttp's HttpUrl only supports http/https schemes; convert wss/ws for URL parsing");
        builder.beginControlFlow("if (baseUrl.startsWith($S))", "wss://");
        builder.addStatement("baseUrl = $S + baseUrl.substring(6)", "https://");
        builder.endControlFlow();
        builder.beginControlFlow("else if (baseUrl.startsWith($S))", "ws://");
        builder.addStatement("baseUrl = $S + baseUrl.substring(5)", "http://");
        builder.endControlFlow();
        builder.addStatement("$T parsedUrl = $T.parse(baseUrl + fullPath)", HttpUrl.class, HttpUrl.class);
        builder.beginControlFlow("if (parsedUrl == null)");
        builder.addStatement(
                "throw new $T($S + baseUrl + fullPath)", IllegalArgumentException.class, "Invalid WebSocket URL: ");
        builder.endControlFlow();
        builder.addStatement("$T.Builder urlBuilder = parsedUrl.newBuilder()", HttpUrl.class);

        // Add query parameters from connect options
        if (connectOptionsClassName.isPresent()) {
            for (QueryParameter queryParam : websocketChannel.getQueryParameters()) {
                String getterName = "get"
                        + capitalize(NameUtils.getName(queryParam.getName())
                                .getCamelCase()
                                .getSafeName());
                String wireValue = NameUtils.getWireValue(queryParam.getName());

                boolean isOptional = queryParam.getValueType().getContainer().isPresent()
                        && queryParam.getValueType().getContainer().get().isOptional();

                if (isOptional) {
                    builder.beginControlFlow(
                            "if (options.$L() != null && options.$L().isPresent())", getterName, getterName);
                    builder.addStatement(
                            "urlBuilder.addQueryParameter($S, String.valueOf(options.$L().get()))",
                            wireValue,
                            getterName);
                    builder.endControlFlow();
                } else if (queryParam.getAllowMultiple()) {
                    builder.beginControlFlow("for ($T item : options.$L())", String.class, getterName);
                    builder.addStatement("urlBuilder.addQueryParameter($S, item)", wireValue);
                    builder.endControlFlow();
                } else {
                    builder.addStatement(
                            "urlBuilder.addQueryParameter($S, String.valueOf(options.$L()))", wireValue, getterName);
                }
            }
        }

        // Build request with authentication
        builder.addStatement(
                "$T.Builder requestBuilder = new $T.Builder().url(urlBuilder.build())", Request.class, Request.class);

        // Apply authentication and configured headers
        builder.addStatement("$N.headers(null).forEach(requestBuilder::addHeader)", clientOptionsField);

        builder.addStatement("final $T request = requestBuilder.build()", Request.class);

        // Set state to CONNECTING
        ClassName readyStateClassName =
                clientGeneratorContext.getPoetClassNameFactory().getCoreClassName("WebSocketReadyState");
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

        // Use configured reconnect options or defaults
        builder.addStatement(
                "$T reconnectOpts = this.$N != null ? this.$N : $T.builder().build()",
                reconnectOptionsClass,
                reconnectOptionsField,
                reconnectOptionsField,
                reconnectOptionsClass);

        // Create the connection supplier lambda
        builder.addCode(
                "this.$N = new $T(reconnectOpts, () -> {\n", reconnectingListenerField, reconnectingListenerClass);
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
                "    protected void onWebSocketBinaryMessage($T webSocket, $T bytes) {\n",
                ClassName.get("okhttp3", "WebSocket"),
                ClassName.get("okio", "ByteString"));
        for (String handlerFieldName : getBinaryServerMessageHandlerFieldNames()) {
            builder.beginControlFlow("        if ($L != null)", handlerFieldName);
            builder.addStatement("            $L.accept(bytes)", handlerFieldName);
            builder.endControlFlow();
        }
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
                clientGeneratorContext.getPoetClassNameFactory().getCoreClassName("DisconnectReason"));
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
    protected Optional<MethodSpec> generateConnectNoArgOverload() {
        if (!connectOptionsClassName.isPresent()) {
            return Optional.empty();
        }
        // Only generate no-arg overload when all query params are optional (no required builder stages)
        boolean hasRequiredQueryParam = websocketChannel.getQueryParameters().stream()
                .anyMatch(qp -> {
                    boolean isOptional = qp.getValueType().getContainer().isPresent()
                            && qp.getValueType().getContainer().get().isOptional();
                    return !isOptional && !qp.getAllowMultiple();
                });
        if (hasRequiredQueryParam) {
            return Optional.empty();
        }
        ClassName optionsClass = connectOptionsClassName.get();
        return Optional.of(MethodSpec.methodBuilder("connect")
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("Establishes the WebSocket connection with default options.\n")
                .addJavadoc("@throws RuntimeException if connection fails\n")
                .addStatement("connect($T.builder().build())", optionsClass)
                .build());
    }

    @Override
    protected MethodSpec generateSendMethod(WebSocketMessage message) {
        TypeName messageType = getMessageBodyType(message);
        String methodName = getSendMethodName(message);
        boolean isBinary = isMessageBodyBinary(message);

        MethodSpec.Builder builder = MethodSpec.methodBuilder(methodName)
                .addModifiers(Modifier.PUBLIC)
                .addParameter(messageType, "message")
                .addJavadoc(
                        "Sends $L message to the server.\n",
                        articleFor(message.getType().get()))
                .addJavadoc("@param message the message to send\n")
                .addJavadoc("@throws RuntimeException if send fails\n");

        if (isBinary) {
            builder.addStatement("assertSocketIsOpen()")
                    .addComment("Use reconnecting listener's sendBinary method which handles queuing")
                    .addStatement("$N.sendBinary(message)", reconnectingListenerField);
        } else {
            builder.addStatement("sendMessage(message)");
        }

        return builder.build();
    }

    @Override
    protected MethodSpec generateSendMessageHelper() {
        return MethodSpec.methodBuilder("sendMessage")
                .addModifiers(Modifier.PRIVATE)
                .addParameter(Object.class, "body")
                .addStatement("assertSocketIsOpen()")
                .beginControlFlow("try")
                .addStatement("String json = $N.writeValueAsString(body)", objectMapperField)
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
                clientGeneratorContext.getPoetClassNameFactory().getCoreClassName("WebSocketReadyState");

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
