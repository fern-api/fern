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
import com.fern.ir.model.websocket.InlinedWebSocketMessageBody;
import com.fern.ir.model.websocket.WebSocketChannel;
import com.fern.ir.model.websocket.WebSocketMessage;
import com.fern.ir.model.websocket.WebSocketMessageBody;
import com.fern.ir.model.websocket.WebSocketMessageBodyReference;
import com.fern.ir.model.websocket.WebSocketMessageOrigin;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ScheduledExecutorService;
import java.util.function.Consumer;
import javax.lang.model.element.Modifier;
import okhttp3.OkHttpClient;

public abstract class AbstractWebSocketChannelWriter {

    protected final WebSocketChannel websocketChannel;
    protected final ClientGeneratorContext clientGeneratorContext;
    protected final GeneratedClientOptions generatedClientOptions;
    protected final GeneratedEnvironmentsClass generatedEnvironmentsClass;
    protected final GeneratedObjectMapper generatedObjectMapper;
    protected final FieldSpec clientOptionsField;
    protected final ClassName className;
    protected final Optional<Subpackage> subpackage;

    // Common field specs for generated class
    protected final FieldSpec objectMapperField;
    protected final FieldSpec okHttpClientField;
    // Removed webSocketField - we access it through reconnectingListener.getWebSocket()
    protected final FieldSpec timeoutExecutorField;
    protected final FieldSpec readyStateField;

    // Message handlers map
    protected final Map<String, FieldSpec> messageHandlerFields = new HashMap<>();

    // Lifecycle handler fields
    protected final FieldSpec onConnectedHandlerField;
    protected final FieldSpec onDisconnectedHandlerField;
    protected final FieldSpec onErrorHandlerField;

    public AbstractWebSocketChannelWriter(
            WebSocketChannel websocketChannel,
            ClientGeneratorContext clientGeneratorContext,
            GeneratedClientOptions generatedClientOptions,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            GeneratedObjectMapper generatedObjectMapper,
            FieldSpec clientOptionsField,
            Optional<Subpackage> subpackage) {
        this.websocketChannel = websocketChannel;
        this.clientGeneratorContext = clientGeneratorContext;
        this.generatedClientOptions = generatedClientOptions;
        this.generatedEnvironmentsClass = generatedEnvironmentsClass;
        this.generatedObjectMapper = generatedObjectMapper;
        this.clientOptionsField = clientOptionsField;
        this.subpackage = subpackage;

        // Generate class name for this WebSocket channel with correct package
        this.className = clientGeneratorContext
                .getPoetClassNameFactory()
                .getWebSocketClientClassName(websocketChannel, subpackage);

        // Initialize common fields
        // Note: The field holds an ObjectMapper instance, not the ObjectMappers utility class
        this.objectMapperField = FieldSpec.builder(
                        ClassName.get("com.fasterxml.jackson.databind", "ObjectMapper"),
                        "objectMapper",
                        Modifier.PRIVATE,
                        Modifier.FINAL)
                .build();

        this.okHttpClientField = FieldSpec.builder(OkHttpClient.class, "okHttpClient", Modifier.PRIVATE, Modifier.FINAL)
                .build();

        // webSocketField removed - accessed through reconnectingListener.getWebSocket()

        this.timeoutExecutorField = FieldSpec.builder(
                        ScheduledExecutorService.class, "timeoutExecutor", Modifier.PRIVATE)
                .build();

        ClassName readyStateClassName =
                ClassName.get(className.packageName(), className.simpleName(), "WebSocketReadyState");
        this.readyStateField = FieldSpec.builder(readyStateClassName, "readyState", Modifier.PRIVATE, Modifier.VOLATILE)
                .initializer("$T.CLOSED", readyStateClassName)
                .build();

        // Initialize lifecycle handler fields
        this.onConnectedHandlerField = FieldSpec.builder(Runnable.class, "onConnectedHandler", Modifier.PRIVATE)
                .build();

        this.onDisconnectedHandlerField = FieldSpec.builder(
                        ParameterizedTypeName.get(
                                ClassName.get(Consumer.class),
                                ClassName.get(className.packageName(), className.simpleName(), "DisconnectReason")),
                        "onDisconnectedHandler",
                        Modifier.PRIVATE)
                .build();

        this.onErrorHandlerField = FieldSpec.builder(
                        ParameterizedTypeName.get(Consumer.class, Exception.class), "onErrorHandler", Modifier.PRIVATE)
                .build();
    }

