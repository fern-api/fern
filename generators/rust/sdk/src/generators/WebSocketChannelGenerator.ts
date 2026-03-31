import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust, UseStatement } from "@fern-api/rust-codegen";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export class WebSocketChannelGenerator {
    private readonly context: SdkGeneratorContext;
    private channelNameMap: Map<string, { moduleName: string; clientName: string; enumPrefix: string }> =
        new Map();

    constructor(context: SdkGeneratorContext) {
        this.context = context;
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
    }> {
        if (!this.context.hasWebSocketChannels()) {
            return [];
        }
        const websocketChannels = this.context.ir.websocketChannels;
        if (!websocketChannels) {
            return [];
        }

        // Ensure name map is built
        if (this.channelNameMap.size === 0) {
            this.buildChannelNameMap(websocketChannels);
        }

        const result: Array<{
            connectorName: string;
            fieldName: string;
            clientName: string;
            moduleName: string;
            channel: FernIr.WebSocketChannel;
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
                channel
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
        this.channelNameMap.clear();

        // Detect name collisions
        const nameCount = new Map<string, number>();
        for (const channel of Object.values(websocketChannels)) {
            const baseName = channel.name.snakeCase.safeName;
            nameCount.set(baseName, (nameCount.get(baseName) ?? 0) + 1);
        }

        for (const [channelId, channel] of Object.entries(websocketChannels)) {
            const baseName = channel.name.snakeCase.safeName;

            if ((nameCount.get(baseName) ?? 0) > 1) {
                // Derive unique name from channel ID: "channel_speak/v1" → "speak_v1"
                const uniqueName = this.deriveNameFromChannelId(channelId);
                this.channelNameMap.set(channelId, {
                    moduleName: uniqueName.snakeCase,
                    clientName: `${uniqueName.pascalCase}Client`,
                    enumPrefix: uniqueName.pascalCase
                });
            } else {
                this.channelNameMap.set(channelId, {
                    moduleName: channel.name.snakeCase.safeName,
                    clientName: `${channel.name.pascalCase.safeName}Client`,
                    enumPrefix: channel.name.pascalCase.safeName
                });
            }
        }
    }

    private deriveNameFromChannelId(channelId: string): { snakeCase: string; pascalCase: string } {
        // "channel_speak/v1" → strip "channel_" prefix, replace "/" with "_"
        const cleaned = channelId
            .replace(/^channel_/, "")
            .replace(/\//g, "_");
        const snakeCase = cleaned;
        const pascalCase = cleaned
            .split("_")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
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

            const serverMessages = channel.messages.filter((m) => m.origin === "server");
            const jsonServerMessages = serverMessages.filter((m) => !this.isBinaryMessage(m));
            const hasBinaryServerMessages = serverMessages.some((m) => this.isBinaryMessage(m));

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
            throw new Error(`No name mapping found for channel ${channelId}`);
        }
        const { clientName, moduleName, enumPrefix } = names;

        const clientMessages = channel.messages.filter((m) => m.origin === "client");
        const serverMessages = channel.messages.filter((m) => m.origin === "server");
        const jsonServerMessages = serverMessages.filter((m) => !this.isBinaryMessage(m));
        const hasBinaryServerMessages = serverMessages.some((m) => this.isBinaryMessage(m));

        const rawDeclarations: string[] = [];

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
        rawDeclarations.push(this.generateConnectorStruct(clientName, channel));

        const hasJsonServerMessages = jsonServerMessages.length > 0;
        const useStatements = this.generateImports(hasJsonServerMessages);

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

    private generateImports(hasJsonServerMessages: boolean): UseStatement[] {
        const imports: UseStatement[] = [
            new UseStatement({
                path: "crate",
                items: ["ApiError", "WebSocketClient", "WebSocketMessage", "WebSocketOptions"]
            }),
            new UseStatement({
                path: "tokio::sync",
                items: ["mpsc"]
            })
        ];
        if (hasJsonServerMessages) {
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
     * Generates the server message enum containing only JSON (non-binary) server messages.
     * Binary messages are handled separately via the Event enum.
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

        return `#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ${enumName} {
${variants}
}`;
    }

    /**
     * Generates the Event enum for channels with both JSON and binary server messages.
     * Wraps the ServerMessage enum for JSON frames and Vec<u8> for binary frames.
     */
    private generateEventEnum(enumPrefix: string): string {
        const enumName = `${enumPrefix}Event`;
        const serverMessageName = `${enumPrefix}ServerMessage`;
        return `#[derive(Debug, Clone)]
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

        const connectMethod = this.generateConnectMethod(clientName, channel, pathExpression);
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
     * Builds the shared connect parameter list from a WebSocket channel's IR definition.
     * Used by both generateConnectMethod() and generateConnectorStruct() to ensure
     * parameter signatures stay in sync.
     */
    /**
     * Returns true if the channel does not already have an explicit Authorization
     * header in its IR definition.  When true, the connector will automatically
     * inject a Bearer token from the stored ClientConfig token.
     */
    private needsImplicitAuth(channel: FernIr.WebSocketChannel): boolean {
        const hasExplicitAuth = channel.headers.some(
            (h) => h.name.wireValue.toLowerCase() === "authorization"
        );
        return !hasExplicitAuth;
    }

    /**
     * Returns true if the header is `Sec-WebSocket-Protocol` (case-insensitive).
     * This header is handled specially by tungstenite for RFC 6455 subprotocol
     * negotiation and must NOT be inserted as a regular HTTP header, because
     * tungstenite will fail the handshake if the server does not echo it back.
     */
    private isWebSocketProtocolHeader(header: FernIr.HttpHeader): boolean {
        return header.name.wireValue.toLowerCase() === "sec-websocket-protocol";
    }

    private buildConnectParams(channel: FernIr.WebSocketChannel): Array<{ name: string; type: string }> {
        const params: Array<{ name: string; type: string }> = [];

        for (const pathParam of channel.pathParameters) {
            params.push({ name: pathParam.name.snakeCase.safeName, type: "&str" });
        }

        // If auth is required but no explicit Authorization header, add it
        if (this.needsImplicitAuth(channel)) {
            params.push({ name: "authorization", type: "&str" });
        }

        for (const header of channel.headers) {
            // Skip Sec-WebSocket-Protocol — tungstenite handles subprotocol
            // negotiation internally and fails if the server doesn't echo it.
            if (this.isWebSocketProtocolHeader(header)) {
                continue;
            }
            params.push({ name: header.name.name.snakeCase.safeName, type: "&str" });
        }

        for (const qp of channel.queryParameters) {
            const isOptional = this.isOptionalType(qp.valueType);
            params.push({
                name: qp.name.name.snakeCase.safeName,
                type: isOptional ? "Option<&str>" : "&str"
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
        channel: FernIr.WebSocketChannel,
        pathExpression: string
    ): string {
        const connectParams = this.buildConnectParams(channel);
        const params: string[] = ["url: &str", ...connectParams.map((p) => `${p.name}: ${p.type}`)];

        const headerLines: string[] = [];

        // If auth is required but no explicit Authorization header, inject it
        if (this.needsImplicitAuth(channel)) {
            headerLines.push(`        options.headers.insert("Authorization".to_string(), authorization.to_string());`);
        }

        for (const header of channel.headers) {
            // Skip Sec-WebSocket-Protocol — see isWebSocketProtocolHeader().
            if (this.isWebSocketProtocolHeader(header)) {
                continue;
            }
            const paramName = header.name.name.snakeCase.safeName;
            const wireValue = header.name.wireValue;
            headerLines.push(`        options.headers.insert("${wireValue}".to_string(), ${paramName}.to_string());`);
        }
        const headerInserts = headerLines.join("\n");

        const queryLines: string[] = [];
        if (channel.queryParameters.length > 0) {
            for (const qp of channel.queryParameters) {
                const paramName = qp.name.name.snakeCase.safeName;
                const wireValue = qp.name.wireValue;
                const isOptional = this.isOptionalType(qp.valueType);
                if (isOptional) {
                    queryLines.push(`        if let Some(v) = ${paramName} {`);
                    queryLines.push(`            options.query_params.push(("${wireValue}".to_string(), v.to_string()));`);
                    queryLines.push(`        }`);
                } else {
                    queryLines.push(`        options.query_params.push(("${wireValue}".to_string(), ${paramName}.to_string()));`);
                }
            }
        }

        const needsMut = this.needsImplicitAuth(channel) || channel.headers.length > 0 || channel.queryParameters.length > 0;
        const optionsBinding = needsMut ? "let mut options" : "let options";

        return `    pub async fn connect(${params.join(", ")}) -> Result<Self, ApiError> {
        let full_url = format!("{}${pathExpression}", url);
        ${optionsBinding} = WebSocketOptions::default();
${headerInserts}
${queryLines.join("\n")}
        let (ws, incoming_rx) = WebSocketClient::connect(&full_url, options).await?;
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
            Some(Err(e)) => Some(Err(e)),
            None => None,
        }
    }`;
        }

        return `    pub async fn recv(&mut self) -> Option<Result<${enumName}, ApiError>> {
        loop {
            match self.incoming_rx.recv().await {
                Some(Ok(WebSocketMessage::Text(raw))) => {
                    return Some(serde_json::from_str::<${enumName}>(&raw).map_err(ApiError::Serialization));
                }
                Some(Ok(WebSocketMessage::Binary(_))) => {
                    continue;
                }
                Some(Err(e)) => return Some(Err(e)),
                None => return None,
            }
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
    private generateConnectorStruct(clientName: string, channel: FernIr.WebSocketChannel): string {
        const connectorName = this.getConnectorName(clientName);

        // The connector always auto-injects the Authorization header from the stored
        // token so users never need to pass it manually — matching the TypeScript SDK
        // experience where `client.realtime.connect()` "just works".
        const connectParams = this.buildConnectParams(channel)
            .filter((p) => p.name !== "authorization");
        const params: string[] = ["&self", ...connectParams.map((p) => `${p.name}: ${p.type}`)];

        // Build the forward args for the underlying client::connect() call.
        // Insert the auto-constructed Bearer token where the authorization param goes.
        const allClientParams = this.buildConnectParams(channel);
        const forwardArgs: string[] = ["&self.base_url"];
        for (const p of allClientParams) {
            if (p.name === "authorization") {
                forwardArgs.push("&auth_header");
            } else {
                forwardArgs.push(p.name);
            }
        }

        // Check if there is any authorization param to auto-inject
        const hasAuthParam = allClientParams.some((p) => p.name === "authorization");

        const structFields = `    base_url: String,\n    token: Option<String>,`;
        const newParams = `base_url: String, token: Option<String>`;
        const newBody = `Self { base_url, token }`;

        const authSetup = hasAuthParam
            ? `        let auth_header = self.token.as_ref()
            .map(|t| format!("Bearer {}", t))
            .unwrap_or_default();\n`
            : "";

        return `/// Connector for the ${clientName.replace(/Client$/, "")} WebSocket channel.
/// Provides access to the WebSocket channel through the root client.
pub struct ${connectorName} {
${structFields}
}

impl ${connectorName} {
    pub fn new(${newParams}) -> Self {
        ${newBody}
    }

    pub async fn connect(${params.join(", ")}) -> Result<${clientName}, ApiError> {
${authSetup}        ${clientName}::connect(${forwardArgs.join(", ")}).await
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
     * Detects binary messages. Binary messages have a primitive body type (e.g., string
     * with format: binary from AsyncAPI). JSON messages always reference named types (structs).
     */
    private isBinaryMessage(msg: FernIr.WebSocketMessage): boolean {
        if (msg.body.type === "reference") {
            return msg.body.bodyType.type === "primitive";
        }
        return false;
    }

    private isOptionalType(typeRef: FernIr.TypeReference): boolean {
        return typeRef.type === "container" && typeRef.container.type === "optional";
    }

    private getMessageVariantName(msg: FernIr.WebSocketMessage): string {
        if (msg.body.type === "inlinedBody") {
            return msg.body.name.pascalCase.safeName;
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

    private getMessageMethodName(msg: FernIr.WebSocketMessage, prefix: string): string {
        const name = msg.body.type === "inlinedBody"
            ? msg.body.name.snakeCase.safeName
            : this.toSnakeCase(msg.type);
        return `${prefix}_${name}`;
    }

    private toSnakeCase(value: string): string {
        return value
            .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
            .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
            .toLowerCase();
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
