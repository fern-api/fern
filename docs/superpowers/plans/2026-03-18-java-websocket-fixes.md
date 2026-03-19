# Java WebSocket & Binary Upload Fixes

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 6 critical/high-severity bugs in the Java SDK generator's WebSocket support and binary file upload handling.

**Architecture:** The Java SDK generator (v1, native Java) generates WebSocket clients from AsyncAPI specs via `SyncWebSocketChannelWriter` and `AsyncWebSocketChannelWriter`. Fixes target the code-generation layer (the generator itself), not the generated output. After each fix, regenerate the deepgram test fixture to verify.

**Tech Stack:** Java (generator code with JavaPoet/SquareUp), OkHttp (generated client runtime), Jackson (JSON serialization)

**Validation command:** After each task, rebuild and regenerate:
```bash
cd /Users/Patrick/fern/fern-java-2
cd generators/java && ./gradlew :sdk:distTar && cd ../..
pnpm turbo run compile --filter @fern-api/java-sdk && pnpm turbo run dist:cli --filter @fern-api/java-sdk
pnpm seed run --generator java-sdk --path /Users/Patrick/configs/deepgram-fern-config/fern --log-level debug --skipScripts --output-path /Users/Patrick/.seed/deepgram-java
```

---

## Chunk 1: WebSocket Protocol Fixes (Issues 2-5)

### Task 1: Fix wss:// URL handling (Issue 4 — NullPointerException)

**Problem:** `HttpUrl.parse("wss://...")` returns `null` because OkHttp's `HttpUrl` only supports `http://` and `https://` schemes. Calling `.newBuilder()` on `null` crashes with NPE.

**Fix:** Before calling `HttpUrl.parse()`, replace `wss://` → `https://` and `ws://` → `http://` in the base URL string. OkHttp's `WebSocket` implementation handles the actual protocol upgrade regardless of the scheme in the `HttpUrl`.

**Files:**
- Modify: `generators/java/sdk/src/main/java/com/fern/java/client/generators/websocket/AsyncWebSocketChannelWriter.java:197-198`
- Modify: `generators/java/sdk/src/main/java/com/fern/java/client/generators/websocket/SyncWebSocketChannelWriter.java:194-195`

- [ ] **Step 1: Edit AsyncWebSocketChannelWriter — add wss→https conversion before HttpUrl.parse**

In `AsyncWebSocketChannelWriter.java`, find the `generateConnectMethod()`. After the line:
```java
builder.addStatement("String fullPath = pathBuilder.toString()");
```
and after the `if/else if` block that normalizes slashes, but **before** the `HttpUrl.parse` line, add:

```java
// Convert WebSocket schemes to HTTP schemes for OkHttp's HttpUrl parser
builder.addComment("OkHttp's HttpUrl only supports http/https schemes; convert wss/ws for URL parsing");
builder.beginControlFlow("if (baseUrl.startsWith($S))", "wss://");
builder.addStatement("baseUrl = $S + baseUrl.substring(6)", "https://");
builder.endControlFlow();
builder.beginControlFlow("else if (baseUrl.startsWith($S))", "ws://");
builder.addStatement("baseUrl = $S + baseUrl.substring(5)", "http://");
builder.endControlFlow();
```

Replace line 197-198:
```java
builder.addStatement(
        "$T.Builder urlBuilder = $T.parse(baseUrl + fullPath).newBuilder()", HttpUrl.class, HttpUrl.class);
```

With a null-safe version:
```java
builder.addStatement("$T parsedUrl = $T.parse(baseUrl + fullPath)", HttpUrl.class, HttpUrl.class);
builder.beginControlFlow("if (parsedUrl == null)");
builder.addStatement("throw new $T($S + baseUrl + fullPath)", IllegalArgumentException.class, "Invalid WebSocket URL: ");
builder.endControlFlow();
builder.addStatement("$T.Builder urlBuilder = parsedUrl.newBuilder()", HttpUrl.class);
```

- [ ] **Step 2: Apply identical change to SyncWebSocketChannelWriter**

Same change in `SyncWebSocketChannelWriter.java` at lines 187-195 (after the slash normalization, before `HttpUrl.parse`).

- [ ] **Step 3: Verify — rebuild and regenerate deepgram, check that connect() converts wss to https**