    public GeneratedJavaFile generateFile() {
        TypeSpec.Builder classBuilder =
                TypeSpec.classBuilder(className).addModifiers(Modifier.PUBLIC).addJavadoc(generateClassJavadoc());

        // Add fields
        addFields(classBuilder);

        // Add constructor
        classBuilder.addMethod(generateConstructor());

        // Add connection management methods
        classBuilder.addMethod(generateConnectMethod());
        classBuilder.addMethod(generateDisconnectMethod());
        classBuilder.addMethod(generateIsConnectedMethod());
        classBuilder.addMethod(generateGetReadyStateMethod());

        // Add message sending methods (one per client message)
        for (WebSocketMessage message : websocketChannel.getMessages()) {
            if (message.getOrigin() == WebSocketMessageOrigin.CLIENT) {
                classBuilder.addMethod(generateSendMethod(message));
            }
        }

        // Add message handler registration methods (one per server message)
        for (WebSocketMessage message : websocketChannel.getMessages()) {
            if (message.getOrigin() == WebSocketMessageOrigin.SERVER) {
                classBuilder.addMethod(generateOnMessageMethod(message));
                // Add handler field for this message
                TypeName messageType = getMessageBodyType(message);
                FieldSpec handlerField = FieldSpec.builder(
                                ParameterizedTypeName.get(ClassName.get(Consumer.class), messageType),
                                getHandlerFieldName(message),
                                Modifier.PRIVATE)
                        .build();
                messageHandlerFields.put(message.getType().get(), handlerField);
                classBuilder.addField(handlerField);
            }
        }

        // Add lifecycle handler methods
        classBuilder.addMethod(generateOnConnectedMethod());
        classBuilder.addMethod(generateOnDisconnectedMethod());
        classBuilder.addMethod(generateOnErrorMethod());

        // Add helper methods
        classBuilder.addMethod(generateAssertSocketIsOpen());
        classBuilder.addMethod(generateSendMessageHelper());
        classBuilder.addMethod(generateHandleIncomingMessageHelper());

        // Add inner classes
        classBuilder.addType(generateDisconnectReasonClass());
        classBuilder.addType(generateWebSocketReadyStateEnum());

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(JavaFile.builder(className.packageName(), classBuilder.build())
                        .build())
                .build();
    }

    protected void addFields(TypeSpec.Builder classBuilder) {
        classBuilder.addField(clientOptionsField);
        classBuilder.addField(objectMapperField);
        classBuilder.addField(okHttpClientField);
        // webSocketField removed - accessed through reconnectingListener
        classBuilder.addField(timeoutExecutorField);
        classBuilder.addField(readyStateField);

        // Add path parameter fields
        for (PathParameter pathParam : websocketChannel.getPathParameters()) {
            classBuilder.addField(generatePathParameterField(pathParam));
        }

        // Add query parameter fields
        for (QueryParameter queryParam : websocketChannel.getQueryParameters()) {
            classBuilder.addField(generateQueryParameterField(queryParam));
        }

        // Add lifecycle handler fields
        classBuilder.addField(onConnectedHandlerField);
        classBuilder.addField(onDisconnectedHandlerField);
        classBuilder.addField(onErrorHandlerField);
    }

    protected abstract MethodSpec generateConstructor();

    protected abstract MethodSpec generateConnectMethod();

    protected abstract MethodSpec generateSendMethod(WebSocketMessage message);

    protected abstract MethodSpec generateSendMessageHelper();

    // Disconnect method must be implemented by subclasses
    // since they have access to reconnectingListenerField
    protected abstract MethodSpec generateDisconnectMethod();

