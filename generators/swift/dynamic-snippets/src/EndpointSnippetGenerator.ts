import { Options, Severity, Style } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { swift } from "@fern-api/swift-codegen";

import { Config } from "./Config";
import { DynamicSnippetsGeneratorContext } from "./context";

const CLIENT_CONST_NAME = "client";

export class EndpointSnippetGenerator {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public async generateSnippet({
        endpoint,
        request,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
        options: Options;
    }): Promise<string> {
        return this.buildCodeBlock({ endpoint, snippetRequest: request, options });
    }

    public generateSnippetSync({
        endpoint,
        request,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
        options: Options;
    }): string {
        return this.buildCodeBlock({ endpoint, snippetRequest: request, options });
    }

    private buildCodeBlock({
        endpoint,
        snippetRequest,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippetRequest: FernIr.dynamic.EndpointSnippetRequest;
        options: Options;
    }) {
        const fileComponents: swift.FileComponent[] = [
            this.generateImportModuleStatement(),
            swift.LineBreak.single(),
            this.generateRootClientInitializationStatement({ auth: endpoint.auth, values: snippetRequest.auth }),
            swift.LineBreak.single(),
            this.generateEndpointMethodCallStatement({ endpoint })
        ];
        return fileComponents.map((c) => c.toString()).join("");
    }

    private generateImportModuleStatement() {
        // TODO(kafkas): Implement
        return swift.Statement.import("Acme");
    }

    private generateRootClientInitializationStatement({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth | undefined;
        values: FernIr.dynamic.AuthValues | undefined;
    }) {
        const rootClientArgs = auth && values ? this.getRootClientAuthArgs({ auth, values }) : [];
        return swift.Statement.constantDeclaration({
            unsafeName: CLIENT_CONST_NAME,
            value: swift.Expression.classInitialization({
                unsafeName: this.context.getRootClientClassName(),
                arguments_: rootClientArgs,
                multiline: rootClientArgs.length > 1 ? true : undefined
            })
        });
    }

    private getRootClientAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth;
        values: FernIr.dynamic.AuthValues;
    }): swift.FunctionArgument[] {
        switch (auth.type) {
            case "basic":
                if (values.type !== "basic") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                return [
                    swift.functionArgument({
                        label: auth.username.camelCase.unsafeName,
                        value: swift.Expression.rawStringValue(values.username)
                    }),
                    swift.functionArgument({
                        label: auth.password.camelCase.unsafeName,
                        value: swift.Expression.rawStringValue(values.password)
                    })
                ];
            case "bearer":
                if (values.type !== "bearer") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                return [
                    swift.functionArgument({
                        label: auth.token.camelCase.unsafeName,
                        value: swift.Expression.rawStringValue(values.token)
                    })
                ];
            case "header":
                if (values.type !== "header") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                return [
                    swift.functionArgument({
                        label: auth.header.name.name.camelCase.unsafeName,
                        value: this.context.dynamicTypeLiteralMapper.convert({
                            typeReference: auth.header.typeReference,
                            value: values.value
                        })
                    })
                ];
            case "oauth":
                if (values.type !== "oauth") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                // TODO(kafkas): Add when oauth is supported
                return [];
            default:
                assertNever(auth);
        }
    }

    private generateEndpointMethodCallStatement({ endpoint }: { endpoint: FernIr.dynamic.Endpoint }) {
        return swift.Statement.expressionStatement(
            swift.Expression.try(
                swift.Expression.await(
                    swift.Expression.methodCall({
                        target: swift.Expression.rawValue(CLIENT_CONST_NAME),
                        methodName: this.getMethodName({ endpoint }),
                        arguments_: [], // TODO(kafkas): Implement
                        multiline: true
                    })
                )
            )
        );
    }

    private getMethodName({ endpoint }: { endpoint: FernIr.dynamic.Endpoint }): string {
        if (endpoint.declaration.fernFilepath.allParts.length > 0) {
            const pathToMethod = `${endpoint.declaration.fernFilepath.allParts.map((p) => p.camelCase.unsafeName).join(".")}`;
            return `${pathToMethod}.${endpoint.declaration.name.camelCase.unsafeName}`;
        }
        return endpoint.declaration.name.camelCase.unsafeName;
    }

    private getStyle(options: Options): Style {
        return options.style ?? this.context.options.style ?? Style.Full;
    }

    private getConfig(options: Options): Config {
        return options.config ?? this.context.options.config ?? {};
    }
}
