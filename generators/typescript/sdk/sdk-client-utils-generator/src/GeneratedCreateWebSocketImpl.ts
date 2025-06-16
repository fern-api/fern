import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { CodeBlockWriter, WriterFunction, ts } from "ts-morph";

import { BaseGeneratedUtilsFileImpl } from "./GeneratedUtilsFileImpl";

// createWebSocket.ts
export class GeneratedCreateWebSocketImpl extends BaseGeneratedUtilsFileImpl {
    public writeToFile(context: SdkContext): void {
        // Add all necessary imports
        this.addImports();

        // Generate the createWebSocket function using proper AST patterns
        this.generateCreateWebSocketFunction(context);
    }

    private addImports(): void {
        this.importsManager.addImport("../../../../core", {
            namedImports: ["Supplier", "WebSocketLike"]
        });

        this.importsManager.addImport("../../../../core/runtime", {
            namedImports: ["RUNTIME"]
        });

        this.importsManager.addImport("../../../../core/websocket/ws", {
            namedImports: ["WebSocketClientOptions"]
        });

        this.importsManager.addImport("./getAuthHeaders", {
            namedImports: ["getAuthHeaders"]
        });

        this.importsManager.addImport("./getAuthProtocols", {
            namedImports: ["getAuthProtocols"]
        });

        this.importsManager.addImport("./getHeaders", {
            namedImports: ["getHeaders"]
        });
    }

    private generateCreateWebSocketFunction(context: SdkContext): void {
        const functionBody: WriterFunction = (writer) => {
            // Use AST for the resolved key statement
            const resolvedKeyStmt = this.createResolvedKeyStatement();
            writer.write(getTextOfTsNode(resolvedKeyStmt));
            writer.newLine();

            // Use structured approach for switch statement
            this.writeSwitchStatement(writer);
        };

        context.sourceFile.addFunction({
            name: "createWebSocket",
            isExported: true,
            isAsync: true,
            typeParameters: [this.createOptionsTypeParameter()],
            parameters: [this.createUrlParameter(), this.createOptionsParameter()],
            returnType: this.createReturnType(),
            statements: functionBody
        });
    }

    private createOptionsTypeParameter() {
        return {
            name: "Options",
            constraint: "WebSocketClientOptions"
        };
    }

    private createUrlParameter() {
        return {
            name: "url",
            type: this.createStringType()
        };
    }

    private createOptionsParameter() {
        return {
            name: "options",
            type: "Options"
        };
    }

    private createReturnType() {
        return "Promise<WebSocketLike>";
    }

    private createResolvedKeyStatement() {
        return ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        ts.factory.createIdentifier("resolvedKey"),
                        undefined,
                        undefined,
                        ts.factory.createAwaitExpression(
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier("Supplier"),
                                    ts.factory.createIdentifier("get")
                                ),
                                undefined,
                                [
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier("options"),
                                        ts.factory.createIdentifier("apiKey")
                                    )
                                ]
                            )
                        )
                    )
                ],
                ts.NodeFlags.Const
            )
        );
    }

    private writeSwitchStatement(writer: CodeBlockWriter): void {
        writer.writeLine("switch (RUNTIME.type) {");
        writer.indent(() => {
            this.writeBrowserCases(writer);
            this.writeNodeCase(writer);
            this.writeUnsupportedRuntimeCases(writer);
        });
        writer.writeLine("}");
    }

    private writeBrowserCases(writer: CodeBlockWriter): void {
        const browserRuntimes = ["browser", "react-native", "web-worker", "deno", "bun"];

        browserRuntimes.forEach((runtime) => {
            writer.writeLine(`case "${runtime}":`);
        });

        writer.indent(() => {
            const webSocketCreation = this.createBrowserWebSocketExpression();
            writer.writeLine(`return ${getTextOfTsNode(webSocketCreation)};`);
        });
        writer.newLine();
    }

    private createBrowserWebSocketExpression() {
        return ts.factory.createNewExpression(ts.factory.createIdentifier("WebSocket"), undefined, [
            ts.factory.createIdentifier("url"),
            ts.factory.createArrayLiteralExpression([
                ts.factory.createSpreadElement(
                    ts.factory.createCallExpression(ts.factory.createIdentifier("getAuthProtocols"), undefined, [
                        ts.factory.createIdentifier("resolvedKey")
                    ])
                ),
                ts.factory.createSpreadElement(
                    ts.factory.createParenthesizedExpression(
                        ts.factory.createBinaryExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("options"),
                                ts.factory.createIdentifier("protocols")
                            ),
                            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                            ts.factory.createArrayLiteralExpression()
                        )
                    )
                )
            ])
        ]);
    }

    private writeNodeCase(writer: CodeBlockWriter): void {
        writer.writeLine('case "node": {');
        writer.indent(() => {
            // Dynamic import for WebSocket
            writer.writeLine("const WebSocket = await import('ws').then(m => m.default || m.WebSocket);");
            writer.writeLine("// @ts-expect-error");

            const nodeWebSocketCreation = this.createNodeWebSocketExpression();
            writer.writeLine(`return ${getTextOfTsNode(nodeWebSocketCreation)};`);
        });
        writer.writeLine("}");
        writer.newLine();
    }

    private createNodeWebSocketExpression() {
        return ts.factory.createNewExpression(ts.factory.createIdentifier("WebSocket"), undefined, [
            ts.factory.createIdentifier("url"),
            ts.factory.createObjectLiteralExpression([
                ts.factory.createSpreadAssignment(ts.factory.createIdentifier("options")),
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("headers"),
                    ts.factory.createObjectLiteralExpression([
                        ts.factory.createSpreadAssignment(
                            ts.factory.createCallExpression(ts.factory.createIdentifier("getHeaders"), undefined, [])
                        ),
                        ts.factory.createSpreadAssignment(
                            ts.factory.createCallExpression(ts.factory.createIdentifier("getAuthHeaders"), undefined, [
                                ts.factory.createIdentifier("resolvedKey")
                            ])
                        ),
                        ts.factory.createSpreadAssignment(
                            ts.factory.createParenthesizedExpression(
                                ts.factory.createBinaryExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier("options"),
                                        ts.factory.createIdentifier("headers")
                                    ),
                                    ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                    ts.factory.createObjectLiteralExpression()
                                )
                            )
                        )
                    ])
                )
            ])
        ]);
    }

    private writeUnsupportedRuntimeCases(writer: CodeBlockWriter): void {
        const unsupportedRuntimes = ["workerd", "edge-runtime", "unknown"];

        unsupportedRuntimes.forEach((runtime) => {
            writer.writeLine(`case "${runtime}":`);
        });
        writer.writeLine("default:");

        writer.indent(() => {
            const errorExpression = this.createUnsupportedRuntimeError();
            writer.writeLine(`throw ${getTextOfTsNode(errorExpression)};`);
        });
    }

    private createUnsupportedRuntimeError() {
        return ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [
            ts.factory.createTemplateExpression(
                ts.factory.createTemplateHead("websocket client not supported in runtime: "),
                [
                    ts.factory.createTemplateSpan(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("RUNTIME"),
                            ts.factory.createIdentifier("type")
                        ),
                        ts.factory.createTemplateTail("")
                    )
                ]
            )
        ]);
    }
}