Run validation command. Inspect generated `V2WebSocketClient.java` and confirm:
- `baseUrl` has wss→https conversion
- `HttpUrl.parse` is null-checked

---

### Task 2: Fix multi-URL environment resolution for WebSocket channels (Issue 4 related)

**Problem:** WebSocket channels call `clientOptions.environment().getUrl()` but in multi-URL environments (like Deepgram), there is no `getUrl()` method. The Environment class has `getBaseURL()`, `getAgentURL()`, `getProductionURL()` etc. The WebSocket channel IR has a `baseUrl` field (`Optional<EnvironmentBaseUrlId>`) that specifies which URL to use.

**Fix:** Mirror how `AbstractEndpointWriter.getEnvironmentToUrlMethod()` resolves the URL — check if the environment is single-URL or multi-URL, and use the appropriate getter.

**Files:**
- Modify: `generators/java/sdk/src/main/java/com/fern/java/client/generators/websocket/AbstractWebSocketChannelWriter.java`
- Modify: `generators/java/sdk/src/main/java/com/fern/java/client/generators/websocket/AsyncWebSocketChannelWriter.java:167`
- Modify: `generators/java/sdk/src/main/java/com/fern/java/client/generators/websocket/SyncWebSocketChannelWriter.java:164`

- [ ] **Step 1: Add a helper method to AbstractWebSocketChannelWriter to resolve the environment URL method**

Add this method to `AbstractWebSocketChannelWriter.java`:

```java
/**
 * Gets the method name for resolving the environment URL for this WebSocket channel.
 * For single-URL environments, uses getUrl(). For multi-URL environments, uses the
 * URL getter corresponding to the channel's baseUrl.
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
            MethodSpec urlMethod = multiUrl.urlGetterMethods().get(websocketChannel.getBaseUrl().get());
            if (urlMethod != null) {
                return urlMethod.name;
            }
        }
        // Fallback: use the first available URL method
        return multiUrl.urlGetterMethods().values().iterator().next().name;
    }
    throw new RuntimeException("Unknown environment class type: " + generatedEnvironmentsClass.info());
}
```

Add the required import at the top:
```java
import com.fern.ir.model.environment.EnvironmentBaseUrlId;
import com.squareup.javapoet.MethodSpec;
```
(MethodSpec is already imported)

- [ ] **Step 2: Update AsyncWebSocketChannelWriter to use the helper**

Replace line 167:
```java
builder.addStatement("String baseUrl = $N.environment().getUrl()", clientOptionsField);
```
With:
```java
builder.addStatement("String baseUrl = $N.environment().$L()", clientOptionsField, getEnvironmentUrlMethodName());
```

- [ ] **Step 3: Update SyncWebSocketChannelWriter to use the helper**

Replace line 164:
```java
builder.addStatement("String baseUrl = $N.environment().getUrl()", clientOptionsField);
```
With:
```java
builder.addStatement("String baseUrl = $N.environment().$L()", clientOptionsField, getEnvironmentUrlMethodName());
```

- [ ] **Step 4: Verify — rebuild and regenerate, confirm the correct URL getter is used**

Run validation command. Inspect generated agent `V1WebSocketClient.java` — it should call `clientOptions.environment().getAgentURL()`. The listen clients should call `clientOptions.environment().getProductionURL()`.

---

### Task 3: Fix authentication headers not sent (Issue 2)

**Problem:** The generated WebSocket client's `connect()` adds auth headers only when `websocketChannel.getAuth()` is true AND headers have environment variables. For Deepgram, the auth comes through the `headers` list with literal values (no env var), so the generator emits only a comment: `// Header Authorization requires literal value support`.

The real fix: auth headers should always come from `clientOptions.headers(null)` when `getAuth()` is true (which already works for the basic `websocket` seed fixture). For the Deepgram case, the issue is that `getAuth()` is false but there are `Authorization` headers in the `headers` list. The generator should handle headers that aren't env-var-based by pulling them from `clientOptions.headers()`.

**Fix:** Always call `clientOptions.headers(null).forEach(requestBuilder::addHeader)` regardless of `websocketChannel.getAuth()`. The `ClientOptions.headers()` method already includes all configured auth headers. The `websocketChannel.getHeaders()` loop for env-var/literal headers is supplementary.

