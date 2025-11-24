import { AbstractFormatter, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { ruby } from "@fern-api/ruby-ast";

import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";

const CLIENT_VAR_NAME = "client";

export class EndpointSnippetGenerator {
    private context: DynamicSnippetsGeneratorContext;
    private formatter: AbstractFormatter | undefined;

    constructor({ context, formatter }: { context: DynamicSnippetsGeneratorContext; formatter?: AbstractFormatter }) {
        this.context = context;
        this.formatter = formatter;
    }

    public async generateSnippet({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): Promise<string> {
        const code = this.buildCodeBlock({ endpoint, snippet: request });
        return await code.toStringAsync({
            customConfig: this.context.customConfig ?? {},
            formatter: this.formatter
        });
    }

    public generateSnippetSync({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): string {
        const code = this.buildCodeBlock({ endpoint, snippet: request });
        return code.toString({
            customConfig: this.context.customConfig ?? {},
            formatter: this.formatter
        });
    }

    private buildCodeBlock({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ruby.AstNode {
        // In Ruby, concise and full styles are the same
        return ruby.codeblock((writer) => {
            writer.writeNodeStatement(this.constructClient({ endpoint, snippet }));
            writer.newLine();
            writer.writeNodeStatement(this.callMethod({ endpoint, snippet }));
        });
    }

    private constructClient({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ruby.AstNode {
        return ruby.codeblock((writer) => {
            writer.addRequire(this.context.getRootModuleName().toLowerCase());

            const clientClassRef = this.context.getRootClientClassReference();
            const builderArgs = this.getRootClientBuilderArgs({ endpoint, snippet });

            writer.write(`${CLIENT_VAR_NAME} = `);
            writer.writeNode(
                ruby.instantiateClass({
                    classReference: clientClassRef,
                    arguments_: builderArgs
                })
            );
        });
    }

    // Helper for base URL/environment argument
    private getRootClientBaseUrlArg({
        baseUrl,
        environment
    }: {
        baseUrl: string | undefined;
        environment: FernIr.dynamic.EnvironmentValues | undefined;
    }): ruby.KeywordArgument[] {
        if (baseUrl != null && environment != null) {
            this.context.errors.add({
                severity: "CRITICAL",
                message: "Cannot specify both baseUrl and environment options"
            });
            return [];
        }
        if (baseUrl != null) {
            return [
                ruby.keywordArgument({
                    name: "base_url",
                    value: ruby.TypeLiteral.string(baseUrl)
                })
            ];
        }
        if (environment != null) {
            if (this.context.isSingleEnvironmentID(environment)) {
                const environmentTypeReference = this.context.getEnvironmentTypeReferenceFromID(environment);
                if (environmentTypeReference == null) {
                    this.context.errors.add({
                        severity: "CRITICAL",
                        message: `Environment ID ${environment} not found`
                    });
                    return [];
                }

                return [
                    ruby.keywordArgument({
                        name: "environment",
                        value: environmentTypeReference
                    })
                ];
            }
            if (this.context.isMultiEnvironmentValues(environment)) {
                this.context.errors.add({
                    severity: "CRITICAL",
                    message: "Multi-environment values are not supported in Ruby snippets yet"
                });
                return [];
            }
        }
        return [];
    }

    // Helper for auth arguments
    private getRootClientAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth;
        values: FernIr.dynamic.AuthValues;
    }): ruby.KeywordArgument[] {
        if (values.type !== auth.type) {
            this.addError(this.context.newAuthMismatchError({ auth, values }).message);
            return [];
        }

        switch (auth.type) {
            case "basic":
                return values.type === "basic" ? this.getRootClientBasicAuthArgs({ auth, values }) : [];
            case "bearer":
                return values.type === "bearer" ? this.getRootClientBearerAuthArgs({ auth, values }) : [];
            case "header":
                return values.type === "header" ? this.getRootClientHeaderAuthArgs({ auth, values }) : [];
            case "oauth":
                return values.type === "oauth" ? this.getRootClientOAuthArgs({ auth, values }) : [];
            case "inferred":
                this.addWarning("Ruby SDK does not support inferred auth yet");
                return [];
            default:
                assertNever(auth);
        }
    }

    private addError(message: string): void {
        this.context.errors.add({ severity: Severity.Critical, message });
    }

    private addWarning(message: string): void {
        this.context.errors.add({ severity: Severity.Warning, message });
    }

    private getRootClientBasicAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BasicAuth;
        values: FernIr.dynamic.BasicAuthValues;
    }): ruby.KeywordArgument[] {
        return [
            ruby.keywordArgument({
                name: auth.username.snakeCase.safeName,
                value: ruby.TypeLiteral.string(values.username)
            }),
            ruby.keywordArgument({
                name: auth.password.snakeCase.safeName,
                value: ruby.TypeLiteral.string(values.password)
            })
        ];
    }

    private getRootClientBearerAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BearerAuth;
        values: FernIr.dynamic.BearerAuthValues;
    }): ruby.KeywordArgument[] {
        return [
            ruby.keywordArgument({
                name: auth.token.snakeCase.safeName,
                value: ruby.TypeLiteral.string(values.token)
            })
        ];
    }

    private getRootClientHeaderAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.HeaderAuth;
        values: FernIr.dynamic.HeaderAuthValues;
    }): ruby.KeywordArgument[] {
        return [
            ruby.keywordArgument({
                name: auth.header.name.name.snakeCase.safeName,
                value: ruby.TypeLiteral.string(values.value as string)
            })
        ];
    }

    private getRootClientOAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.OAuth;
        values: FernIr.dynamic.OAuthValues;
    }): ruby.KeywordArgument[] {
        // OAuth client credentials
        return [
            ruby.keywordArgument({
                name: auth.clientId.snakeCase.safeName,
                value: ruby.TypeLiteral.string(values.clientId)
            }),
            ruby.keywordArgument({
                name: auth.clientSecret.snakeCase.safeName,
                value: ruby.TypeLiteral.string(values.clientSecret)
            })
        ];
    }

    // Helper for headers
    private getRootClientHeaderArgs({
        headers,
        values
    }: {
        headers: FernIr.dynamic.NamedParameter[];
        values: FernIr.dynamic.Values;
    }): ruby.KeywordArgument[] {
        const args: ruby.KeywordArgument[] = [];
        for (const header of headers) {
            const value = values[header.name.name.originalName];
            if (value != null && typeof value === "string") {
                args.push(
                    ruby.keywordArgument({
                        name: header.name.name.snakeCase.safeName,
                        value: ruby.TypeLiteral.string(value)
                    })
                );
            }
        }
        return args;
    }

    // Main builder
    private getRootClientBuilderArgs({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ruby.KeywordArgument[] {
        const builderArgs: ruby.KeywordArgument[] = [];

        // Auth
        if (endpoint.auth != null) {
            if (snippet.auth != null) {
                builderArgs.push(...this.getRootClientAuthArgs({ auth: endpoint.auth, values: snippet.auth }));
            } else {
                this.context.errors.add({
                    severity: "WARNING",
                    message: `Auth with ${endpoint.auth.type} configuration is required for this endpoint`
                });
            }
        }

        // Base URL / Environment
        const baseUrlArgs = this.getRootClientBaseUrlArg({
            baseUrl: snippet.baseURL,
            environment: snippet.environment
        });
        if (baseUrlArgs.length > 0) {
            builderArgs.push(...baseUrlArgs);
        }

        // Headers
        this.context.errors.scope("Headers");
        if (this.context.ir.headers != null && snippet.headers != null) {
            builderArgs.push(
                ...this.getRootClientHeaderArgs({ headers: this.context.ir.headers, values: snippet.headers })
            );
        }
        this.context.errors.unscope();

        return builderArgs;
    }

    private callMethod({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ruby.MethodInvocation {
        const invokeMethodArgs: ruby.MethodInvocation.Args = {
            on: ruby.codeblock(CLIENT_VAR_NAME),
            method: this.getMethod({ endpoint }),
            arguments_: []
        };

        switch (endpoint.request.type) {
            case "inlined":
                invokeMethodArgs.keywordArguments = this.getMethodArgsForInlinedRequest({
                    request: endpoint.request,
                    snippet
                });
                break;
            case "body":
                invokeMethodArgs.arguments_ = this.getMethodArgsForBodyRequest({
                    request: endpoint.request,
                    snippet
                });
                break;
            default:
                assertNever(endpoint.request);
        }

        return ruby.invokeMethod(invokeMethodArgs);
    }

    private getMethodArgsForInlinedRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ruby.KeywordArgument[] {
        const args: ruby.KeywordArgument[] = [];

        args.push(
            ...this.getNamedParameterArgs({
                kind: "PathParameters",
                namedParameters: request.pathParameters,
                values: snippet.pathParameters
            })
        );
        args.push(
            ...this.getNamedParameterArgs({
                kind: "QueryParameters",
                namedParameters: request.queryParameters,
                values: snippet.queryParameters
            })
        );
        args.push(
            ...this.getNamedParameterArgs({
                kind: "Headers",
                namedParameters: request.headers,
                values: snippet.headers
            })
        );

        // Handle request.body if present
        if (request.body != null) {
            switch (request.body.type) {
                case "properties":
                    args.push(...this.getMethodArgsForPropertiesRequest({ request: request.body, snippet }));
                    break;
                case "referenced":
                case "fileUpload":
                    // Not implemented for Ruby snippets yet
                    break;
                default:
                    assertNever(request.body);
            }
        }

        return args;
    }

    private getNamedParameterArgs({
        kind,
        namedParameters,
        values
    }: {
        kind: "PathParameters" | "QueryParameters" | "Headers";
        namedParameters: FernIr.dynamic.NamedParameter[] | undefined;
        values: Record<string, unknown> | undefined;
    }): ruby.KeywordArgument[] {
        const args: ruby.KeywordArgument[] = [];
        this.context.errors.scope(kind);
        if (namedParameters != null) {
            const associated = this.context.associateByWireValue({
                parameters: namedParameters,
                values: values ?? {},
                ignoreMissingParameters: true
            });
            for (const parameter of associated) {
                args.push(
                    ruby.keywordArgument({
                        name: this.context.getPropertyName(parameter.name.name),
                        value: this.context.dynamicTypeLiteralMapper.convert(parameter)
                    })
                );
            }
        }
        this.context.errors.unscope();
        return args;
    }

    private getMethodArgsForPropertiesRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.InlinedRequestBody.Properties;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ruby.KeywordArgument[] {
        const args: ruby.KeywordArgument[] = [];

        const bodyProperties = this.context.associateByWireValue({
            parameters: request.value,
            values: this.context.getRecord(snippet.requestBody) ?? {}
        });
        for (const parameter of bodyProperties) {
            args.push(
                ruby.keywordArgument({
                    name: this.context.getPropertyName(parameter.name.name),
                    value: this.context.dynamicTypeLiteralMapper.convert(parameter)
                })
            );
        }
        return args;
    }

    private getMethodArgsForBodyRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.BodyRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ruby.AstNode[] {
        const args: ruby.AstNode[] = [];

        // Add path parameters as positional arguments
        this.context.errors.scope("PathParameters");
        if (request.pathParameters != null) {
            const associated = this.context.associateByWireValue({
                parameters: request.pathParameters,
                values: snippet.pathParameters ?? {},
                ignoreMissingParameters: true
            });
            for (const parameter of associated) {
                args.push(
                    ruby.positionalArgument({
                        value: this.context.dynamicTypeLiteralMapper.convert(parameter)
                    })
                );
            }
        }
        this.context.errors.unscope();

        // Add body as a positional argument
        if (request.body != null) {
            switch (request.body.type) {
                case "bytes":
                    // Not supported in Ruby snippets yet
                    this.context.errors.add({
                        severity: "CRITICAL",
                        message: "Bytes request body is not supported in Ruby snippets yet"
                    });
                    break;
                case "typeReference":
                    args.push(
                        ruby.positionalArgument({
                            value: this.context.dynamicTypeLiteralMapper.convert({
                                typeReference: request.body.value,
                                value: this.context.getRecord(snippet.requestBody)
                            })
                        })
                    );
                    break;
                default:
                    assertNever(request.body);
            }
        }

        return args;
    }

    private getMethod({ endpoint }: { endpoint: FernIr.dynamic.Endpoint }): string {
        if (endpoint.declaration.fernFilepath.allParts.length > 0) {
            return `${endpoint.declaration.fernFilepath.allParts
                .map((val) => `${this.context.getMethodName(val)}`)
                .join(".")}.${this.context.getMethodName(endpoint.declaration.name)}`;
        }
        return this.context.getMethodName(endpoint.declaration.name);
    }
}
