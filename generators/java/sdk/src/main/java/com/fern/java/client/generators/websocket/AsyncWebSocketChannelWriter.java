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
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import javax.lang.model.element.Modifier;
import okhttp3.HttpUrl;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;

public class AsyncWebSocketChannelWriter extends AbstractWebSocketChannelWriter {

    // Field for connection future
    private final FieldSpec connectionFutureField;

    public AsyncWebSocketChannelWriter(
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

        this.connectionFutureField = FieldSpec.builder(
                        ParameterizedTypeName.get(ClassName.get(CompletableFuture.class), TypeName.VOID.box()),
                        "connectionFuture",
                        Modifier.PRIVATE)
                .build();
    }

    @Override
    protected void addFields(TypeSpec.Builder classBuilder) {
        super.addFields(classBuilder);
        classBuilder.addField(connectionFutureField);
    }

    @Override
    protected MethodSpec generateConstructor() {
        MethodSpec.Builder builder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc(
                        "Creates a new async WebSocket client for the $L channel.\n",
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
                .returns(ParameterizedTypeName.get(ClassName.get(CompletableFuture.class), TypeName.VOID.box()))
                .addJavadoc("Establishes the WebSocket connection asynchronously.\n")
                .addJavadoc("@return a CompletableFuture that completes when the connection is established\n");

        // Build WebSocket URL
        builder.addStatement("$N = new $T<>()", connectionFutureField, CompletableFuture.class);
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

        builder.addStatement("$T request = requestBuilder.build()", Request.class);

        // Create WebSocket connection
        builder.addStatement(
                "this.$N = $N.newWebSocket(request, $L)",
                webSocketField,
                okHttpClientField,
                generateWebSocketListener());

        // Set state to CONNECTING
        ClassName readyStateClassName =
                ClassName.get(className.packageName(), className.simpleName(), "WebSocketReadyState");
        builder.addStatement("this.$N = $T.CONNECTING", readyStateField, readyStateClassName);

        // Java 8 compatible timeout handling with proper executor management
        builder.addStatement(
                "this.$N = $T.newSingleThreadScheduledExecutor()",
                timeoutExecutorField,
                ClassName.get("java.util.concurrent", "Executors"));
        builder.addStatement("$N.schedule(() -> {", timeoutExecutorField);
        builder.beginControlFlow("if (!$N.isDone())", connectionFutureField);
        builder.addStatement(
                "$N.completeExceptionally(new $T($S))",
                connectionFutureField,
                ClassName.get("java.util.concurrent", "TimeoutException"),
                "Connection timeout");
        builder.beginControlFlow("if ($N != null)", webSocketField);
        builder.addStatement("$N.close(1000, $S)", webSocketField, "Connection timeout");
        builder.addStatement("$N = null", webSocketField);
        builder.endControlFlow();
        builder.addStatement("this.$N = $T.CLOSED", readyStateField, readyStateClassName);
        builder.endControlFlow();
        builder.addStatement("}, 10, $T.SECONDS)", TimeUnit.class);

        builder.addStatement("return $N", connectionFutureField);

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
                .returns(ParameterizedTypeName.get(ClassName.get(CompletableFuture.class), TypeName.VOID.box()))
                .addParameter(messageType, "message")
                .addJavadoc(
                        "Sends a $L message to the server asynchronously.\n",
                        message.getType().get())
                .addJavadoc("@param message the message to send\n")
                .addJavadoc("@return a CompletableFuture that completes when the message is sent\n")
                .addStatement(
                        "return sendMessage($S, message)", message.getType().get())
                .build();
    }

    @Override
    protected MethodSpec generateSendMessageHelper() {
        return MethodSpec.methodBuilder("sendMessage")
                .addModifiers(Modifier.PRIVATE)
                .returns(ParameterizedTypeName.get(ClassName.get(CompletableFuture.class), TypeName.VOID.box()))
                .addParameter(String.class, "type")
                .addParameter(Object.class, "body")
                .addStatement(
                        "$T<$T> future = new $T<>()",
                        CompletableFuture.class,
                        TypeName.VOID.box(),
                        CompletableFuture.class)
                .beginControlFlow("try")
                .addStatement("assertSocketIsOpen()")
                .addStatement("$T<String, Object> envelope = new $T<>()", Map.class, HashMap.class)
                .addStatement("envelope.put($S, type)", "type")
                .addStatement("envelope.put($S, body)", "body")
                .addStatement("String json = $N.writeValueAsString(envelope)", objectMapperField)
                .addStatement("boolean queued = $N.send(json)", webSocketField)
                .beginControlFlow("if (queued)")
                .addStatement("future.complete(null)")
                .endControlFlow()
                .beginControlFlow("else")
                .addStatement(
                        "future.completeExceptionally(new $T($S))",
                        RuntimeException.class,
                        "Failed to queue message - WebSocket may be closing or closed")
                .endControlFlow()
                .endControlFlow()
                .beginControlFlow("catch ($T e)", IllegalStateException.class)
                .addStatement("future.completeExceptionally(e)")
                .endControlFlow()
                .beginControlFlow("catch ($T e)", Exception.class)
                .addStatement(
                        "future.completeExceptionally(new $T($S, e))", RuntimeException.class, "Failed to send message")
                .endControlFlow()
                .addStatement("return future")
                .build();
    }

    private TypeSpec generateWebSocketListener() {
        ClassName readyStateClassName =
                ClassName.get(className.packageName(), className.simpleName(), "WebSocketReadyState");
        return TypeSpec.anonymousClassBuilder("")
                .superclass(WebSocketListener.class)
                .addMethod(MethodSpec.methodBuilder("onOpen")
                        .addAnnotation(Override.class)
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(WebSocket.class, "webSocket")
                        .addParameter(Response.class, "response")
                        .addStatement("$N = $T.OPEN", readyStateField, readyStateClassName)
                        .beginControlFlow("if ($N != null)", onConnectedHandlerField)
                        .addStatement("$N.run()", onConnectedHandlerField)
                        .endControlFlow()
                        .addStatement("$N.complete(null)", connectionFutureField)
                        .build())
                .addMethod(MethodSpec.methodBuilder("onMessage")
                        .addAnnotation(Override.class)
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(WebSocket.class, "webSocket")
                        .addParameter(String.class, "text")
                        .addStatement("handleIncomingMessage(text)")
                        .build())
                .addMethod(MethodSpec.methodBuilder("onFailure")
                        .addAnnotation(Override.class)
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(WebSocket.class, "webSocket")
                        .addParameter(Throwable.class, "t")
                        .addParameter(Response.class, "response")
                        .addStatement("$N = $T.CLOSED", readyStateField, readyStateClassName)
                        .beginControlFlow("if ($N != null)", onErrorHandlerField)
                        .addStatement("$N.accept(new $T(t))", onErrorHandlerField, RuntimeException.class)
                        .endControlFlow()
                        .addStatement("$N.completeExceptionally(t)", connectionFutureField)
                        .build())
                .addMethod(MethodSpec.methodBuilder("onClosing")
                        .addAnnotation(Override.class)
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(WebSocket.class, "webSocket")
                        .addParameter(int.class, "code")
                        .addParameter(String.class, "reason")
                        .addStatement("$N = $T.CLOSING", readyStateField, readyStateClassName)
                        .build())
                .addMethod(MethodSpec.methodBuilder("onClosed")
                        .addAnnotation(Override.class)
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(WebSocket.class, "webSocket")
                        .addParameter(int.class, "code")
                        .addParameter(String.class, "reason")
                        .addStatement("$N = $T.CLOSED", readyStateField, readyStateClassName)
                        .beginControlFlow("if ($N != null)", onDisconnectedHandlerField)
                        .addStatement(
                                "$N.accept(new $T(code, reason))",
                                onDisconnectedHandlerField,
                                ClassName.get(className.packageName(), className.simpleName(), "DisconnectReason"))
                        .endControlFlow()
                        .build())
                .build();
    }
}