**Files:**
- Modify: `generators/java/sdk/src/main/java/com/fern/java/client/generators/websocket/AsyncWebSocketChannelWriter.java:214-237`
- Modify: `generators/java/sdk/src/main/java/com/fern/java/client/generators/websocket/SyncWebSocketChannelWriter.java:211-234`

- [ ] **Step 1: Update AsyncWebSocketChannelWriter — always add clientOptions headers**

Replace the auth block (lines ~214-237):
```java
// Apply authentication if needed
if (websocketChannel.getAuth()) {
    builder.addStatement("$N.headers(null).forEach(requestBuilder::addHeader)", clientOptionsField);
}

// Add any additional headers
for (HttpHeader header : websocketChannel.getHeaders()) {
    ...
}
```

With:
```java
// Apply authentication and configured headers
builder.addStatement("$N.headers(null).forEach(requestBuilder::addHeader)", clientOptionsField);
```

This removes the conditional — `clientOptions.headers(null)` already returns the right set of headers including auth. The env-var header loop is unnecessary because auth headers are already managed by `ClientOptions`.

- [ ] **Step 2: Apply identical change to SyncWebSocketChannelWriter**

Same replacement in `SyncWebSocketChannelWriter.java` (lines ~211-234).

- [ ] **Step 3: Verify — rebuild and regenerate, confirm auth headers are always added**

Run validation command. Inspect generated `V1WebSocketClient.java` (agent) — should now have:
```java
clientOptions.headers(null).forEach(requestBuilder::addHeader);
```
instead of just a comment.

---

### Task 4: Fix envelope protocol — use flat JSON (Issue 3)

**Problem:** Generated `sendMessage()` wraps outgoing messages in `{"type": "TypeName", "body": {...}}`. Generated `handleIncomingMessage()` expects the same envelope. Real WebSocket APIs (Deepgram, most AsyncAPI specs) use flat JSON where the `type` discriminator is part of the message payload itself, e.g., `{"type": "Results", "channel": {...}}`.

**Fix:** Change send to serialize the message object directly (it already contains the `type` field). Change receive to deserialize the full JSON node (not extract from `body`).

**Files:**
- Modify: `generators/java/sdk/src/main/java/com/fern/java/client/generators/websocket/AsyncWebSocketChannelWriter.java` (`generateSendMessageHelper`)
- Modify: `generators/java/sdk/src/main/java/com/fern/java/client/generators/websocket/SyncWebSocketChannelWriter.java` (`generateSendMessageHelper`)
- Modify: `generators/java/sdk/src/main/java/com/fern/java/client/generators/websocket/AbstractWebSocketChannelWriter.java` (`generateHandleIncomingMessageHelper`)

- [ ] **Step 1: Update AsyncWebSocketChannelWriter.generateSendMessageHelper — serialize body directly**

Replace the entire `generateSendMessageHelper()` method. The new version should serialize just `body` (not an envelope):

```java
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
            .addStatement("String json = $N.writeValueAsString(body)", objectMapperField)
            .addComment("Use reconnecting listener's send method which handles queuing")
            .addStatement("boolean sent = $N.send(json)", reconnectingListenerField)
            .beginControlFlow("if (sent)")
            .addStatement("future.complete(null)")
            .endControlFlow()
            .beginControlFlow("else")
            .addComment("Message was queued for later delivery when reconnected")
            .addStatement("future.complete(null)")
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
```

- [ ] **Step 2: Update SyncWebSocketChannelWriter.generateSendMessageHelper — same change**

Replace the entire method. New version:

```java
@Override
protected MethodSpec generateSendMessageHelper() {
    return MethodSpec.methodBuilder("sendMessage")
            .addModifiers(Modifier.PRIVATE)
            .addParameter(String.class, "type")
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
```

- [ ] **Step 3: Update AbstractWebSocketChannelWriter.generateHandleIncomingMessageHelper — use flat JSON**

Replace the entire `generateHandleIncomingMessageHelper()` method. The new version reads the `type` field from the root JSON and deserializes the entire JSON node (not a `body` sub-node):