    protected MethodSpec generateIsConnectedMethod() {
        // This method doesn't need webSocketField anymore
        // It's checking the ready state, not the socket instance
        ClassName readyStateClassName =
                ClassName.get(className.packageName(), className.simpleName(), "WebSocketReadyState");

        return MethodSpec.methodBuilder("hasWebSocketInstance")
                .addModifiers(Modifier.PUBLIC)
                .returns(TypeName.BOOLEAN)
                .addJavadoc("Checks if a WebSocket instance exists (not necessarily connected).\n")
                .addJavadoc("\n")
                .addJavadoc("This method only verifies that a WebSocket object has been created, not whether\n")
                .addJavadoc("it's actively connected. For actual connection state, use getReadyState().\n")
                .addJavadoc("\n")
                .addJavadoc("@return true if a WebSocket instance exists, false otherwise\n")
                .addJavadoc("@deprecated Use getReadyState() for accurate connection status\n")
                .addAnnotation(Deprecated.class)
                .addComment("Check if WebSocket connection is open based on ready state")
                .addStatement(
                        "return $N == $T.OPEN || $N == $T.CONNECTING",
                        readyStateField,
                        readyStateClassName,
                        readyStateField,
                        readyStateClassName)
                .build();
    }

    protected MethodSpec generateGetReadyStateMethod() {
        ClassName readyStateClassName =
                ClassName.get(className.packageName(), className.simpleName(), "WebSocketReadyState");
        return MethodSpec.methodBuilder("getReadyState")
                .addModifiers(Modifier.PUBLIC)
                .returns(readyStateClassName)
                .addJavadoc("Gets the current state of the WebSocket connection.\n")
                .addJavadoc("\n")
                .addJavadoc("This provides the actual connection state, similar to the W3C WebSocket API.\n")
                .addJavadoc("\n")
                .addJavadoc("@return the current WebSocket ready state\n")
                .addStatement("return $N", readyStateField)
                .build();
    }

    protected MethodSpec generateOnMessageMethod(WebSocketMessage message) {
        TypeName messageBodyType = getMessageBodyType(message);
        String handlerFieldName = getHandlerFieldName(message);

        // Convert message type to valid Java method name
        String messageTypeStr = message.getType().get();
        String methodName = "on" + toPascalCase(messageTypeStr);
        return MethodSpec.methodBuilder(methodName)
                .addModifiers(Modifier.PUBLIC)
                .addParameter(ParameterSpec.builder(
                                ParameterizedTypeName.get(ClassName.get(Consumer.class), messageBodyType), "handler")
                        .build())
                .addJavadoc(
                        "Registers a handler for $L messages from the server.\n",
                        message.getType().get())
                .addJavadoc("@param handler the handler to invoke when a message is received\n")
                .addStatement("this.$L = handler", handlerFieldName)
                .build();
    }

    protected MethodSpec generateOnConnectedMethod() {
        return MethodSpec.methodBuilder("onConnected")
                .addModifiers(Modifier.PUBLIC)
                .addParameter(Runnable.class, "handler")
                .addJavadoc("Registers a handler called when the connection is established.\n")
                .addJavadoc("@param handler the handler to invoke when connected\n")
                .addStatement("this.$N = handler", onConnectedHandlerField)
                .build();
    }

    protected MethodSpec generateOnDisconnectedMethod() {
        return MethodSpec.methodBuilder("onDisconnected")
                .addModifiers(Modifier.PUBLIC)
                .addParameter(ParameterSpec.builder(
                                ParameterizedTypeName.get(
                                        ClassName.get(Consumer.class),
                                        ClassName.get(
                                                className.packageName(), className.simpleName(), "DisconnectReason")),
                                "handler")
                        .build())
                .addJavadoc("Registers a handler called when the connection is closed.\n")
                .addJavadoc("@param handler the handler to invoke when disconnected\n")
                .addStatement("this.$N = handler", onDisconnectedHandlerField)
                .build();
    }

    protected MethodSpec generateOnErrorMethod() {
        return MethodSpec.methodBuilder("onError")
                .addModifiers(Modifier.PUBLIC)
                .addParameter(
                        ParameterSpec.builder(ParameterizedTypeName.get(Consumer.class, Exception.class), "handler")
                                .build())
                .addJavadoc("Registers a handler called when an error occurs.\n")
                .addJavadoc("@param handler the handler to invoke on error\n")
                .addStatement("this.$N = handler", onErrorHandlerField)
                .build();
    }

