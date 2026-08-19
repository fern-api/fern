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

import com.fern.ir.model.http.HttpPath;
import com.fern.ir.model.http.HttpPathPart;
import com.fern.ir.model.http.PathParameter;
import com.fern.ir.model.ir.Subpackage;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.EnumValue;
import com.fern.ir.model.types.Literal;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.ir.model.types.Type;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.ir.model.websocket.InlinedWebSocketMessageBody;
import com.fern.ir.model.websocket.InlinedWebSocketMessageBodyProperty;
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
import com.fern.java.utils.NameUtils;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
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

    private static final String DISCRIMINANT_FIELD = "type";

    // Wire discriminant values shared by more than one server message.
    // When a collision exists, handler/method names fall back to the message type ID
    // instead of the wire discriminant value to avoid duplicate field declarations.
    private final Set<String> collidingDiscriminantValues;

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

        // Detect wire discriminant value collisions among server messages
        Map<String, Integer> discriminantCounts = new HashMap<>();
        for (WebSocketMessage message : websocketChannel.getMessages()) {
            if (message.getOrigin() == WebSocketMessageOrigin.SERVER) {
                String wireValue = getWireDiscriminantValue(message);
                discriminantCounts.merge(wireValue, 1, Integer::sum);
            }
        }
        this.collidingDiscriminantValues = new HashSet<>();
        for (Map.Entry<String, Integer> entry : discriminantCounts.entrySet()) {
            if (entry.getValue() > 1) {
                this.collidingDiscriminantValues.add(entry.getKey());
            }
        }
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
                        message.getDisplayName().orElse(message.getType().get()))
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

    /**
     * Generates the handleIncomingMessage method that dispatches incoming WebSocket frames using shape-based trial
     * deserialization. Instead of switching on a single "type" field, each message schema's required keys and literal
     * values are checked against the JSON payload. Messages are tried in order of specificity (most constraints first)
     * so that more specific schemas match before less specific ones.
     */
    protected MethodSpec generateHandleIncomingMessageHelper() {
        MethodSpec.Builder builder = MethodSpec.methodBuilder("handleIncomingMessage")
                .addModifiers(Modifier.PRIVATE)
                .addParameter(String.class, "json")
                .beginControlFlow("try")
                // Fire generic onMessage handler before dispatch
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
                .endControlFlow();

        // Collect server text messages with precomputed shape info
        List<WebSocketMessage> serverTextMessages = new ArrayList<>();
        Map<String, List<String>> requiredKeysById = new HashMap<>();
        Map<String, Map<String, String>> literalValuesById = new HashMap<>();
        for (WebSocketMessage message : websocketChannel.getMessages()) {
            if (message.getOrigin() == WebSocketMessageOrigin.SERVER && !isMessageBodyBinary(message)) {
                serverTextMessages.add(message);
                String id = message.getType().get();
                requiredKeysById.put(id, getMessageRequiredWireKeys(message));
                literalValuesById.put(id, getMessageLiteralValues(message));
            }
        }

        // Sort by specificity (most constraints first) for correct dispatch ordering
        serverTextMessages.sort((a, b) -> {
            String idA = a.getType().get();
            String idB = b.getType().get();
            int specA = requiredKeysById.get(idA).size()
                    + literalValuesById.get(idA).size();
            int specB = requiredKeysById.get(idB).size()
                    + literalValuesById.get(idB).size();
            return Integer.compare(specB, specA);
        });

        // Emit shape-based trial deserialization for each server message
        for (WebSocketMessage message : serverTextMessages) {
            TypeName messageType = getMessageBodyType(message);
            String handlerFieldName = getHandlerFieldName(message);
            String id = message.getType().get();
            List<String> requiredKeys = requiredKeysById.get(id);
            Map<String, String> literals = literalValuesById.get(id);
            boolean hasGuards = !requiredKeys.isEmpty() || !literals.isEmpty();

            if (hasGuards) {
                CodeBlock condition = buildShapeCondition(requiredKeys, literals);
                builder.beginControlFlow("if ($L)", condition);
            }

            // Declare event variable outside try-catch so handler invocation is not
            // wrapped in the deserialization catch block (user handler exceptions must propagate).
            builder.addStatement("$T $L = null", messageType, handlerFieldName + "Event");
            builder.beginControlFlow("try")
                    .addStatement(
                            "$L = $N.treeToValue(node, $T.class)",
                            handlerFieldName + "Event",
                            objectMapperField,
                            messageType)
                    .nextControlFlow("catch ($T e)", Exception.class)
                    .endControlFlow(); // end try-catch
            builder.beginControlFlow("if ($L != null)", handlerFieldName + "Event")
                    .beginControlFlow("if ($L != null)", handlerFieldName)
                    .addStatement("$L.accept($L)", handlerFieldName, handlerFieldName + "Event")
                    .endControlFlow()
                    .addStatement("return")
                    .endControlFlow();

            if (hasGuards) {
                builder.endControlFlow(); // end if guard
            }
        }

        // Fallback: no message type matched
        addUnrecognizedMessageErrorHandler(builder);

        builder.endControlFlow() // end outer try
                .beginControlFlow("catch ($T e)", Exception.class)
                .beginControlFlow("if ($N != null)", onErrorHandlerField)
                .addStatement("$N.accept(e)", onErrorHandlerField)
                .endControlFlow()
                .endControlFlow(); // end outer catch

        return builder.build();
    }

    private CodeBlock buildShapeCondition(List<String> requiredKeys, Map<String, String> literalValues) {
        CodeBlock.Builder condition = CodeBlock.builder();
        boolean first = true;
        for (String key : requiredKeys) {
            if (!first) {
                condition.add("\n&& ");
            }
            condition.add("node.has($S)", key);
            first = false;
        }
        for (Map.Entry<String, String> entry : literalValues.entrySet()) {
            if (!first) {
                condition.add("\n&& ");
            }
            condition.add("$S.equals(node.path($S).asText())", entry.getValue(), entry.getKey());
            first = false;
        }
        return condition.build();
    }

    private void addUnrecognizedMessageErrorHandler(MethodSpec.Builder builder) {
        builder.beginControlFlow("if ($N != null)", onErrorHandlerField)
                .addStatement(
                        "$N.accept(new $T($S + json.substring(0, $T.min(200, json.length())) + $S))",
                        onErrorHandlerField,
                        RuntimeException.class,
                        "Unrecognized WebSocket message: ",
                        Math.class,
                        "... Update your SDK version to support new message types.")
                .endControlFlow();
    }

    /**
     * Returns the non-literal required wire keys for a WebSocket message body. These are properties that must be
     * present in the JSON for the message to match.
     */
    private List<String> getMessageRequiredWireKeys(WebSocketMessage message) {
        return message.getBody().visit(new WebSocketMessageBody.Visitor<List<String>>() {
            @Override
            public List<String> visitInlinedBody(InlinedWebSocketMessageBody body) {
                List<String> keys = new ArrayList<>();
                for (InlinedWebSocketMessageBodyProperty prop : body.getProperties()) {
                    if (isTypeRequired(prop.getValueType()) && !isLiteralType(prop.getValueType())) {
                        keys.add(NameUtils.getWireValue(prop.getName()));
                    }
                }
                for (DeclaredTypeName extendedType : body.getExtends()) {
                    collectRequiredWireKeysFromExtended(extendedType, keys);
                }
                return keys;
            }

            @Override
            public List<String> visitReference(WebSocketMessageBodyReference reference) {
                return getRequiredWireKeysFromType(reference.getBodyType());
            }

            @Override
            public List<String> _visitUnknown(Object unknown) {
                return Collections.emptyList();
            }
        });
    }

    /**
     * Returns literal property values for a WebSocket message body. Maps wire key to expected string value (e.g.,
     * "type" -> "transcript").
     */
    private Map<String, String> getMessageLiteralValues(WebSocketMessage message) {
        return message.getBody().visit(new WebSocketMessageBody.Visitor<Map<String, String>>() {
            @Override
            public Map<String, String> visitInlinedBody(InlinedWebSocketMessageBody body) {
                Map<String, String> literals = new LinkedHashMap<>();
                for (InlinedWebSocketMessageBodyProperty prop : body.getProperties()) {
                    getLiteralStringValue(prop.getValueType())
                            .ifPresent(value -> literals.put(NameUtils.getWireValue(prop.getName()), value));
                }
                for (DeclaredTypeName extendedType : body.getExtends()) {
                    collectLiteralValuesFromExtended(extendedType, literals);
                }
                return literals;
            }

            @Override
            public Map<String, String> visitReference(WebSocketMessageBodyReference reference) {
                return getLiteralValuesFromType(reference.getBodyType());
            }

            @Override
            public Map<String, String> _visitUnknown(Object unknown) {
                return Collections.emptyMap();
            }
        });
    }

    private List<String> getRequiredWireKeysFromType(TypeReference bodyType) {
        if (!bodyType.isNamed()) {
            return Collections.emptyList();
        }
        try {
            TypeDeclaration typeDeclaration = clientGeneratorContext.getTypeDeclaration(
                    bodyType.getNamed().get().getTypeId());
            if (!typeDeclaration.getShape().isObject()) {
                return Collections.emptyList();
            }
            ObjectTypeDeclaration objectType =
                    typeDeclaration.getShape().getObject().get();
            List<String> keys = new ArrayList<>();
            collectRequiredWireKeys(objectType, keys);
            return keys;
        } catch (IllegalArgumentException e) {
            return Collections.emptyList();
        }
    }

    private void collectRequiredWireKeys(ObjectTypeDeclaration objectType, List<String> keys) {
        for (ObjectProperty property : objectType.getProperties()) {
            if (isTypeRequired(property.getValueType()) && !isLiteralType(property.getValueType())) {
                keys.add(NameUtils.getWireValue(property.getName()));
            }
        }
        for (DeclaredTypeName extendedType : objectType.getExtends()) {
            collectRequiredWireKeysFromExtended(extendedType, keys);
        }
    }

    private void collectRequiredWireKeysFromExtended(DeclaredTypeName extendedType, List<String> keys) {
        try {
            TypeDeclaration extDeclaration = clientGeneratorContext.getTypeDeclaration(extendedType.getTypeId());
            if (extDeclaration != null && extDeclaration.getShape().isObject()) {
                collectRequiredWireKeys(extDeclaration.getShape().getObject().get(), keys);
            }
        } catch (IllegalArgumentException e) {
            // Type not found in IR declarations
        }
    }

    private Map<String, String> getLiteralValuesFromType(TypeReference bodyType) {
        if (!bodyType.isNamed()) {
            return Collections.emptyMap();
        }
        try {
            TypeDeclaration typeDeclaration = clientGeneratorContext.getTypeDeclaration(
                    bodyType.getNamed().get().getTypeId());
            if (!typeDeclaration.getShape().isObject()) {
                return Collections.emptyMap();
            }
            ObjectTypeDeclaration objectType =
                    typeDeclaration.getShape().getObject().get();
            Map<String, String> literals = new LinkedHashMap<>();
            collectLiteralValues(objectType, literals);
            return literals;
        } catch (IllegalArgumentException e) {
            return Collections.emptyMap();
        }
    }

    private void collectLiteralValues(ObjectTypeDeclaration objectType, Map<String, String> literals) {
        for (ObjectProperty property : objectType.getProperties()) {
            getLiteralStringValue(property.getValueType())
                    .ifPresent(value -> literals.put(NameUtils.getWireValue(property.getName()), value));
        }
        for (DeclaredTypeName extendedType : objectType.getExtends()) {
            collectLiteralValuesFromExtended(extendedType, literals);
        }
    }

    private void collectLiteralValuesFromExtended(DeclaredTypeName extendedType, Map<String, String> literals) {
        try {
            TypeDeclaration extDeclaration = clientGeneratorContext.getTypeDeclaration(extendedType.getTypeId());
            if (extDeclaration != null && extDeclaration.getShape().isObject()) {
                collectLiteralValues(extDeclaration.getShape().getObject().get(), literals);
            }
        } catch (IllegalArgumentException e) {
            // Type not found in IR declarations
        }
    }

    private boolean isTypeRequired(TypeReference typeRef) {
        if (typeRef.isContainer()) {
            ContainerType container = typeRef.getContainer().get();
            return !(container.isOptional() || container.isNullable());
        }
        return true;
    }

    private boolean isLiteralType(TypeReference typeRef) {
        return typeRef.isContainer()
                && typeRef.getContainer().flatMap(ContainerType::getLiteral).isPresent();
    }

    private Optional<String> getLiteralStringValue(TypeReference typeRef) {
        if (!typeRef.isContainer()) {
            return Optional.empty();
        }
        return typeRef.getContainer().flatMap(ContainerType::getLiteral).flatMap(literal -> {
            // Handle string literals directly
            Optional<String> str = literal.getString();
            if (str.isPresent()) {
                return str;
            }
            // Handle boolean literals by converting to their string representation
            // so they can be checked via node.path("key").asText()
            return literal.getBoolean().map(b -> b.toString());
        });
    }

    /**
     * Extracts the wire discriminant value for a WebSocket message by examining the body's literal "type" property.
     * Falls back to the message ID if no literal type is found.
     *
     * <p>For inlined bodies, looks for a property with wire name "type" that has a literal value. For reference bodies,
     * resolves the type declaration and checks its object properties.
     */
    protected String getWireDiscriminantValue(WebSocketMessage message) {
        String messageId = message.getType().get();
        return message.getBody().visit(new WebSocketMessageBody.Visitor<String>() {
            @Override
            public String visitInlinedBody(InlinedWebSocketMessageBody inlinedBody) {
                for (InlinedWebSocketMessageBodyProperty property : inlinedBody.getProperties()) {
                    if (DISCRIMINANT_FIELD.equals(NameUtils.getWireValue(property.getName()))) {
                        Optional<String> value =
                                extractDiscriminantFromTypeProperty(property.getValueType(), messageId);
                        if (value.isPresent()) {
                            return value.get();
                        }
                    }
                }
                return messageId;
            }

            @Override
            public String visitReference(WebSocketMessageBodyReference reference) {
                Optional<String> value = extractTypeLiteralFromReference(reference.getBodyType(), messageId);
                if (value.isPresent()) {
                    return value.get();
                }
                return messageId;
            }

            @Override
            public String _visitUnknown(Object unknown) {
                return messageId;
            }
        });
    }

    /**
     * Extracts the wire discriminant string from a TypeReference for the "type" property. First checks for a literal
     * container, then for an enum type where one value matches the message ID suffix.
     */
    private Optional<String> extractDiscriminantFromTypeProperty(TypeReference typeReference, String messageId) {
        // Check for literal container (e.g., literal<"Welcome">)
        Optional<String> literal =
                typeReference.getContainer().flatMap(ContainerType::getLiteral).flatMap(Literal::getString);
        if (literal.isPresent()) {
            return literal;
        }
        // Check for enum type where a value matches the message ID suffix
        return extractMatchingEnumValue(typeReference, messageId);
    }

    /**
     * For an enum-typed property, finds the enum value whose wire value matches the message ID. Tries exact match
     * first, then suffix match (e.g., message ID "SpeakV1Flushed" with enum values ["Flushed", "Cleared"] → returns
     * "Flushed").
     */
    private Optional<String> extractMatchingEnumValue(TypeReference typeReference, String messageId) {
        if (!typeReference.isNamed()) {
            return Optional.empty();
        }
        try {
            TypeDeclaration typeDeclaration = clientGeneratorContext.getTypeDeclaration(
                    typeReference.getNamed().get().getTypeId());
            if (!typeDeclaration.getShape().isEnum()) {
                return Optional.empty();
            }
            // Prefer exact match over suffix match to avoid ambiguity
            Optional<String> suffixMatch = Optional.empty();
            for (EnumValue enumValue :
                    typeDeclaration.getShape().getEnum().get().getValues()) {
                String wireValue = NameUtils.getWireValue(enumValue.getName());
                if (messageId.equals(wireValue)) {
                    return Optional.of(wireValue);
                }
                if (suffixMatch.isEmpty() && messageId.endsWith(wireValue)) {
                    suffixMatch = Optional.of(wireValue);
                }
            }
            return suffixMatch;
        } catch (IllegalArgumentException e) {
            // Type not found in IR declarations, fall back to message ID
        }
        return Optional.empty();
    }

    /**
     * For a reference body type, resolves the type declaration and looks for a literal or enum-based "type" property in
     * the object's properties.
     */
    private Optional<String> extractTypeLiteralFromReference(TypeReference bodyType, String messageId) {
        if (!bodyType.isNamed()) {
            return Optional.empty();
        }
        try {
            TypeDeclaration typeDeclaration = clientGeneratorContext.getTypeDeclaration(
                    bodyType.getNamed().get().getTypeId());
            Type shape = typeDeclaration.getShape();
            if (!shape.isObject()) {
                return Optional.empty();
            }
            ObjectTypeDeclaration objectType = shape.getObject().get();
            for (ObjectProperty property : objectType.getProperties()) {
                if (DISCRIMINANT_FIELD.equals(NameUtils.getWireValue(property.getName()))) {
                    return extractDiscriminantFromTypeProperty(property.getValueType(), messageId);
                }
            }
        } catch (IllegalArgumentException e) {
            // Type not found in declarations, fall back
        }
        return Optional.empty();
    }

    protected FieldSpec generatePathParameterField(PathParameter pathParam) {
        TypeName paramType =
                clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, pathParam.getValueType());
        return FieldSpec.builder(
                        paramType,
                        NameUtils.toName(pathParam.getName()).getCamelCase().getSafeName(),
                        Modifier.PRIVATE,
                        Modifier.FINAL)
                .build();
    }

    /**
     * Appends path-building code to the method builder. For static paths (no path parameters), emits a simple string
     * literal. For dynamic paths, uses a StringBuilder to concatenate the head, path parameters, and tails.
     */
    protected void appendPathBuildingCode(MethodSpec.Builder builder) {
        HttpPath path = websocketChannel.getPath();
        if (path.getParts().isEmpty()) {
            builder.addStatement("String fullPath = $S", path.getHead());
        } else {
            builder.addStatement("$T pathBuilder = new $T()", StringBuilder.class, StringBuilder.class);
            builder.addStatement("pathBuilder.append($S)", path.getHead());
            for (HttpPathPart part : path.getParts()) {
                String pathParamId = part.getPathParameter();
                if (pathParamId != null && !pathParamId.isEmpty()) {
                    PathParameter matchingParam = websocketChannel.getPathParameters().stream()
                            .filter(p -> NameUtils.toName(p.getName())
                                    .getOriginalName()
                                    .equals(pathParamId))
                            .findFirst()
                            .orElseThrow();
                    String paramFieldName = NameUtils.toName(matchingParam.getName())
                            .getCamelCase()
                            .getSafeName();
                    builder.addStatement("pathBuilder.append($L)", paramFieldName);
                }
                builder.addStatement("pathBuilder.append($S)", part.getTail());
            }
            builder.addStatement("String fullPath = pathBuilder.toString()");
        }
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
        // Use custom methodName if available, otherwise fall back to wire discriminant value
        String baseName;
        if (message.getMethodName().isPresent()) {
            baseName = toCamelCase(message.getMethodName().get());
        } else {
            String wireValue = getWireDiscriminantValue(message);
            if (collidingDiscriminantValues.contains(wireValue)) {
                // Multiple messages share this wire value — use message type ID to disambiguate
                baseName = decapitalize(toCamelCase(message.getType().get()));
            } else {
                baseName = decapitalize(toCamelCase(wireValue));
            }
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

    protected String decapitalize(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return Character.toLowerCase(str.charAt(0)) + str.substring(1);
    }

    /** Returns "an X" or "a X" depending on whether X starts with a vowel sound. */
    protected String articleFor(String name) {
        if (name != null && !name.isEmpty() && "AEIOUaeiou".indexOf(name.charAt(0)) >= 0) {
            return "an " + name;
        }
        return "a " + name;
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
            String wireValue = getWireDiscriminantValue(message);
            if (collidingDiscriminantValues.contains(wireValue)) {
                // Multiple messages share this wire value — use message type ID to disambiguate
                baseName = "on" + toPascalCase(message.getType().get());
            } else {
                baseName = "on" + toPascalCase(wireValue);
            }
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
                        NameUtils.toName(websocketChannel.getName().get())
                                .getCamelCase()
                                .getSafeName())
                .add("Provides real-time bidirectional communication with strongly-typed messages.\n")
                .build();
    }
}