```java
protected MethodSpec generateHandleIncomingMessageHelper() {
    MethodSpec.Builder builder = MethodSpec.methodBuilder("handleIncomingMessage")
            .addModifiers(Modifier.PRIVATE)
            .addParameter(String.class, "json")
            .beginControlFlow("try")
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
            .addStatement(
                    "throw new $T($S)", IllegalArgumentException.class, "Message missing 'type' field")
            .endControlFlow()
            .addStatement("String type = typeNode.asText()")
            .beginControlFlow("switch (type)");

    // Add cases for each server message
    for (WebSocketMessage message : websocketChannel.getMessages()) {
        if (message.getOrigin() == WebSocketMessageOrigin.SERVER) {
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
            .addStatement("// Unknown message type - ignore")
            .addStatement("break");

    builder.endControlFlow() // end switch
            .endControlFlow() // end try
            .beginControlFlow("catch ($T e)", IllegalArgumentException.class)
            .beginControlFlow("if ($N != null)", onErrorHandlerField)
            .addStatement("$N.accept(e)", onErrorHandlerField)
            .endControlFlow()
            .endControlFlow()
            .beginControlFlow("catch ($T e)", Exception.class)
            .beginControlFlow("if ($N != null)", onErrorHandlerField)
            .addStatement("$N.accept(e)", onErrorHandlerField)
            .endControlFlow()
            .endControlFlow();

    return builder.build();
}
```