    // Note: assertSocketIsOpen must be implemented by subclasses
    // since they have access to reconnectingListenerField
    protected abstract MethodSpec generateAssertSocketIsOpen();

    protected MethodSpec generateHandleIncomingMessageHelper() {
        MethodSpec.Builder builder = MethodSpec.methodBuilder("handleIncomingMessage")
                .addModifiers(Modifier.PRIVATE)
                .addParameter(String.class, "json")
                .beginControlFlow("try")
                .addStatement(
                        "$T envelope = $N.readTree(json)",
                        ClassName.get("com.fasterxml.jackson.databind", "JsonNode"),
                        objectMapperField)
                .beginControlFlow("if (envelope == null || envelope.isNull())")
                .addStatement(
                        "throw new $T($S)", IllegalArgumentException.class, "Received null or invalid JSON envelope")
                .endControlFlow()
                .addStatement(
                        "$T typeNode = envelope.get($S)",
                        ClassName.get("com.fasterxml.jackson.databind", "JsonNode"),
                        "type")
                .beginControlFlow("if (typeNode == null || typeNode.isNull())")
                .addStatement(
                        "throw new $T($S)", IllegalArgumentException.class, "Message envelope missing 'type' field")
                .endControlFlow()
                .addStatement("String type = typeNode.asText()")
                .addStatement(
                        "$T body = envelope.get($S)",
                        ClassName.get("com.fasterxml.jackson.databind", "JsonNode"),
                        "body")
                .beginControlFlow("if (body == null)")
                .addStatement(
                        "throw new $T($S)", IllegalArgumentException.class, "Message envelope missing 'body' field")
                .endControlFlow()
                .beginControlFlow("switch (type)");

        // Add cases for each server message
        for (WebSocketMessage message : websocketChannel.getMessages()) {
            if (message.getOrigin() == WebSocketMessageOrigin.SERVER) {
                TypeName messageType = getMessageBodyType(message);
                String handlerFieldName = getHandlerFieldName(message);

                builder.addCode("case $S:\n", message.getType().get())
                        .beginControlFlow("if ($L != null)", handlerFieldName)
                        .addStatement(
                                "$T event = $N.treeToValue(body, $T.class)",
                                messageType,
                                objectMapperField,
                                messageType)
                        .beginControlFlow("if (event != null)")
                        .addStatement("$L.accept(event)", handlerFieldName)
                        .endControlFlow()
                        .endControlFlow()
                        .addStatement("break");
            }
        }

        builder.addCode("default:\n")
                .addStatement("// Unknown message type - log or ignore")
                .addStatement("break");

        builder.endControlFlow() // end switch
                .endControlFlow() // end try
                .beginControlFlow("catch ($T e)", IllegalArgumentException.class)
                .beginControlFlow("if ($N != null)", onErrorHandlerField)
                .addStatement("$N.accept(e)", onErrorHandlerField)
                .endControlFlow()
                .endControlFlow() // end catch
                .beginControlFlow("catch ($T e)", Exception.class)
                .beginControlFlow("if ($N != null)", onErrorHandlerField)
                .addStatement("$N.accept(e)", onErrorHandlerField)
                .endControlFlow()
                .endControlFlow(); // end catch

        return builder.build();
    }

