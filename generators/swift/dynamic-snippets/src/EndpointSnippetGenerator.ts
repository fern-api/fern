import { Options, Style } from "@fern-api/browser-compatible-base-generator";
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
        const methodName = "getUsers"; // TODO(kafkas): Implement
        const fileComponents: swift.FileComponent[] = [
            swift.Statement.import("Acme"), // TODO(kafkas): Implement
            swift.LineBreak.single(),
            this.generateRootClientInitializationSnippet(),
            swift.LineBreak.single(),
            swift.Statement.expressionStatement(
                swift.Expression.try(
                    swift.Expression.await(
                        swift.Expression.methodCall({
                            target: swift.Expression.rawValue(
                                [
                                    CLIENT_CONST_NAME
                                    // TODO(kafkas): Add subpackages
                                ].join(".")
                            ),
                            methodName,
                            arguments_: [], // TODO(kafkas): Implement
                            multiline: true
                        })
                    )
                )
            )
        ];
        return fileComponents.map((c) => c.toString()).join("");
    }

    private generateRootClientInitializationSnippet() {
        type ParamsByScheme = {
            header?: {
                param: swift.FunctionParameter;
                wireValue: string;
            };
            bearer?: {
                stringParam: swift.FunctionParameter;
                asyncProviderParam: swift.FunctionParameter;
            };
            basic?: {
                usernameParam: swift.FunctionParameter;
                passwordParam: swift.FunctionParameter;
            };
        };

        const authSchemes: ParamsByScheme = {}; // TODO(kafkas): Implement
        const clientClassName = "AcmeClient"; // TODO(kafkas): Implement

        const rootClientArgs: swift.FunctionArgument[] = [];

        if (authSchemes.header) {
            rootClientArgs.push(
                swift.functionArgument({
                    label: authSchemes.header.param.argumentLabel,
                    value: swift.Expression.rawStringValue("YOUR_TOKEN")
                })
            );
        }

        if (authSchemes.bearer) {
            rootClientArgs.push(
                swift.functionArgument({
                    label: authSchemes.bearer.stringParam.argumentLabel,
                    value: swift.Expression.rawStringValue("YOUR_TOKEN")
                })
            );
        }

        if (authSchemes.basic) {
            rootClientArgs.push(
                swift.functionArgument({
                    label: authSchemes.basic.usernameParam.argumentLabel,
                    value: swift.Expression.rawStringValue("YOUR_USERNAME")
                })
            );
            rootClientArgs.push(
                swift.functionArgument({
                    label: authSchemes.basic.passwordParam.argumentLabel,
                    value: swift.Expression.rawStringValue("YOUR_PASSWORD")
                })
            );
        }

        return swift.Statement.constantDeclaration({
            unsafeName: CLIENT_CONST_NAME,
            value: swift.Expression.classInitialization({
                unsafeName: clientClassName,
                arguments_: rootClientArgs,
                multiline: rootClientArgs.length > 1 ? true : undefined
            })
        });
    }

    private getStyle(options: Options): Style {
        return options.style ?? this.context.options.style ?? Style.Full;
    }

    private getConfig(options: Options): Config {
        return options.config ?? this.context.options.config ?? {};
    }
}
