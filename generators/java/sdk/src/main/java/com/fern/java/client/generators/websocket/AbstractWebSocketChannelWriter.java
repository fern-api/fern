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
import com.fern.ir.model.ir.Subpackage;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.ir.model.types.TypeReference;
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
import java.util.Set;
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

    // Generic message handler field (fires for all incoming text messages)
    protected final FieldSpec onMessageHandlerField;

    // Reconnect options field (configurable before connect())
    protected final FieldSpec reconnectOptionsField;

    // Cached core class names
    protected final ClassName reconnectOptionsClassName;

    // Reserved lifecycle method names that take Consumer<T> parameters.
    // Server message handlers also take Consumer<T>, so if a message type
    // produces the same method name, Java type-erasure makes the two
    // overloads ambiguous. We append "Message" to disambiguate.
    private static final Set<String> RESERVED_CONSUMER_METHOD_NAMES = Set.of("onError", "onDisconnected");

    // Connect options class name (present when channel has query parameters)
    protected final Optional<ClassName> connectOptionsClassName;

    public AbstractWebSocketChannelWriter(
            WebSocketChannel websocketChannel,
            ClientGeneratorContext clientGeneratorContext,
            GeneratedClientOptions generatedClientOptions,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            GeneratedObjectMapper generatedObjectMapper,
            FieldSpec clientOptionsField,
            Optional<Subpackage> subpackage,
            Optional<ClassName> connectOptionsClassName) {
        this.websocketChannel = websocketChannel;
        this.clientGeneratorContext = clientGeneratorContext;
        this.generatedClientOptions = generatedClientOptions;
        this.generatedEnvironmentsClass = generatedEnvironmentsClass;
        this.generatedObjectMapper = generatedObjectMapper;
        this.clientOptionsField = clientOptionsField;
        this.subpackage = subpackage;
        this.connectOptionsClassName = connectOptionsClassName;

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
                clientGeneratorContext.getPoetClassNameFactory().getCoreClassName("WebSocketReadyState");
        this.readyStateField = FieldSpec.builder(readyStateClassName, "readyState", Modifier.PRIVATE, Modifier.VOLATILE)
                .initializer("$T.CLOSED", readyStateClassName)
                .build();

        // Initialize lifecycle handler fields
        this.onConnectedHandlerField = FieldSpec.builder(
                        Runnable.class, "onConnectedHandler", Modifier.PRIVATE, Modifier.VOLATILE)
                .build();

        ClassName disconnectReasonClassName =
                clientGeneratorContext.getPoetClassNameFactory().getCoreClassName("DisconnectReason");
        this.onDisconnectedHandlerField = FieldSpec.builder(
                        ParameterizedTypeName.get(ClassName.get(Consumer.class), disconnectReasonClassName),
                        "onDisconnectedHandler",
                        Modifier.PRIVATE,
                        Modifier.VOLATILE)
                .build();

        this.onErrorHandlerField = FieldSpec.builder(
                        ParameterizedTypeName.get(Consumer.class, Exception.class),
                        "onErrorHandler",
                        Modifier.PRIVATE,
                        Modifier.VOLATILE)
                .build();

        // Generic message handler (raw JSON string for all incoming text messages)
        this.onMessageHandlerField = FieldSpec.builder(
                        ParameterizedTypeName.get(ClassName.get(Consumer.class), ClassName.get(String.class)),
                        "onMessageHandler",
                        Modifier.PRIVATE,
                        Modifier.VOLATILE)
                .build();

        // Reconnect options (configurable before connect())
        this.reconnectOptionsClassName = ClassName.get(
                clientGeneratorContext
                        .getPoetClassNameFactory()
                        .getCoreClassName("ReconnectingWebSocketListener")
                        .packageName(),
                "ReconnectingWebSocketListener",
                "ReconnectOptions");
        this.reconnectOptionsField = FieldSpec.builder(
                        reconnectOptionsClassName, "reconnectOptions", Modifier.PRIVATE, Modifier.VOLATILE)
                .build();
    }

    public GeneratedJavaFile generateFile() {
        TypeSpec.Builder classBuilder = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC)
                .addSuperinterface(AutoCloseable.class)
                .addJavadoc(generateClassJavadoc());

        // Add fields
        addFields(classBuilder);

        // Add constructor
        classBuilder.addMethod(generateConstructor());

        // Add connection management methods
        classBuilder.addMethod(generateConnectMethod());
        generateConnectNoArgOverload().ifPresent(classBuilder::addMethod);
        classBuilder.addMethod(generateDisconnectMethod());
        classBuilder.addMethod(generateGetReadyStateMethod());

        // Add message sending methods (one per client message)
        for (WebSocketMessage message : websocketChannel.getMessages()) {
            if (message.getOrigin() == WebSocketMessageOrigin.CLIENT) {
                classBuilder.addMethod(generateSendMethod(message));
            }
        }

        // Add message handler registration methods (one per server message, including binary)
        for (WebSocketMessage message : websocketChannel.getMessages()) {
            if (message.getOrigin() == WebSocketMessageOrigin.SERVER) {
                classBuilder.addMethod(generateOnMessageMethod(message));
                // Add handler field for this message
                TypeName messageType = getMessageBodyType(message);
                FieldSpec handlerField = FieldSpec.builder(
                                ParameterizedTypeName.get(ClassName.get(Consumer.class), messageType),
                                getHandlerFieldName(message),
                                Modifier.PRIVATE,
                                Modifier.VOLATILE)
                        .build();
                messageHandlerFields.put(message.getType().get(), handlerField);
                classBuilder.addField(handlerField);
            }
        }

        // Add lifecycle handler methods
        classBuilder.addMethod(generateOnConnectedMethod());
        classBuilder.addMethod(generateOnDisconnectedMethod());
        classBuilder.addMethod(generateOnErrorMethod());
        classBuilder.addMethod(generateOnMessageMethod());
        classBuilder.addMethod(generateReconnectOptionsMethod());
        classBuilder.addMethod(generateCloseMethod());

        // Add helper methods
        classBuilder.addMethod(generateAssertSocketIsOpen());
        classBuilder.addMethod(generateSendMessageHelper());
        classBuilder.addMethod(generateHandleIncomingMessageHelper());

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

        // Add lifecycle handler fields
        classBuilder.addField(onConnectedHandlerField);
        classBuilder.addField(onDisconnectedHandlerField);
        classBuilder.addField(onErrorHandlerField);

        // Add generic message handler and reconnect options fields
        classBuilder.addField(onMessageHandlerField);
        classBuilder.addField(reconnectOptionsField);
    }

    protected abstract MethodSpec generateConstructor();

    protected abstract MethodSpec generateConnectMethod();

    protected abstract Optional<MethodSpec> generateConnectNoArgOverload();

    protected abstract MethodSpec generateSendMethod(WebSocketMessage message);

    protected abstract MethodSpec generateSendMessageHelper();

    // Disconnect method must be implemented by subclasses
    // since they have access to reconnectingListenerField
    protected abstract MethodSpec generateDisconnectMethod();

    protected MethodSpec generateGetReadyStateMethod() {
        ClassName readyStateClassName =
                clientGeneratorContext.getPoetClassNameFactory().getCoreClassName("WebSocketReadyState");
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

        String methodName = getMessageMethodName(message);
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
        ClassName disconnectReasonClassName =
                clientGeneratorContext.getPoetClassNameFactory().getCoreClassName("DisconnectReason");
        return MethodSpec.methodBuilder("onDisconnected")
                .addModifiers(Modifier.PUBLIC)
                .addParameter(ParameterSpec.builder(
                                ParameterizedTypeName.get(ClassName.get(Consumer.class), disconnectReasonClassName),
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

    /** Generates the onMessage(Consumer&lt;String&gt;) method for receiving all raw text messages. */
    protected MethodSpec generateOnMessageMethod() {
        return MethodSpec.methodBuilder("onMessage")
                .addModifiers(Modifier.PUBLIC)
                .addParameter(ParameterSpec.builder(
                                ParameterizedTypeName.get(ClassName.get(Consumer.class), ClassName.get(String.class)),
                                "handler")
                        .build())
                .addJavadoc("Registers a handler called for every incoming text message.\n")
                .addJavadoc("The handler receives the raw JSON string before type-specific dispatch.\n")
                .addJavadoc("@param handler the handler to invoke with the raw message JSON\n")
                .addStatement("this.$N = handler", onMessageHandlerField)
                .build();
    }

    /** Generates the reconnectOptions(ReconnectOptions) setter method. */
    protected MethodSpec generateReconnectOptionsMethod() {
        return MethodSpec.methodBuilder("reconnectOptions")
                .addModifiers(Modifier.PUBLIC)
                .addParameter(reconnectOptionsClassName, "options")
                .addJavadoc("Configures reconnection behavior. Must be called before {@link #connect}.\n")
                .addJavadoc("\n")
                .addJavadoc("@param options the reconnection options (backoff, retries, queue size)\n")
                .addStatement("this.$N = options", reconnectOptionsField)
                .build();
    }

    /** Generates the close() method for AutoCloseable support. */
    protected MethodSpec generateCloseMethod() {
        return MethodSpec.methodBuilder("close")
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("Closes this WebSocket client, releasing all resources.\n")
                .addJavadoc("Equivalent to calling {@link #disconnect()}.\n")
                .addStatement("disconnect()")
                .build();
    }

    // Note: assertSocketIsOpen must be implemented by subclasses
    // since they have access to reconnectingListenerField
    protected abstract MethodSpec generateAssertSocketIsOpen();

    /**
     * Returns the handler field names for binary server messages, used by subclasses to wire up the
     * onWebSocketBinaryMessage override.
     */
    protected java.util.List<String> getBinaryServerMessageHandlerFieldNames() {
        java.util.List<String> result = new java.util.ArrayList<>();
        for (WebSocketMessage message : websocketChannel.getMessages()) {
            if (message.getOrigin() == WebSocketMessageOrigin.SERVER && isMessageBodyBinary(message)) {
                result.add(getHandlerFieldName(message));
            }
        }
        return result;
    }

    protected MethodSpec generateHandleIncomingMessageHelper() {
        MethodSpec.Builder builder = MethodSpec.methodBuilder("handleIncomingMessage")
                .addModifiers(Modifier.PRIVATE)
                .addParameter(String.class, "json")
                .beginControlFlow("try")
                // Fire generic onMessage handler before type dispatch
                .beginControlFlow("if ($N != null)", onMessageHandlerField)
                .addStatement("$N.accept(json)", onMessageHandlerField)
                .endControlFlow()
                .addStatement(
                        "$T node = $N.readTree(json)",
                        ClassName.get("com.fasterxml.jackson.databind", "JsonNode"),
                        objectMapperField)
                .beginControlFlow("if (node == null || node.isNull())")
                .addStatement(
                        "throw new $T($S)", IllegalArgumentException.class, "Received null or invalid JSON message")
                .endControlFlow()
                .addStatement(
                        "$T typeNode = node.get($S)",
                        ClassName.get("com.fasterxml.jackson.databind", "JsonNode"),
                        "type")
                .beginControlFlow("if (typeNode == null || typeNode.isNull())")
                .addStatement("throw new $T($S)", IllegalArgumentException.class, "Message missing 'type' field")
                .endControlFlow()
                .addStatement("String type = typeNode.asText()")
                .beginControlFlow("switch (type)");

        // Add cases for each non-binary server message (binary messages are handled by onBinaryMessage)
        for (WebSocketMessage message : websocketChannel.getMessages()) {
            if (message.getOrigin() == WebSocketMessageOrigin.SERVER && !isMessageBodyBinary(message)) {
                TypeName messageType = getMessageBodyType(message);
                String handlerFieldName = getHandlerFieldName(message);

                builder.addCode("case $S:\n", message.getType().get())
                        .beginControlFlow("if ($L != null)", handlerFieldName)
                        .addStatement(
                                "$T event = $N.treeToValue(node, $T.class)",
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
                .beginControlFlow("if ($N != null)", onErrorHandlerField)
                .addStatement(
                        "$N.accept(new $T($S + type + $S))",
                        onErrorHandlerField,
                        RuntimeException.class,
                        "Unknown WebSocket message type: '",
                        "'. Update your SDK version to support new message types.")
                .endControlFlow()
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

    protected FieldSpec generatePathParameterField(PathParameter pathParam) {
        TypeName paramType =
                clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, pathParam.getValueType());
        return FieldSpec.builder(
                        paramType, pathParam.getName().getCamelCase().getSafeName(), Modifier.PRIVATE, Modifier.FINAL)
                .build();
    }

    protected TypeName getMessageBodyType(WebSocketMessage message) {
        if (isMessageBodyBinary(message)) {
            return ClassName.get("okio", "ByteString");
        }
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

    /**
     * Returns true if the message body is a primitive string with format "binary", indicating it should be
     * sent/received as raw bytes rather than JSON text.
     */
    protected boolean isMessageBodyBinary(WebSocketMessage message) {
        return message.getBody().visit(new WebSocketMessageBody.Visitor<Boolean>() {
            @Override
            public Boolean visitInlinedBody(InlinedWebSocketMessageBody inlinedBody) {
                return false;
            }

            @Override
            public Boolean visitReference(WebSocketMessageBodyReference reference) {
                TypeReference bodyType = reference.getBodyType();
                if (bodyType.isPrimitive()) {
                    PrimitiveType primitive = bodyType.getPrimitive().get();
                    if (primitive.getV2().isPresent()) {
                        return primitive
                                .getV2()
                                .get()
                                .visit(new com.fern.ir.model.types.PrimitiveTypeV2.Visitor<Boolean>() {
                                    @Override
                                    public Boolean visitInteger(com.fern.ir.model.types.IntegerType value) {
                                        return false;
                                    }

                                    @Override
                                    public Boolean visitLong(com.fern.ir.model.types.LongType value) {
                                        return false;
                                    }

                                    @Override
                                    public Boolean visitUint(com.fern.ir.model.types.UintType value) {
                                        return false;
                                    }

                                    @Override
                                    public Boolean visitUint64(com.fern.ir.model.types.Uint64Type value) {
                                        return false;
                                    }

                                    @Override
                                    public Boolean visitFloat(com.fern.ir.model.types.FloatType value) {
                                        return false;
                                    }

                                    @Override
                                    public Boolean visitDouble(com.fern.ir.model.types.DoubleType value) {
                                        return false;
                                    }

                                    @Override
                                    public Boolean visitBoolean(com.fern.ir.model.types.BooleanType value) {
                                        return false;
                                    }

                                    @Override
                                    public Boolean visitString(com.fern.ir.model.types.StringType value) {
                                        return value.getValidation().isPresent()
                                                && "binary"
                                                        .equals(value.getValidation()
                                                                .get()
                                                                .getFormat()
                                                                .orElse(null));
                                    }

                                    @Override
                                    public Boolean visitDate(com.fern.ir.model.types.DateType value) {
                                        return false;
                                    }

                                    @Override
                                    public Boolean visitDateTime(com.fern.ir.model.types.DateTimeType value) {
                                        return false;
                                    }

                                    @Override
                                    public Boolean visitDateTimeRfc2822(
                                            com.fern.ir.model.types.DateTimeRfc2822Type value) {
                                        return false;
                                    }

                                    @Override
                                    public Boolean visitUuid(com.fern.ir.model.types.UuidType value) {
                                        return false;
                                    }

                                    @Override
                                    public Boolean visitBase64(com.fern.ir.model.types.Base64Type value) {
                                        return true;
                                    }

                                    @Override
                                    public Boolean visitBigInteger(com.fern.ir.model.types.BigIntegerType value) {
                                        return false;
                                    }

                                    @Override
                                    public Boolean _visitUnknown(Object unknown) {
                                        return false;
                                    }
                                });
                    }
                }
                return false;
            }

            @Override
            public Boolean _visitUnknown(Object unknown) {
                return false;
            }
        });
    }

    protected String getHandlerFieldName(WebSocketMessage message) {
        // Use custom methodName if available, otherwise fall back to message type
        String baseName;
        if (message.getMethodName().isPresent()) {
            // methodName is already the desired name (e.g., "sendSettings", "onFunctionCallResponse")
            baseName = toCamelCase(message.getMethodName().get());
        } else {
            // Fall back to converting message type from snake_case to camelCase
            String messageType = message.getType().get();
            String[] parts = messageType.split("_");
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < parts.length; i++) {
                String part = parts[i];
                if (!part.isEmpty()) {
                    if (i == 0) {
                        sb.append(part.toLowerCase());
                    } else {
                        sb.append(Character.toUpperCase(part.charAt(0)));
                        if (part.length() > 1) {
                            sb.append(part.substring(1).toLowerCase());
                        }
                    }
                }
            }
            baseName = sb.toString();
        }
        return baseName + "Handler";
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

    protected String toCamelCase(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        // Handle snake_case: first part lowercase, rest capitalized
        String[] parts = str.split("_");
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            String part = parts[i];
            if (!part.isEmpty()) {
                if (i == 0) {
                    // Keep first character's case from source (handles camelCase input)
                    result.append(part);
                } else {
                    result.append(Character.toUpperCase(part.charAt(0)));
                    if (part.length() > 1) {
                        result.append(part.substring(1));
                    }
                }
            }
        }
        return result.toString();
    }

    /**
     * Returns the method name for a send operation. Uses the custom methodName from the IR if available (e.g.,
     * x-fern-sdk-method-name) as-is, otherwise falls back to "send" + capitalize(messageType).
     */
    protected String getSendMethodName(WebSocketMessage message) {
        if (message.getMethodName().isPresent()) {
            return toCamelCase(message.getMethodName().get());
        }
        return "send" + capitalize(message.getType().get());
    }

    /**
     * Returns the method name for a server message handler. Uses the custom methodName from the IR if available as-is,
     * otherwise falls back to "on" + toPascalCase(messageType). Avoids collisions with lifecycle methods that share the
     * same erasure ({@code Consumer<?>}).
     */
    protected String getMessageMethodName(WebSocketMessage message) {
        String baseName;
        if (message.getMethodName().isPresent()) {
            baseName = toCamelCase(message.getMethodName().get());
        } else {
            baseName = "on" + toPascalCase(message.getType().get());
        }
        if (RESERVED_CONSUMER_METHOD_NAMES.contains(baseName)) {
            return baseName + "Message";
        }
        return baseName;
    }

    /**
     * Gets the method name for resolving the environment URL for this WebSocket channel. For single-URL environments,
     * uses getUrl(). For multi-URL environments, uses the URL getter corresponding to the channel's baseUrl.
     */
    protected String getEnvironmentUrlMethodName() {
        if (generatedEnvironmentsClass.info() instanceof GeneratedEnvironmentsClass.SingleUrlEnvironmentClass) {
            return ((GeneratedEnvironmentsClass.SingleUrlEnvironmentClass) generatedEnvironmentsClass.info())
                    .getUrlMethod()
                    .name;
        } else if (generatedEnvironmentsClass.info() instanceof GeneratedEnvironmentsClass.MultiUrlEnvironmentsClass) {
            GeneratedEnvironmentsClass.MultiUrlEnvironmentsClass multiUrl =
                    (GeneratedEnvironmentsClass.MultiUrlEnvironmentsClass) generatedEnvironmentsClass.info();
            if (websocketChannel.getBaseUrl().isPresent()) {
                MethodSpec urlMethod = multiUrl.urlGetterMethods()
                        .get(websocketChannel.getBaseUrl().get());
                if (urlMethod != null) {
                    return urlMethod.name;
                }
            }
            // Fallback: use the first available URL method
            return multiUrl.urlGetterMethods().values().iterator().next().name;
        }
        throw new RuntimeException("Unknown environment class type: " + generatedEnvironmentsClass.info());
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
