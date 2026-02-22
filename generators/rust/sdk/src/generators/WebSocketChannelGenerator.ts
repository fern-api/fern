import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust, UseStatement } from "@fern-api/rust-codegen";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export class WebSocketChannelGenerator {
    private readonly context: SdkGeneratorContext;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    public generateAll(): RustFile[] {
        const files: RustFile[] = [];
        const websocketChannels = this.context.ir.websocketChannels;
        if (!websocketChannels) {
            return files;
        }

        for (const [channelId, channel] of Object.entries(websocketChannels)) {
            files.push(this.generateChannelFile(channelId, channel));
        }

        if (files.length > 0) {
            files.push(this.generateWebSocketModFile(websocketChannels));
        }

        return files;
    }

    private generateWebSocketModFile(
        websocketChannels: Record<FernIr.WebSocketChannelId, FernIr.WebSocketChannel>
    ): RustFile {
        const moduleDeclarations: string[] = [];
        const reExports: string[] = [];

        for (const [, channel] of Object.entries(websocketChannels)) {
            const moduleName = this.getChannelModuleName(channel);
            const clientName = this.getChannelClientName(channel);
            moduleDeclarations.push(`pub mod ${moduleName};`);
            reExports.push(`pub use ${moduleName}::${clientName};`);
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
        const clientName = this.getChannelClientName(channel);
        const moduleName = this.getChannelModuleName(channel);

        const clientMessages = channel.messages.filter((m) => m.origin === "client");
        const serverMessages = channel.messages.filter((m) => m.origin === "server");

        const rawDeclarations: string[] = [];

        const serverEnum = this.generateServerMessageEnum(channel, serverMessages);
        if (serverEnum) {
            rawDeclarations.push(serverEnum);
        }
        rawDeclarations.push(this.generateClientStruct(clientName));
        rawDeclarations.push(this.generateImplBlock(clientName, channel, clientMessages, serverMessages));

        const hasMessages = clientMessages.length > 0 || serverMessages.length > 0;
        const useStatements = this.generateImports(hasMessages);

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

    private generateImports(hasServerMessages: boolean): UseStatement[] {
        const imports: UseStatement[] = [
            new UseStatement({
                path: "crate",
                items: ["ApiError", "WebSocketClient", "WebSocketOptions"]
            }),
            new UseStatement({
                path: "tokio::sync",
                items: ["mpsc"]
            })
        ];
        if (hasServerMessages) {
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

    private generateServerMessageEnum(
        channel: FernIr.WebSocketChannel,
        serverMessages: FernIr.WebSocketMessage[]
    ): string | undefined {
        if (serverMessages.length === 0) {
            return undefined;
        }

        const channelName = channel.name.pascalCase.safeName;
        const enumName = `${channelName}ServerMessage`;

        const variants = serverMessages
            .map((msg) => {
                const variantName = this.getMessageVariantName(msg);
                const wireValue = msg.type;
                const bodyType = this.getMessageBodyType(msg);
                const renameAttr = variantName !== wireValue ? `    #[serde(rename = "${wireValue}")]\n` : "";
                if (bodyType) {
                    return `${renameAttr}    ${variantName}(${bodyType}),`;
                }
                return `${renameAttr}    ${variantName},`;
            })
            .join("\n");

        return `#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ${enumName} {
${variants}
}`;
    }

    private generateClientStruct(clientName: string): string {
        return `pub struct ${clientName} {
    ws: WebSocketClient,
    incoming_rx: mpsc::UnboundedReceiver<Result<String, ApiError>>,
}`;
    }

    private generateImplBlock(
        clientName: string,
        channel: FernIr.WebSocketChannel,
        clientMessages: FernIr.WebSocketMessage[],
        serverMessages: FernIr.WebSocketMessage[]
    ): string {
        const channelName = channel.name.pascalCase.safeName;
        const pathExpression = this.buildPathExpression(channel);

        const connectMethod = this.generateConnectMethod(clientName, channel, pathExpression);
        const sendMethods = clientMessages.map((msg) => this.generateSendMethod(msg)).join("\n\n");
        const receiveMethod = this.generateReceiveMethod(channelName, serverMessages);
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

    private generateConnectMethod(
        clientName: string,
        channel: FernIr.WebSocketChannel,
        pathExpression: string
    ): string {
        const params: string[] = ["url: &str"];

        for (const pathParam of channel.pathParameters) {
            const paramName = pathParam.name.snakeCase.safeName;
            params.push(`${paramName}: &str`);
        }

        for (const header of channel.headers) {
            const paramName = header.name.name.snakeCase.safeName;
            params.push(`${paramName}: &str`);
        }

        const headerInserts = channel.headers
            .map((header) => {
                const paramName = header.name.name.snakeCase.safeName;
                const wireValue = header.name.wireValue;
                return `        options.headers.insert("${wireValue}".to_string(), ${paramName}.to_string());`;
            })
            .join("\n");

        const queryInserts = channel.queryParameters
            .map((qp) => {
                const paramName = qp.name.name.snakeCase.safeName;
                const wireValue = qp.name.wireValue;
                return `        options.query_params.push(("${wireValue}".to_string(), ${paramName}.to_string()));`;
            })
            .join("\n");

        let queryParams = "";
        if (channel.queryParameters.length > 0) {
            for (const qp of channel.queryParameters) {
                const paramName = qp.name.name.snakeCase.safeName;
                params.push(`${paramName}: &str`);
            }
            queryParams = queryInserts;
        }

        const needsMut = channel.headers.length > 0 || channel.queryParameters.length > 0;
        const optionsBinding = needsMut ? "let mut options" : "let options";

        return `    pub async fn connect(${params.join(", ")}) -> Result<Self, ApiError> {
        let full_url = format!("{}${pathExpression}", url);
        ${optionsBinding} = WebSocketOptions::default();
${headerInserts}
${queryParams}
        let (ws, incoming_rx) = WebSocketClient::connect(&full_url, options).await?;
        Ok(Self { ws, incoming_rx })
    }`;
    }

    private generateSendMethod(msg: FernIr.WebSocketMessage): string {
        const methodName = this.getMessageMethodName(msg, "send");
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
        serverMessages: FernIr.WebSocketMessage[]
    ): string {
        if (serverMessages.length === 0) {
            return `    pub async fn recv(&mut self) -> Option<Result<String, ApiError>> {
        self.incoming_rx.recv().await
    }`;
        }

        const enumName = `${channelName}ServerMessage`;
        return `    pub async fn recv(&mut self) -> Option<Result<${enumName}, ApiError>> {
        match self.incoming_rx.recv().await {
            Some(Ok(raw)) => {
                Some(serde_json::from_str::<${enumName}>(&raw).map_err(ApiError::Serialization))
            }
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

    private getChannelClientName(channel: FernIr.WebSocketChannel): string {
        return `${channel.name.pascalCase.safeName}Client`;
    }

    private getChannelModuleName(channel: FernIr.WebSocketChannel): string {
        return channel.name.snakeCase.safeName;
    }

    private getMessageVariantName(msg: FernIr.WebSocketMessage): string {
        if (msg.body.type === "inlinedBody") {
            return msg.body.name.pascalCase.safeName;
        }
        // For reference body types, derive variant name from the referenced type
        if (msg.body.type === "reference") {
            const typeRef = msg.body.bodyType;
            if (typeRef.type === "named") {
                return typeRef.name.pascalCase.safeName;
            }
        }
        // Fallback: capitalize the message type ID
        return msg.type.charAt(0).toUpperCase() + msg.type.slice(1);
    }

    private getMessageMethodName(msg: FernIr.WebSocketMessage, prefix: string): string {
        const name = msg.body.type === "inlinedBody"
            ? msg.body.name.snakeCase.safeName
            : msg.type;
        return `${prefix}_${name}`;
    }

    private getMessageBodyType(msg: FernIr.WebSocketMessage): string | undefined {
        if (msg.body.type === "reference") {
            const typeRef = msg.body.bodyType;
            if (typeRef.type === "named") {
                return typeRef.name.pascalCase.safeName;
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
