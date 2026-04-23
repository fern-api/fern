import { getWireValue, GeneratorError } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { convertToSnakeCase, RustFile } from "@fern-api/rust-base";
import { rust, UseStatement } from "@fern-api/rust-codegen";
import { isOptionalType, getInnerTypeFromOptional } from "@fern-api/rust-model";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { EnvironmentGenerator } from "../environment/EnvironmentGenerator.js";

const AUTH_PARAM_NAME = "authorization";

export class WebSocketChannelGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly environmentGenerator: EnvironmentGenerator;
    private channelNameMap: Map<string, { moduleName: string; clientName: string; enumPrefix: string }> =
        new Map();

    constructor(context: SdkGeneratorContext) {
        this.context = context;
        this.environmentGenerator = new EnvironmentGenerator({ context });
    }

    /**
     * Returns the connector info for each WebSocket channel so the root client
     * can include connector fields. Each entry maps a channel to its connector
     * struct name, field name, and the underlying client connect() parameters.
     */
    public getConnectorInfo(): Array<{
        connectorName: string;
        fieldName: string;
        clientName: string;
        moduleName: string;
        channel: FernIr.WebSocketChannel;
        urlMethodName: string;
    }> {
        if (!this.context.hasWebSocketChannels()) {
            return [];
        }
        const websocketChannels = this.context.ir.websocketChannels!;

        this.buildChannelNameMap(websocketChannels);

        const result: Array<{
            connectorName: string;
            fieldName: string;
            clientName: string;
            moduleName: string;
            channel: FernIr.WebSocketChannel;
            urlMethodName: string;
        }> = [];

        for (const [channelId, channel] of Object.entries(websocketChannels)) {
            const names = this.channelNameMap.get(channelId);
            if (names == null) {
                continue;
            }
            result.push({
                connectorName: this.getConnectorName(names.clientName),
                fieldName: names.moduleName,
                clientName: names.clientName,
                moduleName: names.moduleName,
                channel,
                urlMethodName: this.environmentGenerator.getUrlMethodNameForBaseUrlId(channel.baseUrl)
            });
        }

        return result;
    }

    public generateAll(): RustFile[] {
        const files: RustFile[] = [];
        const websocketChannels = this.context.ir.websocketChannels;
        if (!websocketChannels) {
            return files;
        }

        this.buildChannelNameMap(websocketChannels);

        for (const [channelId, channel] of Object.entries(websocketChannels)) {
            files.push(this.generateChannelFile(channelId, channel));
        }

        if (files.length > 0) {
            files.push(this.generateWebSocketModFile(websocketChannels));
        }

        return files;
    }

    /**
     * Pre-computes unique module/client/enum names for all channels.
     * When multiple channels share the same `channel.name`, we derive
     * unique names from the channel ID (e.g. "channel_speak/v1" → "speak_v1").
     */
    private buildChannelNameMap(
        websocketChannels: Record<FernIr.WebSocketChannelId, FernIr.WebSocketChannel>
    ): void {
        if (this.channelNameMap.size > 0) {
            return;
        }

        // Detect name collisions
        const nameCount = new Map<string, number>();
        for (const channel of Object.values(websocketChannels)) {
            const baseName = this.context.case.snakeSafe(channel.name);
            nameCount.set(baseName, (nameCount.get(baseName) ?? 0) + 1);
        }

        for (const [channelId, channel] of Object.entries(websocketChannels)) {
            const baseName = this.context.case.snakeSafe(channel.name);

            if ((nameCount.get(baseName) ?? 0) > 1) {
                // Derive unique name from the channel path (e.g., "/v2/listen" → "listen_v2").
                // The path always contains the meaningful context that the channel name may lack.
                const uniqueName = this.deriveNameFromPath(channel);
                this.channelNameMap.set(channelId, {
                    moduleName: uniqueName.snakeCase,
                    clientName: `${uniqueName.pascalCase}Client`,
                    enumPrefix: uniqueName.pascalCase
                });
            } else {
                this.channelNameMap.set(channelId, {
                    moduleName: this.context.case.snakeSafe(channel.name),
                    clientName: `${this.context.case.pascalSafe(channel.name)}Client`,
                    enumPrefix: this.context.case.pascalSafe(channel.name)
                });
            }
        }
    }

    /**
     * Derives a unique name from a channel's path when the channel name collides.
     * For example, "/v1/listen" → "listen_v1", "/v2/listen" → "listen_v2",
     * "/v1/agent/converse" → "agent_converse_v1".
     *
     * Strategy: extract path segments, move version-like segments (v1, v2) to
     * the end as a suffix, and join the rest as the base name. This produces
     * names like "listen_v1" rather than "v1_listen".
     */
    private deriveNameFromPath(channel: FernIr.WebSocketChannel): { snakeCase: string; pascalCase: string } {
        const pathStr = this.buildPathExpression(channel);
        // Split path into segments, filtering out empty strings and path params
        const segments = pathStr
            .split("/")
            .filter((s) => s.length > 0 && !s.startsWith("{"));

        // Separate version segments (v1, v2, etc.) from name segments
        const versionPattern = /^v\d+$/;
        const nameSegments: string[] = [];
        const versionSegments: string[] = [];
        for (const seg of segments) {
            if (versionPattern.test(seg)) {
                versionSegments.push(seg);
            } else {
                nameSegments.push(seg);
            }
        }

        // Combine: name segments first, then version suffix
        const allParts = [...nameSegments, ...versionSegments];
        const snakeCase = allParts.join("_").toLowerCase();
        const pascalCase = allParts
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join("");
        return { snakeCase, pascalCase };
    }

    private generateWebSocketModFile(
        websocketChannels: Record<FernIr.WebSocketChannelId, FernIr.WebSocketChannel>
    ): RustFile {
        const moduleDeclarations: string[] = [];
        const reExports: string[] = [];

        for (const [channelId, channel] of Object.entries(websocketChannels)) {
            const names = this.channelNameMap.get(channelId);
            if (names == null) {
                continue;
            }
            moduleDeclarations.push(`pub mod ${names.moduleName};`);
            reExports.push(`pub use ${names.moduleName}::${names.clientName};`);
            reExports.push(`pub use ${names.moduleName}::${this.getConnectorName(names.clientName)};`);

            // Re-export connect options struct if channel has query parameters
            if (channel.queryParameters.length > 0) {
                reExports.push(`pub use ${names.moduleName}::${this.getConnectOptionsName(names.enumPrefix)};`);
            }

            const { jsonServerMessages, hasBinaryServerMessages } = this.getServerMessageInfo(channel);

            // Export ServerMessage enum if channel has JSON server messages
            if (jsonServerMessages.length > 0) {
                reExports.push(`pub use ${names.moduleName}::${names.enumPrefix}ServerMessage;`);
            }

            // Export Event enum if channel has binary server messages
            if (hasBinaryServerMessages) {
                reExports.push(`pub use ${names.moduleName}::${names.enumPrefix}Event;`);
            }
        }

        const module = rust.module({
            moduleDoc: ["WebSocket channel clients"],
            useStatements: [],
            rawDeclarations: [...moduleDeclarations, ...reExports]
        });

        return new RustFile({
            filename: "mod.rs",
            directory: RelativeFilePath.of("src/api/websocket"),
            fileContents: module.toString()
        });
    }

    private generateChannelFile(channelId: string, channel: FernIr.WebSocketChannel): RustFile {
        const names = this.channelNameMap.get(channelId);
        if (names == null) {
            throw GeneratorError.internalError(`No name mapping found for channel ${channelId}`);
        }
        const { clientName, moduleName, enumPrefix } = names;

        const clientMessages = channel.messages.filter((m) => m.origin === "client");
        const { jsonServerMessages, hasBinaryServerMessages } = this.getServerMessageInfo(channel);
        const hasQueryParams = channel.queryParameters.length > 0;

        const rawDeclarations: string[] = [];

        // Generate connect options struct for channels with query parameters
        if (hasQueryParams) {
            rawDeclarations.push(this.generateConnectOptionsStruct(enumPrefix, channel));
        }

        const serverEnum = this.generateServerMessageEnum(enumPrefix, jsonServerMessages);
        if (serverEnum) {
            rawDeclarations.push(serverEnum);
        }

        if (hasBinaryServerMessages && jsonServerMessages.length > 0) {
            rawDeclarations.push(this.generateEventEnum(enumPrefix));
        }

        rawDeclarations.push(this.generateClientStruct(clientName));
        rawDeclarations.push(
            this.generateImplBlock(clientName, enumPrefix, channel, clientMessages, jsonServerMessages, hasBinaryServerMessages)
        );

        // Generate connector struct that wraps base_url and delegates to the client's connect()
        rawDeclarations.push(this.generateConnectorStruct(clientName, enumPrefix, channel, this.getConnectMethodName(channel)));

        const hasJsonServerMessages = jsonServerMessages.length > 0;
        const useStatements = this.generateImports(hasJsonServerMessages, hasQueryParams);

        const module = rust.module({
            useStatements,
            rawDeclarations
        });

        return new RustFile({
            filename: `${moduleName}.rs`,
            directory: RelativeFilePath.of("src/api/websocket"),
            fileContents: module.toString()
        });
    }

    private generateImports(hasJsonServerMessages: boolean, hasQueryParams: boolean): UseStatement[] {
        const crateItems = ["ApiError", "WebSocketClient", "WebSocketMessage", "WebSocketOptions"];
        if (hasQueryParams) {
            crateItems.push("QueryBuilder");
        }
        const imports: UseStatement[] = [
            new UseStatement({
                path: "crate",
                items: crateItems
            }),
            new UseStatement({
                path: "tokio::sync",
                items: ["mpsc"]
            })
        ];
        if (hasJsonServerMessages || hasQueryParams) {
            imports.push(
                new UseStatement({
                    path: "crate::prelude",
                    items: ["*"]
                }),
                new UseStatement({
                    path: "serde",
                    items: ["Deserialize", "Serialize"]
                })
            );
        }
        return imports;
    }

    /**
     * Generates the server message enum with a custom Deserialize impl that uses
     * round-trip scoring to pick the best-matching variant. This avoids the
     * `#[serde(untagged)]` pitfall where `#[serde(default)]` on struct fields
     * causes every variant to match, silently returning the first one.
     */
    private generateServerMessageEnum(
        enumPrefix: string,
        jsonServerMessages: FernIr.WebSocketMessage[]
    ): string | undefined {
        if (jsonServerMessages.length === 0) {
            return undefined;
        }

        const enumName = `${enumPrefix}ServerMessage`;

        const variants = jsonServerMessages
            .map((msg) => {
                const variantName = this.getMessageVariantName(msg);
                const bodyType = this.getMessageBodyType(msg);
                if (bodyType) {
                    return `    ${variantName}(${bodyType}),`;
                }
                return `    ${variantName},`;
            })
            .join("\n");

        // Generate try blocks for the custom Deserialize impl.
        // Each block tries to deserialize as a variant type, then scores it by
        // counting how many of the variant's serialized keys appear in the original JSON.
        const tryBlocks = jsonServerMessages
            .map((msg) => {
                const variantName = this.getMessageVariantName(msg);
                const bodyType = this.getMessageBodyType(msg);
                if (!bodyType) {
                    return "";
                }
                return `        if let Ok(v) = serde_json::from_value::<${bodyType}>(value.clone()) {
            if let Ok(re) = serde_json::to_value(&v) {
                let score = re.as_object()
                    .map(|o| o.keys().filter(|k| original_keys.contains(k.as_str())).count())
                    .unwrap_or(0);
                if score > best_score {
                    best_score = score;
                    best_variant = Some(Self::${variantName}(v));
                }
            }
        }`;
            })
            .filter(Boolean)
            .join("\n\n");

        return `#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(untagged)]
pub enum ${enumName} {
${variants}
    /// Unknown or new server message type not yet supported by this SDK version.
    Unknown(serde_json::Value),
}

impl<'de> Deserialize<'de> for ${enumName} {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let value = serde_json::Value::deserialize(deserializer)?;

        let original_keys: std::collections::BTreeSet<String> = value
            .as_object()
            .map(|o| o.keys().cloned().collect())
            .unwrap_or_default();

        if original_keys.is_empty() {
            return Ok(Self::Unknown(value));
        }

        let mut best_variant: Option<Self> = None;
        let mut best_score: usize = 0;

${tryBlocks}

        let _ = best_score;
        Ok(best_variant.unwrap_or(Self::Unknown(value)))
    }
}`;
    }

    /**
     * Generates the Event enum for channels with both JSON and binary server messages.
     * Wraps the ServerMessage enum for JSON frames and Vec<u8> for binary frames.
     */
    private generateEventEnum(enumPrefix: string): string {
        const enumName = `${enumPrefix}Event`;
        const serverMessageName = `${enumPrefix}ServerMessage`;
        return `#[derive(Debug, Clone, PartialEq)]
pub enum ${enumName} {
    Message(${serverMessageName}),
    Audio(Vec<u8>),
}`;
    }

    private generateClientStruct(clientName: string): string {
        return `pub struct ${clientName} {
    ws: WebSocketClient,
    incoming_rx: mpsc::UnboundedReceiver<Result<WebSocketMessage, ApiError>>,
}`;
    }

    private generateImplBlock(
        clientName: string,
        enumPrefix: string,
        channel: FernIr.WebSocketChannel,
        clientMessages: FernIr.WebSocketMessage[],
        jsonServerMessages: FernIr.WebSocketMessage[],
        hasBinaryServerMessages: boolean
    ): string {
        const pathExpression = this.buildPathExpression(channel);

        const connectMethod = this.generateConnectMethod(clientName, enumPrefix, channel, pathExpression, this.getConnectMethodName(channel));
        const sendMethods = clientMessages.map((msg) => this.generateSendMethod(msg)).join("\n\n");
        const receiveMethod = this.generateReceiveMethod(enumPrefix, jsonServerMessages, hasBinaryServerMessages);
        const closeMethod = this.generateCloseMethod();

        const methods = [connectMethod];
        if (sendMethods) {
            methods.push(sendMethods);
        }
        methods.push(receiveMethod);
        methods.push(closeMethod);

        return `impl ${clientName} {
${methods.join("\n\n")}
}`;
    }

    /**
     * Returns true if the channel does not already have an explicit Authorization
     * header in its IR definition.  When true, the connector will automatically
     * inject a Bearer token from the stored ClientConfig token.
     */
    private isAuthorizationHeader(header: FernIr.HttpHeader): boolean {
        return getWireValue(header.name).toLowerCase() === AUTH_PARAM_NAME;
    }

    private needsImplicitAuth(channel: FernIr.WebSocketChannel): boolean {
        return !channel.headers.some((h) => this.isAuthorizationHeader(h));
    }

    /**
     * Returns true if the header is `Sec-WebSocket-Protocol` (case-insensitive).
     * This header is handled specially by tungstenite for RFC 6455 subprotocol
     * negotiation and must NOT be inserted as a regular HTTP header, because
     * tungstenite will fail the handshake if the server does not echo it back.
     */
    private isWebSocketProtocolHeader(header: FernIr.HttpHeader): boolean {
        return getWireValue(header.name).toLowerCase() === "sec-websocket-protocol";
    }

    /**
     * Builds the non-query connect parameters: path params, auth, and headers.
     * Query parameters are handled via the typed ConnectOptions struct.
     */
    private buildConnectParams(channel: FernIr.WebSocketChannel): Array<{ name: string; type: string }> {
        const params: Array<{ name: string; type: string }> = [];

        for (const pathParam of channel.pathParameters) {
            params.push({ name: this.context.case.snakeSafe(pathParam.name), type: "&str" });
        }

        // If auth is required but no explicit Authorization header, add it as optional
        // so the header is only inserted when a token is actually provided.
        if (this.needsImplicitAuth(channel)) {
            params.push({ name: AUTH_PARAM_NAME, type: "Option<&str>" });
        }

        for (const header of channel.headers) {
            // Skip Sec-WebSocket-Protocol — tungstenite handles subprotocol
            // negotiation internally and fails if the server doesn't echo it.
            if (this.isWebSocketProtocolHeader(header)) {
                continue;
            }
            // Authorization headers use Option<&str> so that connectors can
            // skip the header entirely when no token is configured, rather
            // than sending an empty `Authorization: ""` header.
            params.push({
                name: this.context.case.snakeSafe(header.name),
                type: this.isAuthorizationHeader(header) ? "Option<&str>" : "&str"
            });
        }

        return params;
    }

    /**
     * Derives the connector struct name from a client name.
     * Single source of truth used by getConnectorInfo(), generateWebSocketModFile(),
     * and generateConnectorStruct().
     */
    private getConnectorName(clientName: string): string {
        return `${clientName.replace(/Client$/, "")}Connector`;
    }

    private generateConnectMethod(
        clientName: string,
        enumPrefix: string,
        channel: FernIr.WebSocketChannel,
        pathExpression: string,
        connectMethodName: string
    ): string {
        const connectParams = this.buildConnectParams(channel);
        const params: string[] = ["url: &str", ...connectParams.map((p) => `${p.name}: ${p.type}`)];
        const hasQueryParams = channel.queryParameters.length > 0;

        // Add typed options struct parameter if there are query parameters
        if (hasQueryParams) {
            const optionsStructName = this.getConnectOptionsName(enumPrefix);
            params.push(`options: &${optionsStructName}`);
        }

        const headerLines: string[] = [];

        // If auth is required but no explicit Authorization header, conditionally inject it
        if (this.needsImplicitAuth(channel)) {
            headerLines.push(`        if let Some(auth) = authorization {`);
            headerLines.push(`            ws_options.headers.insert("Authorization".to_string(), auth.to_string());`);
            headerLines.push(`        }`);
        }

        for (const header of channel.headers) {
            // Skip Sec-WebSocket-Protocol — see isWebSocketProtocolHeader().
            if (this.isWebSocketProtocolHeader(header)) {
                continue;
            }
            const paramName = this.context.case.snakeSafe(header.name);
            const wireValue = getWireValue(header.name);
            const isAuthHeader = this.isAuthorizationHeader(header);
            if (isAuthHeader) {
                headerLines.push(`        if let Some(auth) = ${paramName} {`);
                headerLines.push(`            ws_options.headers.insert("${wireValue}".to_string(), auth.to_string());`);
                headerLines.push(`        }`);
            } else {
                headerLines.push(`        ws_options.headers.insert("${wireValue}".to_string(), ${paramName}.to_string());`);
            }
        }
        const headerInserts = headerLines.join("\n");

        // Build query parameter assignment using QueryBuilder
        let queryAssignment = "";
        if (hasQueryParams) {
            const queryChain = this.buildQueryBuilderChain(channel.queryParameters);
            queryAssignment = `        ws_options.query_params = QueryBuilder::new()
${queryChain}
            .build()
            .unwrap_or_default();`;
        }

        const needsMut = this.needsImplicitAuth(channel) || channel.headers.length > 0 || hasQueryParams;
        const optionsBinding = needsMut ? "let mut ws_options" : "let ws_options";

        return `    pub async fn ${connectMethodName}(${params.join(", ")}) -> Result<Self, ApiError> {
        let full_url = format!("{}${pathExpression}", url);
        ${optionsBinding} = WebSocketOptions::default();
${headerInserts}
${queryAssignment}
        let (ws, incoming_rx) = WebSocketClient::connect(&full_url, ws_options).await?;
        Ok(Self { ws, incoming_rx })
    }`;
    }

    private generateSendMethod(msg: FernIr.WebSocketMessage): string {
        const methodName = this.getMessageMethodName(msg, "send");

        if (this.isBinaryMessage(msg)) {
            return `    pub async fn ${methodName}(&self, data: &[u8]) -> Result<(), ApiError> {
        self.ws.send_binary(data).await
    }`;
        }

        const bodyType = this.getMessageBodyType(msg);
        if (bodyType) {
            return `    pub async fn ${methodName}(&self, message: &${bodyType}) -> Result<(), ApiError> {
        self.ws.send_json(message).await
    }`;
        }

        return `    pub async fn ${methodName}(&self, message: &serde_json::Value) -> Result<(), ApiError> {
        self.ws.send_json(message).await
    }`;
    }

    private generateReceiveMethod(
        channelName: string,
        jsonServerMessages: FernIr.WebSocketMessage[],
        hasBinaryServerMessages: boolean
    ): string {
        if (jsonServerMessages.length === 0 && !hasBinaryServerMessages) {
            return `    pub async fn recv(&mut self) -> Option<Result<WebSocketMessage, ApiError>> {
        self.incoming_rx.recv().await
    }`;
        }

        const enumName = `${channelName}ServerMessage`;

        if (hasBinaryServerMessages && jsonServerMessages.length > 0) {
            const eventName = `${channelName}Event`;
            return `    pub async fn recv(&mut self) -> Option<Result<${eventName}, ApiError>> {
        match self.incoming_rx.recv().await {
            Some(Ok(WebSocketMessage::Text(raw))) => {
                Some(serde_json::from_str::<${enumName}>(&raw).map(${eventName}::Message).map_err(ApiError::Serialization))
            }
            Some(Ok(WebSocketMessage::Binary(data))) => {
                Some(Ok(${eventName}::Audio(data)))
            }
            Some(Ok(WebSocketMessage::Close(_))) => {
                None
            }
            Some(Err(e)) => Some(Err(e)),
            None => None,
        }
    }`;
        }

        return `    pub async fn recv(&mut self) -> Option<Result<${enumName}, ApiError>> {
        match self.incoming_rx.recv().await {
            Some(Ok(WebSocketMessage::Text(raw))) => {
                Some(serde_json::from_str::<${enumName}>(&raw).map_err(ApiError::Serialization))
            }
            Some(Ok(WebSocketMessage::Binary(data))) => {
                Some(Err(ApiError::WebSocketError(
                    format!("Received unexpected binary frame ({} bytes) on a JSON-only channel", data.len())
                )))
            }
            Some(Ok(WebSocketMessage::Close(_))) => None,
            Some(Err(e)) => Some(Err(e)),
            None => None,
        }
    }`;
    }

    private generateCloseMethod(): string {
        return `    pub async fn close(&self) -> Result<(), ApiError> {
        self.ws.close().await
    }`;
    }

    /**
     * Generates a connector struct that wraps the base URL and delegates to the
     * client's connect() method. This allows WebSocket clients to be accessed
     * through the root client (e.g., `client.realtime.connect(...)`).
     */
    private generateConnectorStruct(
        clientName: string,
        enumPrefix: string,
        channel: FernIr.WebSocketChannel,
        connectMethodName: string
    ): string {
        const connectorName = this.getConnectorName(clientName);
        const hasQueryParams = channel.queryParameters.length > 0;

        // The connector always auto-injects the Authorization header from the stored
        // token so users never need to pass it manually — matching the TypeScript SDK
        // experience where `client.realtime.connect()` "just works".
        const allClientParams = this.buildConnectParams(channel);
        const connectParams = allClientParams.filter((p) => p.name !== AUTH_PARAM_NAME);
        const params: string[] = ["&self", ...connectParams.map((p) => `${p.name}: ${p.type}`)];

        // Add options struct parameter if there are query parameters
        if (hasQueryParams) {
            const optionsStructName = this.getConnectOptionsName(enumPrefix);
            params.push(`options: &${optionsStructName}`);
        }

        // Build the forward args for the underlying client::connect() call.
        // Insert the auto-constructed Bearer token where the authorization param goes.
        const forwardArgs: string[] = ["&self.base_url"];
        for (const p of allClientParams) {
            if (p.name === AUTH_PARAM_NAME) {
                forwardArgs.push("auth_header.as_deref()");
            } else {
                forwardArgs.push(p.name);
            }
        }
        if (hasQueryParams) {
            forwardArgs.push("options");
        }

        // Check if there is any authorization param to auto-inject
        const hasAuthParam = allClientParams.some((p) => p.name === AUTH_PARAM_NAME);

        const structFields = `    base_url: String,\n    auth_header: Option<String>,`;
        const newParams = `base_url: String, auth_header: Option<String>`;
        const newBody = `Self { base_url, auth_header }`;

        // For auth forwarding, the connector stores the pre-computed Authorization
        // header value (e.g., "Token my-key" or "Bearer my-token") and passes it
        // through to the underlying client's connect() call.
        const authForward = hasAuthParam
            ? "self.auth_header.as_deref()"
            : "";

        // Replace the auth_header.as_deref() placeholder in forwardArgs with
        // the direct field reference (no local variable needed).
        const finalForwardArgs = forwardArgs.map((arg) =>
            arg === "auth_header.as_deref()" ? authForward : arg
        );

        return `/// Connector for the ${clientName.replace(/Client$/, "")} WebSocket channel.
/// Provides access to the WebSocket channel through the root client.
pub struct ${connectorName} {
${structFields}
}

impl ${connectorName} {
    pub fn new(${newParams}) -> Self {
        ${newBody}
    }

    pub async fn ${connectMethodName}(${params.join(", ")}) -> Result<${clientName}, ApiError> {
        ${clientName}::${connectMethodName}(${finalForwardArgs.join(", ")}).await
    }
}`;
    }

    private buildPathExpression(channel: FernIr.WebSocketChannel): string {
        let path = channel.path.head ?? "";
        for (const part of channel.path.parts) {
            path += `{${part.pathParameter}}`;
            if (part.tail) {
                path += part.tail;
            }
        }
        return path;
    }

    /**
     * Partitions a channel's server messages into JSON and binary categories.
     */
    private getServerMessageInfo(channel: FernIr.WebSocketChannel): {
        serverMessages: FernIr.WebSocketMessage[];
        jsonServerMessages: FernIr.WebSocketMessage[];
        hasBinaryServerMessages: boolean;
    } {
        const serverMessages = channel.messages.filter((m) => m.origin === "server");
        const jsonServerMessages = serverMessages.filter((m) => !this.isBinaryMessage(m));
        const hasBinaryServerMessages = serverMessages.some((m) => this.isBinaryMessage(m));
        return { serverMessages, jsonServerMessages, hasBinaryServerMessages };
    }

    /**
     * Detects binary messages. Binary messages have a primitive body type (e.g., string
     * with format: binary from AsyncAPI). JSON messages always reference named types (structs).
     */
    private isBinaryMessage(msg: FernIr.WebSocketMessage): boolean {
        if (msg.body.type === "reference") {
            return msg.body.bodyType.type === "primitive";
        }
        return false;
    }


    private getMessageVariantName(msg: FernIr.WebSocketMessage): string {
        if (msg.body.type === "inlinedBody") {
            return this.context.case.pascalSafe(msg.body.name);
        }
        // For reference body types, derive variant name from the referenced type
        // Use disambiguated name so variant matches body type (e.g., AuthResponse2(AuthResponse2))
        if (msg.body.type === "reference") {
            const typeRef = msg.body.bodyType;
            if (typeRef.type === "named") {
                return this.context.getUniqueTypeNameForReference(typeRef);
            }
        }
        // Fallback: capitalize the message type ID
        return msg.type.charAt(0).toUpperCase() + msg.type.slice(1);
    }

    private getConnectMethodName(channel: FernIr.WebSocketChannel): string {
        return channel.connectMethodName
            ? convertToSnakeCase(channel.connectMethodName)
            : "connect";
    }

    private getMessageMethodName(msg: FernIr.WebSocketMessage, prefix: string): string {
        if (msg.methodName != null) {
            return convertToSnakeCase(msg.methodName);
        }
        const name = msg.body.type === "inlinedBody"
            ? this.context.case.snakeSafe(msg.body.name)
            : convertToSnakeCase(msg.type);
        return `${prefix}_${name}`;
    }

    private getConnectOptionsName(enumPrefix: string): string {
        return `${enumPrefix}ConnectOptions`;
    }

    /**
     * Generates a typed struct for WebSocket connect options, matching the
     * REST pattern where query parameters are fields in a request struct.
     */
    private generateConnectOptionsStruct(enumPrefix: string, channel: FernIr.WebSocketChannel): string {
        const structName = this.getConnectOptionsName(enumPrefix);
        const fields: string[] = [];

        for (const qp of channel.queryParameters) {
            const fieldName = this.context.case.snakeSafe(qp.name);
            const wireValue = getWireValue(qp.name);
            const isAlreadyOptional = isOptionalType(qp.valueType);

            let fieldType: string;
            if (qp.allowMultiple) {
                // allowMultiple uses Vec<T> which implements Default
                const innerType = this.getQueryParamRustType(
                    isAlreadyOptional ? getInnerTypeFromOptional(qp.valueType) : qp.valueType
                );
                fieldType = `Vec<${innerType}>`;
            } else if (isAlreadyOptional) {
                // Already optional in the IR — use the type as-is
                fieldType = this.getQueryParamRustType(qp.valueType);
            } else {
                // Required field — wrap in Option for Default derive and ..Default::default() ergonomics.
                // The server validates required fields; the client struct is lenient.
                const innerType = this.getQueryParamRustType(qp.valueType);
                fieldType = `Option<${innerType}>`;
            }

            const attrs: string[] = [];

            // Only add serde rename when wire name differs from field name
            if (fieldName !== wireValue) {
                attrs.push(`    #[serde(rename = "${wireValue}")]`);
            }

            const attrsStr = attrs.length > 0 ? `${attrs.join("\n")}\n` : "";
            const docStr = qp.docs ? `    /// ${qp.docs}\n` : "";

            fields.push(`${docStr}${attrsStr}    pub ${fieldName}: ${fieldType},`);
        }

        return `#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ${structName} {
${fields.join("\n")}
}`;
    }

    /**
     * Maps an IR TypeReference to a Rust type string for use in the connect options struct.
     */
    private getQueryParamRustType(typeRef: FernIr.TypeReference): string {
        switch (typeRef.type) {
            case "primitive":
                return FernIr.PrimitiveTypeV1._visit(typeRef.primitive.v1, {
                    string: () => "String",
                    boolean: () => "bool",
                    integer: () => "i64",
                    uint: () => "i64",
                    uint64: () => "i64",
                    long: () => "i64",
                    float: () => "f64",
                    double: () => "f64",
                    bigInteger: () => "String",
                    date: () => "String",
                    dateTime: () => "String",
                    dateTimeRfc2822: () => "String",
                    base64: () => "String",
                    uuid: () => "String",
                    _other: () => "String"
                });
            case "named":
                return this.context.getUniqueTypeNameForReference(typeRef);
            case "container":
                return typeRef.container._visit({
                    optional: (inner: FernIr.TypeReference) => `Option<${this.getQueryParamRustType(inner)}>`,
                    nullable: (inner: FernIr.TypeReference) => `Option<${this.getQueryParamRustType(inner)}>`,
                    list: (inner: FernIr.TypeReference) => `Vec<${this.getQueryParamRustType(inner)}>`,
                    set: (inner: FernIr.TypeReference) => `Vec<${this.getQueryParamRustType(inner)}>`,
                    map: () => "serde_json::Value",
                    literal: (lit: FernIr.Literal) =>
                        lit._visit({
                            string: () => "String",
                            boolean: () => "bool",
                            _other: () => "String"
                        }),
                    _other: () => "serde_json::Value"
                });
            case "unknown":
                return "serde_json::Value";
            default:
                return "String";
        }
    }

    /**
     * Maps an IR TypeReference to the appropriate QueryBuilder method name.
     */
    private getQueryBuilderMethodForType(typeRef: FernIr.TypeReference): string {
        if (typeRef.type === "primitive") {
            return FernIr.PrimitiveTypeV1._visit(typeRef.primitive.v1, {
                string: () => "string",
                boolean: () => "bool",
                integer: () => "int",
                uint: () => "int",
                uint64: () => "int",
                long: () => "int",
                float: () => "float",
                double: () => "float",
                bigInteger: () => "big_int",
                date: () => "date",
                dateTime: () => "datetime",
                dateTimeRfc2822: () => "datetime",
                base64: () => "serialize",
                uuid: () => "uuid",
                _other: () => "serialize"
            });
        }
        if (typeRef.type === "container") {
            return typeRef.container._visit({
                optional: (inner: FernIr.TypeReference) => this.getQueryBuilderMethodForType(inner),
                nullable: (inner: FernIr.TypeReference) => this.getQueryBuilderMethodForType(inner),
                list: () => "serialize",
                set: () => "serialize",
                map: () => "serialize",
                literal: (lit: FernIr.Literal) =>
                    lit._visit({
                        string: () => "string",
                        boolean: () => "bool",
                        _other: () => "serialize"
                    }),
                _other: () => "serialize"
            });
        }
        return "serialize";
    }

    /**
     * Gets the QueryBuilder method name for a query parameter, handling allowMultiple.
     */
    private getQueryBuilderMethodForParam(qp: FernIr.QueryParameter): string {
        if (qp.allowMultiple) {
            const base = this.getQueryBuilderMethodForType(qp.valueType);
            if (["string", "int", "float", "bool"].includes(base)) {
                return `${base}_array`;
            }
            return "serialize_array";
        }
        return this.getQueryBuilderMethodForType(qp.valueType);
    }

    /**
     * Builds a QueryBuilder method chain from query parameters, reading from the options struct.
     */
    private buildQueryBuilderChain(queryParams: FernIr.QueryParameter[]): string {
        const lines = queryParams.map((qp) => {
            const wireValue = getWireValue(qp.name);
            const fieldName = this.context.case.snakeSafe(qp.name);
            const method = this.getQueryBuilderMethodForParam(qp);

            // All fields in the options struct are Option<T> (or Vec<T> for allowMultiple),
            // so .clone() works directly with all QueryBuilder methods:
            // - Primitive methods accept impl Into<Option<T>> (handles Option<T>)
            // - .serialize() accepts Option<T> directly
            const value = `options.${fieldName}.clone()`;

            return `            .${method}("${wireValue}", ${value})`;
        });

        return lines.join("\n");
    }

    private getMessageBodyType(msg: FernIr.WebSocketMessage): string | undefined {
        if (msg.body.type === "reference") {
            const typeRef = msg.body.bodyType;
            if (typeRef.type === "named") {
                // Use the context's type disambiguation to get the correct unique type name.
                // Without this, types like AuthResponse in the trading namespace would resolve
                // to the market_data AuthResponse instead of the disambiguated AuthResponse2.
                return this.context.getUniqueTypeNameForReference(typeRef);
            }
            if (typeRef.type === "primitive") {
                return "String";
            }
        }
        if (msg.body.type === "inlinedBody") {
            if (msg.body.properties.length > 0) {
                return `serde_json::Value`;
            }
        }
        return undefined;
    }
}
