package com.fern.java.client.generators.websocket;

import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;
import javax.lang.model.element.Modifier;

/**
 * Generator for ReconnectingWebSocketListener abstract class. This provides reconnection logic with exponential
 * backoff, message queuing, and connection state management.
 */
public class ReconnectingWebSocketListenerGenerator {

    private static final String CLASS_NAME = "ReconnectingWebSocketListener";

    // Configuration constants
    private static final long MIN_RECONNECTION_DELAY_MS = 1000L;
    private static final long MAX_RECONNECTION_DELAY_MS = 10000L;
    private static final double RECONNECTION_DELAY_GROW_FACTOR = 1.3;
    private static final long MIN_UPTIME_MS = 5000L;
    private static final long CONNECTION_TIMEOUT_MS = 4000L;
    private static final int DEFAULT_MAX_RETRIES = Integer.MAX_VALUE;
    private static final int DEFAULT_MAX_ENQUEUED_MESSAGES = 1000;

    private final String corePackageName;
    private final ClassName className;

    public ReconnectingWebSocketListenerGenerator(String corePackageName) {
        this.corePackageName = corePackageName;
        this.className = ClassName.get(corePackageName, CLASS_NAME);
    }

    public GeneratedJavaFile generateListener() {
        TypeSpec classSpec = TypeSpec.classBuilder(CLASS_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .superclass(ClassName.get("okhttp3", "WebSocketListener"))
                .addJavadoc("WebSocketListener with automatic reconnection, exponential backoff, and message queuing.\n"
                        + "Provides production-ready resilience for WebSocket connections.\n")
                .addFields(generateFields())
                .addMethods(generateMethods())
                .addType(generateReconnectOptionsClass())
                .build();

        JavaFile javaFile = JavaFile.builder(corePackageName, classSpec)
                .skipJavaLangImports(true)
                .addStaticImport(TimeUnit.class, "*")
                .build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }

    private Iterable<FieldSpec> generateFields() {
        return java.util.Arrays.asList(
                // Configuration
                FieldSpec.builder(TypeName.LONG, "minReconnectionDelayMs", Modifier.PRIVATE, Modifier.FINAL)
                        .build(),
                FieldSpec.builder(TypeName.LONG, "maxReconnectionDelayMs", Modifier.PRIVATE, Modifier.FINAL)
                        .build(),
                FieldSpec.builder(TypeName.DOUBLE, "reconnectionDelayGrowFactor", Modifier.PRIVATE, Modifier.FINAL)
                        .build(),
                FieldSpec.builder(TypeName.INT, "maxRetries", Modifier.PRIVATE, Modifier.FINAL)
                        .build(),
                FieldSpec.builder(TypeName.INT, "maxEnqueuedMessages", Modifier.PRIVATE, Modifier.FINAL)
                        .build(),

                // State management (thread-safe)
                FieldSpec.builder(
                                ParameterizedTypeName.get(AtomicInteger.class),
                                "retryCount",
                                Modifier.PRIVATE,
                                Modifier.FINAL)
                        .initializer("new $T(0)", AtomicInteger.class)
                        .build(),
                FieldSpec.builder(
                                ParameterizedTypeName.get(AtomicBoolean.class),
                                "connectLock",
                                Modifier.PRIVATE,
                                Modifier.FINAL)
                        .initializer("new $T(false)", AtomicBoolean.class)
                        .build(),
                FieldSpec.builder(
                                ParameterizedTypeName.get(AtomicBoolean.class),
                                "shouldReconnect",
                                Modifier.PRIVATE,
                                Modifier.FINAL)
                        .initializer("new $T(true)", AtomicBoolean.class)
                        .build(),
                FieldSpec.builder(
                                ClassName.get("okhttp3", "WebSocket"),
                                "webSocket",
                                Modifier.PROTECTED,
                                Modifier.VOLATILE)
                        .build(),

                // Connection time tracking for min uptime check
                FieldSpec.builder(TypeName.LONG, "connectionEstablishedTime", Modifier.PRIVATE, Modifier.VOLATILE)
                        .initializer("0L")
                        .build(),

                // Message queue (thread-safe)
                FieldSpec.builder(
                                ParameterizedTypeName.get(ConcurrentLinkedQueue.class, String.class),
                                "messageQueue",
                                Modifier.PRIVATE,
                                Modifier.FINAL)
                        .initializer("new $T<>()", ConcurrentLinkedQueue.class)
                        .build(),

                // Executors
                FieldSpec.builder(ScheduledExecutorService.class, "reconnectExecutor", Modifier.PRIVATE, Modifier.FINAL)
                        .initializer("$T.newSingleThreadScheduledExecutor()", Executors.class)
                        .build(),

                // Connection provider
                FieldSpec.builder(
                                ParameterizedTypeName.get(
                                        ClassName.get(Supplier.class),
                                        WildcardTypeName.subtypeOf(ClassName.get("okhttp3", "WebSocket"))),
                                "connectionSupplier",
                                Modifier.PRIVATE,
                                Modifier.FINAL)
                        .build());
    }

    private Iterable<MethodSpec> generateMethods() {
        List<MethodSpec> methods = new ArrayList<>();
        methods.add(generateConstructor());
        methods.add(generateConnect());
        methods.add(generateDisconnect());
        methods.add(generateSend());
        methods.add(generateGetWebSocket()); // Add getter for thread-safe WebSocket access
        methods.add(generateOnOpen());
        methods.add(generateOnMessage());
        methods.add(generateOnFailure());
        methods.add(generateOnClosed());
        methods.add(generateGetNextDelay());
        methods.add(generateScheduleReconnect());
        methods.add(generateFlushMessageQueue());
        methods.addAll(Arrays.asList(generateAbstractMethods()));
        return methods;
    }

    private MethodSpec generateConstructor() {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(ClassName.get(corePackageName, CLASS_NAME + ".ReconnectOptions"), "options")
                .addParameter(
                        ParameterizedTypeName.get(
                                ClassName.get(Supplier.class),
                                WildcardTypeName.subtypeOf(ClassName.get("okhttp3", "WebSocket"))),
                        "connectionSupplier")
                .addJavadoc("Creates a new reconnecting WebSocket listener.\n"
                        + "\n"
                        + "@param options Reconnection configuration options\n"
                        + "@param connectionSupplier Supplier that creates new WebSocket connections\n")
                .addStatement("this.minReconnectionDelayMs = options.minReconnectionDelayMs")
                .addStatement("this.maxReconnectionDelayMs = options.maxReconnectionDelayMs")
                .addStatement("this.reconnectionDelayGrowFactor = options.reconnectionDelayGrowFactor")
                .addStatement("this.maxRetries = options.maxRetries")
                .addStatement("this.maxEnqueuedMessages = options.maxEnqueuedMessages")
                .addStatement("this.connectionSupplier = connectionSupplier")
                .build();
    }

    private MethodSpec generateConnect() {
        return MethodSpec.methodBuilder("connect")
                .addModifiers(Modifier.PUBLIC)
                .returns(TypeName.VOID)
                .addJavadoc("Initiates a WebSocket connection with automatic reconnection enabled.\n"
                        + "\n"
                        + "Connection behavior:\n"
                        + "- Times out after " + CONNECTION_TIMEOUT_MS + " milliseconds\n"
                        + "- Thread-safe via atomic lock (returns immediately if connection in progress)\n"
                        + "- Retry count not incremented for initial connection attempt\n"
                        + "\n"
                        + "Error handling:\n"
                        + "- TimeoutException: Includes retry attempt context\n"
                        + "- InterruptedException: Preserves thread interruption status\n"
                        + "- ExecutionException: Extracts actual cause and adds context\n")
                .beginControlFlow("if (!connectLock.compareAndSet(false, true))")
                .addStatement("return")
                .endControlFlow()
                .beginControlFlow("if (retryCount.get() >= maxRetries)")
                .addStatement("connectLock.set(false)")
                .addStatement("return")
                .endControlFlow()
                .beginControlFlow("try")
                .addStatement(
                        "$T<? extends $T> connectionFuture = $T.supplyAsync(connectionSupplier)",
                        CompletableFuture.class,
                        ClassName.get("okhttp3", "WebSocket"),
                        CompletableFuture.class)
                .beginControlFlow("try")
                .addStatement(
                        "webSocket = connectionFuture.get($L, $T.MILLISECONDS)", CONNECTION_TIMEOUT_MS, TimeUnit.class)
                .endControlFlow()
                .beginControlFlow("catch ($T e)", TimeoutException.class)
                .addStatement("connectionFuture.cancel(true)")
                .addStatement(
                        "$T timeoutError = new $T($S + $L + $S + (retryCount.get() > 0 ? $S + retryCount.get() : $S))",
                        TimeoutException.class,
                        TimeoutException.class,
                        "WebSocket connection timeout after ",
                        CONNECTION_TIMEOUT_MS,
                        " milliseconds",
                        " (retry attempt #",
                        " (initial connection attempt)")
                .addStatement("onWebSocketFailure(null, timeoutError, null)")
                .beginControlFlow("if (shouldReconnect.get())")
                .addStatement("scheduleReconnect()")
                .endControlFlow()
                .endControlFlow()
                .beginControlFlow("catch ($T e)", InterruptedException.class)
                .addStatement("connectionFuture.cancel(true)")
                .addStatement("$T.currentThread().interrupt()", Thread.class)
                .addStatement(
                        "$T interruptError = new $T($S + (retryCount.get() > 0 ? $S + retryCount.get() : $S))",
                        InterruptedException.class,
                        InterruptedException.class,
                        "WebSocket connection interrupted",
                        " during retry attempt #",
                        " during initial connection")
                .addStatement("interruptError.initCause(e)")
                .addStatement("onWebSocketFailure(null, interruptError, null)")
                .endControlFlow()
                .beginControlFlow("catch ($T e)", ExecutionException.class)
                .addStatement("$T cause = e.getCause() != null ? e.getCause() : e", Throwable.class)
                .addStatement(
                        "String context = retryCount.get() > 0 ? $S + retryCount.get() : $S",
                        "WebSocket connection failed during retry attempt #",
                        "WebSocket connection failed during initial attempt")
                .addStatement(
                        "$T wrappedException = new $T(context + $S + cause.getClass().getSimpleName() + $S + cause.getMessage())",
                        RuntimeException.class,
                        RuntimeException.class,
                        ": ",
                        ": ")
                .addStatement("wrappedException.initCause(cause)")
                .addStatement("onWebSocketFailure(null, wrappedException, null)")
                .beginControlFlow("if (shouldReconnect.get())")
                .addStatement("scheduleReconnect()")
                .endControlFlow()
                .endControlFlow()
                .endControlFlow()
                .beginControlFlow("finally")
                .addStatement("connectLock.set(false)")
                .endControlFlow()
                .build();
    }

    private MethodSpec generateDisconnect() {
        return MethodSpec.methodBuilder("disconnect")
                .addModifiers(Modifier.PUBLIC)
                .returns(TypeName.VOID)
                .addJavadoc("Disconnects the WebSocket and disables automatic reconnection.\n"
                        + "\n"
                        + "This method:\n"
                        + "- Disables automatic reconnection\n"
                        + "- Clears queued messages to prevent stale data\n"
                        + "- Closes the WebSocket with standard close code 1000\n"
                        + "- Properly shuts down the reconnect executor to prevent thread leaks\n"
                        + "- Waits up to 5 seconds for executor termination\n")
                .addStatement("shouldReconnect.set(false)")
                .addStatement("messageQueue.clear()")
                .beginControlFlow("if (webSocket != null)")
                .addStatement("webSocket.close(1000, \"Client disconnecting\")")
                .endControlFlow()
                .addStatement("reconnectExecutor.shutdown()")
                .beginControlFlow("try")
                .beginControlFlow("if (!reconnectExecutor.awaitTermination(5, $T.SECONDS))", TimeUnit.class)
                .addStatement("reconnectExecutor.shutdownNow()")
                .endControlFlow()
                .endControlFlow()
                .beginControlFlow("catch ($T e)", InterruptedException.class)
                .addStatement("reconnectExecutor.shutdownNow()")
                .addStatement("$T.currentThread().interrupt()", Thread.class)
                .endControlFlow()
                .build();
    }

    private MethodSpec generateSend() {
        return MethodSpec.methodBuilder("send")
                .addModifiers(Modifier.PUBLIC, Modifier.SYNCHRONIZED)
                .returns(TypeName.BOOLEAN)
                .addParameter(String.class, "message")
                .addJavadoc("Sends a message or queues it if not connected.\n"
                        + "\n"
                        + "Thread-safe: Synchronized to prevent race conditions with flushMessageQueue().\n"
                        + "\n"
                        + "Behavior:\n"
                        + "- If connected: Attempts direct send, queues if buffer full\n"
                        + "- If disconnected: Queues message up to maxEnqueuedMessages limit\n"
                        + "- If queue full: Message is dropped\n"
                        + "\n"
                        + "@param message The message to send\n"
                        + "@return true if sent immediately, false if queued or dropped\n")
                .addStatement("$T ws = webSocket", ClassName.get("okhttp3", "WebSocket"))
                .beginControlFlow("if (ws != null)")
                .addStatement("boolean sent = ws.send(message)")
                .beginControlFlow("if (!sent && messageQueue.size() < maxEnqueuedMessages)")
                .addStatement("messageQueue.offer(message)")
                .addStatement("return false")
                .endControlFlow()
                .addStatement("return sent")
                .endControlFlow()
                .beginControlFlow("else")
                .beginControlFlow("if (messageQueue.size() < maxEnqueuedMessages)")
                .addStatement("messageQueue.offer(message)")
                .addStatement("return false")
                .endControlFlow()
                .addStatement("return false")
                .endControlFlow()
                .build();
    }

    private MethodSpec generateGetWebSocket() {
        return MethodSpec.methodBuilder("getWebSocket")
                .addModifiers(Modifier.PUBLIC)
                .returns(ClassName.get("okhttp3", "WebSocket"))
                .addJavadoc("Gets the current WebSocket instance.\n")
                .addJavadoc("Thread-safe method to access the WebSocket connection.\n")
                .addJavadoc("@return the WebSocket or null if not connected\n")
                .addStatement("return webSocket")
                .build();
    }

    private MethodSpec generateOnOpen() {
        return MethodSpec.methodBuilder("onOpen")
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(TypeName.VOID)
                .addParameter(ClassName.get("okhttp3", "WebSocket"), "webSocket")
                .addParameter(ClassName.get("okhttp3", "Response"), "response")
                .addJavadoc("@hidden\n")
                .addStatement("this.webSocket = webSocket")
                .addStatement("connectionEstablishedTime = $T.currentTimeMillis()", System.class)
                .addStatement("retryCount.set(0)")
                .addStatement("flushMessageQueue()")
                .addStatement("onWebSocketOpen(webSocket, response)")
                .build();
    }

    private MethodSpec generateOnMessage() {
        return MethodSpec.methodBuilder("onMessage")
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(TypeName.VOID)
                .addParameter(ClassName.get("okhttp3", "WebSocket"), "webSocket")
                .addParameter(String.class, "text")
                .addStatement("onWebSocketMessage(webSocket, text)")
                .build();
    }

    private MethodSpec generateOnFailure() {
        return MethodSpec.methodBuilder("onFailure")
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(TypeName.VOID)
                .addParameter(ClassName.get("okhttp3", "WebSocket"), "webSocket")
                .addParameter(Throwable.class, "t")
                .addParameter(ClassName.get("okhttp3", "Response"), "response")
                .addJavadoc("@hidden\n")
                .addStatement("this.webSocket = null")
                .addStatement("long uptime = 0L")
                .beginControlFlow("if (connectionEstablishedTime > 0)")
                .addStatement("uptime = $T.currentTimeMillis() - connectionEstablishedTime", System.class)
                .beginControlFlow("if (uptime >= $L)", MIN_UPTIME_MS)
                .addStatement("retryCount.set(0)")
                .endControlFlow()
                .endControlFlow()
                .addStatement("connectionEstablishedTime = 0L")
                .addStatement("$T enhancedError = t", Throwable.class)
                .beginControlFlow("if (t != null)")
                .addStatement("String errorContext = $S", "WebSocket connection failed")
                .beginControlFlow("if (uptime > 0)")
                .addStatement("errorContext += $S + (uptime / 1000) + $S", " after ", " seconds")
                .endControlFlow()
                .beginControlFlow("if (response != null)")
                .addStatement("errorContext += $S + response.code() + $S + response.message()", " with HTTP ", " ")
                .endControlFlow()
                .addStatement(
                        "enhancedError = new $T(errorContext + $S + t.getClass().getSimpleName() + $S + t.getMessage())",
                        RuntimeException.class,
                        ": ",
                        ": ")
                .addStatement("enhancedError.initCause(t)")
                .endControlFlow()
                .addStatement("onWebSocketFailure(webSocket, enhancedError, response)")
                .beginControlFlow("if (shouldReconnect.get())")
                .addStatement("scheduleReconnect()")
                .endControlFlow()
                .build();
    }

    private MethodSpec generateOnClosed() {
        return MethodSpec.methodBuilder("onClosed")
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(TypeName.VOID)
                .addParameter(ClassName.get("okhttp3", "WebSocket"), "webSocket")
                .addParameter(TypeName.INT, "code")
                .addParameter(String.class, "reason")
                .addJavadoc("@hidden\n")
                .addStatement("this.webSocket = null")
                .beginControlFlow("if (connectionEstablishedTime > 0)")
                .addStatement("long uptime = $T.currentTimeMillis() - connectionEstablishedTime", System.class)
                .beginControlFlow("if (uptime >= $L)", MIN_UPTIME_MS)
                .addStatement("retryCount.set(0)")
                .endControlFlow()
                .endControlFlow()
                .addStatement("connectionEstablishedTime = 0L")
                .addStatement("onWebSocketClosed(webSocket, code, reason)")
                .beginControlFlow("if (code != 1000 && shouldReconnect.get())")
                .addStatement("scheduleReconnect()")
                .endControlFlow()
                .build();
    }

    private MethodSpec generateGetNextDelay() {
        return MethodSpec.methodBuilder("getNextDelay")
                .addModifiers(Modifier.PRIVATE)
                .returns(TypeName.LONG)
                .addJavadoc("Calculates the next reconnection delay using exponential backoff.\n"
                        + "\n"
                        + "Uses 0-based retry count where:\n"
                        + "- 0 = initial connection (not used by this method)\n"
                        + "- 1 = first retry (returns minReconnectionDelayMs)\n"
                        + "- 2+ = exponential backoff up to maxReconnectionDelayMs\n")
                .beginControlFlow("if (retryCount.get() == 1)")
                .addStatement("return minReconnectionDelayMs")
                .endControlFlow()
                .addStatement(
                        "long delay = (long)(minReconnectionDelayMs * Math.pow(reconnectionDelayGrowFactor, retryCount.get() - 1))")
                .addStatement("return Math.min(delay, maxReconnectionDelayMs)")
                .build();
    }

    private MethodSpec generateScheduleReconnect() {
        return MethodSpec.methodBuilder("scheduleReconnect")
                .addModifiers(Modifier.PRIVATE)
                .returns(TypeName.VOID)
                .addJavadoc("Schedules a reconnection attempt with appropriate delay.\n"
                        + "Increments retry count and uses exponential backoff.\n")
                .addStatement("retryCount.incrementAndGet()")
                .addStatement("long delay = getNextDelay()")
                .addStatement("reconnectExecutor.schedule(this::connect, delay, MILLISECONDS)")
                .build();
    }

    private MethodSpec generateFlushMessageQueue() {
        return MethodSpec.methodBuilder("flushMessageQueue")
                .addModifiers(Modifier.PRIVATE, Modifier.SYNCHRONIZED)
                .returns(TypeName.VOID)
                .addJavadoc("Sends all queued messages after reconnection.\n"
                        + "\n"
                        + "Thread-safe: Synchronized to prevent race conditions with send() method.\n"
                        + "\n"
                        + "Algorithm:\n"
                        + "1. Drains queue into temporary list to avoid holding lock during sends\n"
                        + "2. Attempts to send each message in order\n"
                        + "3. If any send fails, re-queues that message and all subsequent messages\n"
                        + "4. Preserves message ordering during re-queueing\n")
                .addStatement("$T ws = webSocket", ClassName.get("okhttp3", "WebSocket"))
                .beginControlFlow("if (ws != null)")
                .addStatement(
                        "$T<String> tempQueue = new $T<>()",
                        ClassName.get("java.util", "ArrayList"),
                        ClassName.get("java.util", "ArrayList"))
                .addStatement("String message")
                .beginControlFlow("while ((message = messageQueue.poll()) != null)")
                .addStatement("tempQueue.add(message)")
                .endControlFlow()
                .beginControlFlow("for (String msg : tempQueue)")
                .beginControlFlow("if (!ws.send(msg))")
                .addStatement("messageQueue.offer(msg)")
                .beginControlFlow("for (int i = tempQueue.indexOf(msg) + 1; i < tempQueue.size(); i++)")
                .addStatement("messageQueue.offer(tempQueue.get(i))")
                .endControlFlow()
                .addStatement("break")
                .endControlFlow()
                .endControlFlow()
                .endControlFlow()
                .build();
    }

    private MethodSpec[] generateAbstractMethods() {
        return new MethodSpec[] {
            MethodSpec.methodBuilder("onWebSocketOpen")
                    .addModifiers(Modifier.PROTECTED, Modifier.ABSTRACT)
                    .returns(TypeName.VOID)
                    .addParameter(ClassName.get("okhttp3", "WebSocket"), "webSocket")
                    .addParameter(ClassName.get("okhttp3", "Response"), "response")
                    .build(),
            MethodSpec.methodBuilder("onWebSocketMessage")
                    .addModifiers(Modifier.PROTECTED, Modifier.ABSTRACT)
                    .returns(TypeName.VOID)
                    .addParameter(ClassName.get("okhttp3", "WebSocket"), "webSocket")
                    .addParameter(String.class, "text")
                    .build(),
            MethodSpec.methodBuilder("onWebSocketFailure")
                    .addModifiers(Modifier.PROTECTED, Modifier.ABSTRACT)
                    .returns(TypeName.VOID)
                    .addParameter(ClassName.get("okhttp3", "WebSocket"), "webSocket")
                    .addParameter(Throwable.class, "t")
                    .addParameter(ClassName.get("okhttp3", "Response"), "response")
                    .build(),
            MethodSpec.methodBuilder("onWebSocketClosed")
                    .addModifiers(Modifier.PROTECTED, Modifier.ABSTRACT)
                    .returns(TypeName.VOID)
                    .addParameter(ClassName.get("okhttp3", "WebSocket"), "webSocket")
                    .addParameter(TypeName.INT, "code")
                    .addParameter(String.class, "reason")
                    .build()
        };
    }

    private TypeSpec generateReconnectOptionsClass() {
        return TypeSpec.classBuilder("ReconnectOptions")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                .addJavadoc("Configuration options for automatic reconnection.\n")
                .addField(FieldSpec.builder(TypeName.LONG, "minReconnectionDelayMs", Modifier.PUBLIC, Modifier.FINAL)
                        .build())
                .addField(FieldSpec.builder(TypeName.LONG, "maxReconnectionDelayMs", Modifier.PUBLIC, Modifier.FINAL)
                        .build())
                .addField(FieldSpec.builder(
                                TypeName.DOUBLE, "reconnectionDelayGrowFactor", Modifier.PUBLIC, Modifier.FINAL)
                        .build())
                .addField(FieldSpec.builder(TypeName.INT, "maxRetries", Modifier.PUBLIC, Modifier.FINAL)
                        .build())
                .addField(FieldSpec.builder(TypeName.INT, "maxEnqueuedMessages", Modifier.PUBLIC, Modifier.FINAL)
                        .build())
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .addParameter(ClassName.get("", "Builder"), "builder")
                        .addStatement("this.minReconnectionDelayMs = builder.minReconnectionDelayMs")
                        .addStatement("this.maxReconnectionDelayMs = builder.maxReconnectionDelayMs")
                        .addStatement("this.reconnectionDelayGrowFactor = builder.reconnectionDelayGrowFactor")
                        .addStatement("this.maxRetries = builder.maxRetries")
                        .addStatement("this.maxEnqueuedMessages = builder.maxEnqueuedMessages")
                        .build())
                .addMethod(MethodSpec.methodBuilder("builder")
                        .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                        .returns(ClassName.get("", "Builder"))
                        .addStatement("return new Builder()")
                        .build())
                .addType(generateBuilder())
                .build();
    }