    protected TypeSpec generateDisconnectReasonClass() {
        return TypeSpec.classBuilder("DisconnectReason")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addJavadoc("Reason for WebSocket disconnection.\n")
                .addField(FieldSpec.builder(TypeName.INT, "code", Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addField(FieldSpec.builder(String.class, "reason", Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(TypeName.INT, "code")
                        .addParameter(String.class, "reason")
                        .addStatement("this.code = code")
                        .addStatement("this.reason = reason")
                        .build())
                .addMethod(MethodSpec.methodBuilder("getCode")
                        .addModifiers(Modifier.PUBLIC)
                        .returns(TypeName.INT)
                        .addStatement("return code")
                        .build())
                .addMethod(MethodSpec.methodBuilder("getReason")
                        .addModifiers(Modifier.PUBLIC)
                        .returns(String.class)
                        .addStatement("return reason")
                        .build())
                .build();
    }

    protected TypeSpec generateWebSocketReadyStateEnum() {
        return TypeSpec.enumBuilder("WebSocketReadyState")
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("WebSocket connection ready state, based on the W3C WebSocket API.\n")
                .addEnumConstant(
                        "CONNECTING",
                        TypeSpec.anonymousClassBuilder("")
                                .addJavadoc("The connection is being established.\n")
                                .build())
                .addEnumConstant(
                        "OPEN",
                        TypeSpec.anonymousClassBuilder("")
                                .addJavadoc("The connection is open and ready to communicate.\n")
                                .build())
                .addEnumConstant(
                        "CLOSING",
                        TypeSpec.anonymousClassBuilder("")
                                .addJavadoc("The connection is in the process of closing.\n")
                                .build())
                .addEnumConstant(
                        "CLOSED",
                        TypeSpec.anonymousClassBuilder("")
                                .addJavadoc("The connection is closed.\n")
                                .build())
                .build();
    }

    protected FieldSpec generatePathParameterField(PathParameter pathParam) {
        TypeName paramType =
                clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, pathParam.getValueType());
        return FieldSpec.builder(
                        paramType, pathParam.getName().getCamelCase().getSafeName(), Modifier.PRIVATE, Modifier.FINAL)
                .build();
    }

    protected FieldSpec generateQueryParameterField(QueryParameter queryParam) {
        TypeName paramType =
                clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, queryParam.getValueType());
        if (queryParam.getValueType().getContainer().isPresent()
                && queryParam.getValueType().getContainer().get().isOptional()) {
            // Already wrapped in Optional
            return FieldSpec.builder(
                            paramType,
                            queryParam.getName().getName().getCamelCase().getSafeName(),
                            Modifier.PRIVATE,
                            Modifier.FINAL)
                    .build();
        } else {
            // Wrap in Optional for optional parameters
            return FieldSpec.builder(
                            ParameterizedTypeName.get(ClassName.get(Optional.class), paramType),
                            queryParam.getName().getName().getCamelCase().getSafeName(),
                            Modifier.PRIVATE,
                            Modifier.FINAL)
                    .build();
        }
    }

    protected TypeName getMessageBodyType(WebSocketMessage message) {
        return message.getBody().visit(new WebSocketMessageBody.Visitor<TypeName>() {
            @Override
            public TypeName visitInlinedBody(InlinedWebSocketMessageBody inlinedBody) {
                // For inlined bodies, we'd need to generate a type
                // For now, we'll use Object - this should be improved
                return TypeName.OBJECT;
            }

            @Override
            public TypeName visitReference(WebSocketMessageBodyReference reference) {
                return clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, reference.getBodyType());
            }

            @Override
            public TypeName _visitUnknown(Object unknown) {
                return TypeName.OBJECT;
            }
        });
    }

    protected String getHandlerFieldName(WebSocketMessage message) {
        // Convert message type to valid Java identifier (handle snake_case)
        String messageType = message.getType().get();
        String[] parts = messageType.split("_");
        StringBuilder fieldName = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            String part = parts[i];
            if (!part.isEmpty()) {
                if (i == 0) {
                    fieldName.append(part.toLowerCase());
                } else {
                    fieldName.append(Character.toUpperCase(part.charAt(0)));
                    if (part.length() > 1) {
                        fieldName.append(part.substring(1).toLowerCase());
                    }
                }
            }
        }
        fieldName.append("Handler");
        return fieldName.toString();
    }

    protected String capitalize(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        // Handle snake_case and digits
        String[] parts = str.split("_");
        StringBuilder result = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) {
                // Capitalize first letter, keep rest as-is (including digits)
                result.append(Character.toUpperCase(part.charAt(0)));
                if (part.length() > 1) {
                    result.append(part.substring(1));
                }
            }
        }
        return result.toString();
    }

    protected String toPascalCase(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        // Convert snake_case to PascalCase (same as capitalize for now)
        return capitalize(str);
    }

    protected CodeBlock generateClassJavadoc() {
        return CodeBlock.builder()
                .add(
                        "WebSocket client for the $L channel.\n",
                        websocketChannel.getName().get().getCamelCase().getSafeName())
                .add("Provides real-time bidirectional communication with strongly-typed messages.\n")
                .build();
    }
}