Key changes:
- Renamed `envelope` → `node` (it's flat JSON now)
- Removed the `body` field extraction
- Changed `objectMapper.treeToValue(body, ...)` → `objectMapper.treeToValue(node, ...)` to deserialize from the full message
- Updated error messages

- [ ] **Step 4: Verify — rebuild and regenerate, confirm flat JSON in/out**

Run validation command. Inspect generated `V2WebSocketClient.java`:
- `sendMessage()` should serialize `body` directly (no envelope wrapping)
- `handleIncomingMessage()` should read `type` from root and deserialize the full node

---

## Chunk 2: Binary Support Fixes (Issues 6-7)

### Task 5: Add binary WebSocket frame support (Issue 6)

**Problem:** `ReconnectingWebSocketListener` only overrides `onMessage(WebSocket, String)` — binary frames via `onMessage(WebSocket, ByteString)` are silently dropped. There's also no `sendBinary()` method.

**Fix:** Add binary message handling to the `ReconnectingWebSocketListener` and the WebSocket channel writers.

**Files:**
- Modify: `generators/java/sdk/src/main/java/com/fern/java/client/generators/websocket/ReconnectingWebSocketListenerGenerator.java`
- Modify: `generators/java/sdk/src/main/java/com/fern/java/client/generators/websocket/AsyncWebSocketChannelWriter.java`
- Modify: `generators/java/sdk/src/main/java/com/fern/java/client/generators/websocket/SyncWebSocketChannelWriter.java`
- Modify: `generators/java/sdk/src/main/java/com/fern/java/client/generators/websocket/AbstractWebSocketChannelWriter.java`

- [ ] **Step 1: Add binary onMessage override and abstract method to ReconnectingWebSocketListenerGenerator**

In `ReconnectingWebSocketListenerGenerator.java`:

1. Add import for `okio.ByteString`:
```java
// At top — ByteString is already available via OkHttp dependency
```

2. In `generateMethods()`, add after `generateOnMessage()`:
```java
methods.add(generateOnBinaryMessage());
```

3. Add the `generateOnBinaryMessage()` method:
```java
private MethodSpec generateOnBinaryMessage() {
    return MethodSpec.methodBuilder("onMessage")
            .addAnnotation(Override.class)
            .addModifiers(Modifier.PUBLIC)
            .returns(TypeName.VOID)
            .addParameter(ClassName.get("okhttp3", "WebSocket"), "webSocket")
            .addParameter(ClassName.get("okio", "ByteString"), "bytes")
            .addStatement("onWebSocketBinaryMessage(webSocket, bytes)")
            .build();
}
```

4. In `generateAbstractMethods()`, add a new abstract method:
```java
MethodSpec.methodBuilder("onWebSocketBinaryMessage")
        .addModifiers(Modifier.PROTECTED, Modifier.ABSTRACT)
        .returns(TypeName.VOID)
        .addParameter(ClassName.get("okhttp3", "WebSocket"), "webSocket")
        .addParameter(ClassName.get("okio", "ByteString"), "bytes")
        .build()
```

5. Add a `sendBinary` method alongside `generateSend()`. In `generateMethods()`, add after `generateSend()`:
```java
methods.add(generateSendBinary());
```

Add the method:
```java
private MethodSpec generateSendBinary() {
    return MethodSpec.methodBuilder("sendBinary")
            .addModifiers(Modifier.PUBLIC, Modifier.SYNCHRONIZED)
            .returns(TypeName.BOOLEAN)
            .addParameter(ClassName.get("okio", "ByteString"), "data")
            .addJavadoc("Sends binary data or queues it if not connected.\n"
                    + "\n"
                    + "@param data The binary data to send\n"
                    + "@return true if sent immediately, false otherwise\n")
            .addStatement("$T ws = webSocket", ClassName.get("okhttp3", "WebSocket"))
            .beginControlFlow("if (ws != null)")
            .addStatement("return ws.send(data)")
            .endControlFlow()
            .addStatement("return false")
            .build();
}
```

- [ ] **Step 2: Add binary handler and sendBinary to AbstractWebSocketChannelWriter**

Add a field for the binary message handler:
```java
protected final FieldSpec onBinaryMessageHandlerField;
```

Initialize it in the constructor:
```java
this.onBinaryMessageHandlerField = FieldSpec.builder(
                ParameterizedTypeName.get(
                        ClassName.get(Consumer.class),
                        ClassName.get("okio", "ByteString")),
                "onBinaryMessageHandler",
                Modifier.PRIVATE)
        .build();
```

In `addFields()`, add:
```java
classBuilder.addField(onBinaryMessageHandlerField);
```

In `generateFile()`, add methods:
```java
classBuilder.addMethod(generateOnBinaryMessageMethod());
classBuilder.addMethod(generateSendBinaryMethod());
```

Add the registration method:
```java
protected MethodSpec generateOnBinaryMessageMethod() {
    return MethodSpec.methodBuilder("onBinaryMessage")
            .addModifiers(Modifier.PUBLIC)
            .addParameter(ParameterSpec.builder(
                            ParameterizedTypeName.get(
                                    ClassName.get(Consumer.class),
                                    ClassName.get("okio", "ByteString")),
                            "handler")
                    .build())
            .addJavadoc("Registers a handler for binary messages from the server.\n")
            .addJavadoc("@param handler the handler to invoke when binary data is received\n")
            .addStatement("this.$N = handler", onBinaryMessageHandlerField)
            .build();
}
```

Add abstract method for `generateSendBinaryMethod()`:
```java
protected abstract MethodSpec generateSendBinaryMethod();
```

- [ ] **Step 3: Implement binary support in AsyncWebSocketChannelWriter**

In the `generateConnectMethod()`, after the `onWebSocketMessage` override, add:
```java
builder.addCode("    @Override\n");
builder.addCode(
        "    protected void onWebSocketBinaryMessage($T webSocket, $T bytes) {\n",
        ClassName.get("okhttp3", "WebSocket"),
        ClassName.get("okio", "ByteString"));
builder.beginControlFlow("        if ($N != null)", onBinaryMessageHandlerField);
builder.addStatement("            $N.accept(bytes)", onBinaryMessageHandlerField);
builder.endControlFlow();
builder.addCode("    }\n\n");
```

Add `generateSendBinaryMethod()`:
```java
@Override
protected MethodSpec generateSendBinaryMethod() {
    return MethodSpec.methodBuilder("sendBinary")
            .addModifiers(Modifier.PUBLIC)
            .returns(ParameterizedTypeName.get(ClassName.get(CompletableFuture.class), TypeName.VOID.box()))
            .addParameter(ClassName.get("okio", "ByteString"), "data")
            .addJavadoc("Sends binary data to the server asynchronously.\n")
            .addJavadoc("@param data the binary data to send\n")
            .addJavadoc("@return a CompletableFuture that completes when the data is sent\n")
            .addStatement(
                    "$T<$T> future = new $T<>()",
                    CompletableFuture.class,
                    TypeName.VOID.box(),
                    CompletableFuture.class)
            .beginControlFlow("try")
            .addStatement("assertSocketIsOpen()")
            .addStatement("boolean sent = $N.sendBinary(data)", reconnectingListenerField)
            .beginControlFlow("if (sent)")
            .addStatement("future.complete(null)")
            .endControlFlow()
            .beginControlFlow("else")
            .addStatement("future.completeExceptionally(new $T($S))", RuntimeException.class, "Failed to send binary data")
            .endControlFlow()
            .endControlFlow()
            .beginControlFlow("catch ($T e)", Exception.class)
            .addStatement("future.completeExceptionally(new $T($S, e))", RuntimeException.class, "Failed to send binary data")
            .endControlFlow()
            .addStatement("return future")
            .build();
}
```

- [ ] **Step 4: Implement binary support in SyncWebSocketChannelWriter**

Same `onWebSocketBinaryMessage` override in `generateConnectMethod()` (after the text message handler).

Add `generateSendBinaryMethod()`:
```java
@Override
protected MethodSpec generateSendBinaryMethod() {
    return MethodSpec.methodBuilder("sendBinary")
            .addModifiers(Modifier.PUBLIC)
            .addParameter(ClassName.get("okio", "ByteString"), "data")
            .addJavadoc("Sends binary data to the server.\n")
            .addJavadoc("@param data the binary data to send\n")
            .addJavadoc("@throws RuntimeException if send fails\n")
            .addStatement("assertSocketIsOpen()")
            .beginControlFlow("if (!$N.sendBinary(data))", reconnectingListenerField)
            .addStatement("throw new $T($S)", RuntimeException.class, "Failed to send binary data")
            .endControlFlow()
            .build();
}
```

- [ ] **Step 5: Verify — rebuild and regenerate, confirm binary support in generated clients**

Run validation command. Inspect generated `V1WebSocketClient.java`:
- Should have `sendBinary(ByteString data)` method
- Should have `onBinaryMessage(Consumer<ByteString> handler)` method
- The inner `ReconnectingWebSocketListener` override should include `onWebSocketBinaryMessage`

---

### Task 6: Fix binary file upload JSON serialization (Issue 7)

**Problem:** For REST endpoints with `application/octet-stream` content type, when the request is a wrapped type (has query params + body), the body is serialized via `ObjectMappers.JSON_MAPPER.writeValueAsBytes(request.getBody())`. This JSON-encodes the binary data (wrapping strings in quotes, escaping characters).

**Root cause:** In `OnlyRequestEndpointWriter.java`, the `GeneratedRequestBodyOctetStream` visitor (the inner class that creates the `RequestBody` for wrapped requests) uses `RequestBody.create(ObjectMappers.JSON_MAPPER.writeValueAsBytes(body), ...)` instead of using `InputStreamRequestBody` or sending raw bytes.

**Fix:** When the request body has `application/octet-stream` content type and the body is a `String` type (bytes), use `RequestBody.create(body.getBytes(StandardCharsets.UTF_8), mediaType)` instead of JSON serialization. For `InputStream` types, use `InputStreamRequestBody`.

**Files:**
- Modify: `generators/java/sdk/src/main/java/com/fern/java/client/generators/endpoint/OnlyRequestEndpointWriter.java:~180-195` (the visitBytes in GeneratedOkHttpRequestBodyForWrappedRequest)

- [ ] **Step 1: Identify the exact code path**

Read `OnlyRequestEndpointWriter.java` around lines 175-200 to find the `visitBytes` method inside the `GeneratedOkHttpRequestBodyForWrappedRequest` inner class. This is the visitor that handles the case where a bytes body is wrapped in a request object with query parameters.

The current code at line ~184:
```java
public Void visitBytes(BytesRequest bytes) {
    // Currently generates:
    // RequestBody body = RequestBody.create(
    //     ObjectMappers.JSON_MAPPER.writeValueAsBytes(request.getBody()),
    //     MediaType.parse("application/octet-stream"));
```

- [ ] **Step 2: Fix the visitBytes method for wrapped requests**

Replace the `visitBytes` implementation in the `GeneratedOkHttpRequestBodyForWrappedRequest` inner class. The new code should generate:

```java
RequestBody body = new InputStreamRequestBody(
    MediaType.parse("application/octet-stream"),
    new ByteArrayInputStream(request.getBody().getBytes(StandardCharsets.UTF_8)));
```

The generator code change:
```java
@Override
public Void visitBytes(BytesRequest bytes) {
    String contentType = bytes.getContentType().orElse(APPLICATION_OCTET_STREAM);
    codeBlock.addStatement(
            "$T $L = new $T($T.parse($S), new $T($L.$L().getBytes($T.UTF_8)))",
            RequestBody.class,
            variables.getOkhttpRequestBodyName(),
            clientGeneratorContext.getPoetClassNameFactory().getInputStreamRequestBodyClassName(),
            MediaType.class,
            contentType,
            ClassName.get("java.io", "ByteArrayInputStream"),
            sdkRequest.getRequestParameterName().getCamelCase().getSafeName(),
            "getBody",
            ClassName.get("java.nio.charset", "StandardCharsets"));
    return null;
}
```

**Note:** This needs careful verification. The exact field accessor (`getBody()`) depends on how the wrapped request exposes the bytes body. Check the generated `MediaTranscribeRequestOctetStream.java` to confirm the getter name.

- [ ] **Step 3: Verify — rebuild and regenerate, confirm raw bytes are sent**

Run validation command. Inspect generated `RawMediaClient.java` for the transcribe-from-file endpoint:
- Should use `InputStreamRequestBody` or raw bytes, NOT `ObjectMappers.JSON_MAPPER.writeValueAsBytes()`

---

## Chunk 3: Seed Fixture Updates & Final Validation

### Task 7: Update existing seed test fixtures

- [ ] **Step 1: Rebuild and run seed tests for all websocket fixtures**

```bash
cd /Users/Patrick/fern/fern-java-2
cd generators/java && ./gradlew :sdk:distTar && cd ../..
pnpm turbo run compile --filter @fern-api/java-sdk && pnpm turbo run dist:cli --filter @fern-api/java-sdk

pnpm seed test --generator java-sdk --fixture websocket --skip-scripts
pnpm seed test --generator java-sdk --fixture websocket-bearer-auth --skip-scripts
pnpm seed test --generator java-sdk --fixture websocket-inferred-auth --skip-scripts
```

- [ ] **Step 2: Update seed fixture snapshots**

The generated output will have changed (flat JSON instead of envelope, binary methods, etc.). Review the diffs carefully with `git diff seed/java-sdk/websocket/` and update:

```bash
# Review changes
git diff seed/java-sdk/websocket/
git diff seed/java-sdk/websocket-bearer-auth/
git diff seed/java-sdk/websocket-inferred-auth/

# Stage the updated fixtures
git add seed/java-sdk/websocket/ seed/java-sdk/websocket-bearer-auth/ seed/java-sdk/websocket-inferred-auth/
```

- [ ] **Step 3: Run deepgram end-to-end validation**

```bash
pnpm seed run --generator java-sdk --path /Users/Patrick/configs/deepgram-fern-config/fern --log-level debug --skipScripts --output-path /Users/Patrick/.seed/deepgram-java
```

Verify all 6 issues are resolved by inspecting:
1. **Issue 2 (Auth):** `V2WebSocketClient.connect()` has `clientOptions.headers(null).forEach(requestBuilder::addHeader)`
2. **Issue 3 (Flat JSON):** `sendMessage()` serializes body directly; `handleIncomingMessage()` reads type from root
3. **Issue 4 (wss):** `connect()` converts `wss://` to `https://` before `HttpUrl.parse()`
4. **Issue 5 (Query params):** Already working — verify still works
5. **Issue 6 (Binary):** `sendBinary()` and `onBinaryMessage()` methods exist
6. **Issue 7 (Bytes upload):** `RawMediaClient` uses `InputStreamRequestBody` not `JSON_MAPPER.writeValueAsBytes`

- [ ] **Step 4: Compile the deepgram generated output**

```bash
cd /Users/Patrick/.seed/deepgram-java
./gradlew compileJava
```

All generated code should compile without errors.

- [ ] **Step 5: Commit all changes**

```bash
git add generators/java/sdk/src/main/java/com/fern/java/client/generators/websocket/
git add generators/java/sdk/src/main/java/com/fern/java/client/generators/endpoint/OnlyRequestEndpointWriter.java
git add seed/java-sdk/websocket/ seed/java-sdk/websocket-bearer-auth/ seed/java-sdk/websocket-inferred-auth/
git commit -m "fix(java): resolve WebSocket auth, flat JSON, wss:// URL, binary frame, and octet-stream issues"
```