    private TypeSpec generateBuilder() {
        ClassName builderClass = ClassName.get("", "Builder");
        return TypeSpec.classBuilder("Builder")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                .addField(TypeName.LONG, "minReconnectionDelayMs", Modifier.PRIVATE)
                .addField(TypeName.LONG, "maxReconnectionDelayMs", Modifier.PRIVATE)
                .addField(TypeName.DOUBLE, "reconnectionDelayGrowFactor", Modifier.PRIVATE)
                .addField(TypeName.INT, "maxRetries", Modifier.PRIVATE)
                .addField(TypeName.INT, "maxEnqueuedMessages", Modifier.PRIVATE)
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PUBLIC)
                        .addStatement("this.minReconnectionDelayMs = $L", MIN_RECONNECTION_DELAY_MS)
                        .addStatement("this.maxReconnectionDelayMs = $L", MAX_RECONNECTION_DELAY_MS)
                        .addStatement("this.reconnectionDelayGrowFactor = $L", RECONNECTION_DELAY_GROW_FACTOR)
                        .addStatement("this.maxRetries = $L", DEFAULT_MAX_RETRIES)
                        .addStatement("this.maxEnqueuedMessages = $L", DEFAULT_MAX_ENQUEUED_MESSAGES)
                        .build())
                .addMethod(builderMethod("minReconnectionDelayMs", TypeName.LONG, builderClass))
                .addMethod(builderMethod("maxReconnectionDelayMs", TypeName.LONG, builderClass))
                .addMethod(builderMethod("reconnectionDelayGrowFactor", TypeName.DOUBLE, builderClass))
                .addMethod(builderMethod("maxRetries", TypeName.INT, builderClass))
                .addMethod(builderMethod("maxEnqueuedMessages", TypeName.INT, builderClass))
                .addMethod(MethodSpec.methodBuilder("build")
                        .addModifiers(Modifier.PUBLIC)
                        .returns(ClassName.get("", "ReconnectOptions"))
                        .addJavadoc("Builds the ReconnectOptions with validation.\n"
                                + "\n"
                                + "Validates that:\n"
                                + "- All delay values are positive\n"
                                + "- minReconnectionDelayMs <= maxReconnectionDelayMs\n"
                                + "- reconnectionDelayGrowFactor >= 1.0\n"
                                + "- maxRetries and maxEnqueuedMessages are non-negative\n"
                                + "\n"
                                + "@return The validated ReconnectOptions instance\n"
                                + "@throws IllegalArgumentException if configuration is invalid\n")
                        .beginControlFlow("if (minReconnectionDelayMs <= 0)")
                        .addStatement(
                                "throw new $T($S)",
                                IllegalArgumentException.class,
                                "minReconnectionDelayMs must be positive")
                        .endControlFlow()
                        .beginControlFlow("if (maxReconnectionDelayMs <= 0)")
                        .addStatement(
                                "throw new $T($S)",
                                IllegalArgumentException.class,
                                "maxReconnectionDelayMs must be positive")
                        .endControlFlow()
                        .beginControlFlow("if (minReconnectionDelayMs > maxReconnectionDelayMs)")
                        .addStatement(
                                "throw new $T($S + minReconnectionDelayMs + $S + maxReconnectionDelayMs + $S)",
                                IllegalArgumentException.class,
                                "minReconnectionDelayMs (",
                                ") must not exceed maxReconnectionDelayMs (",
                                ")")
                        .endControlFlow()
                        .beginControlFlow("if (reconnectionDelayGrowFactor < 1.0)")
                        .addStatement(
                                "throw new $T($S)",
                                IllegalArgumentException.class,
                                "reconnectionDelayGrowFactor must be >= 1.0")
                        .endControlFlow()
                        .beginControlFlow("if (maxRetries < 0)")
                        .addStatement(
                                "throw new $T($S)", IllegalArgumentException.class, "maxRetries must be non-negative")
                        .endControlFlow()
                        .beginControlFlow("if (maxEnqueuedMessages < 0)")
                        .addStatement(
                                "throw new $T($S)",
                                IllegalArgumentException.class,
                                "maxEnqueuedMessages must be non-negative")
                        .endControlFlow()
                        .addStatement("return new ReconnectOptions(this)")
                        .build())
                .build();
    }

    private MethodSpec builderMethod(String fieldName, TypeName type, ClassName returnType) {
        return MethodSpec.methodBuilder(fieldName)
                .addModifiers(Modifier.PUBLIC)
                .addParameter(type, fieldName)
                .returns(returnType)
                .addStatement("this.$N = $N", fieldName, fieldName)
                .addStatement("return this")
                .build();
    }

    public ClassName getClassName() {
        return className;
    }
}
