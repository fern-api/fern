import { AbstractFormatter } from "@fern-api/browser-compatible-base-generator";
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
        snippet,
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ruby.AstNode {
        // In Ruby, concise and full styles are the same
        return ruby.codeblock((writer) => {
            writer.writeNodeStatement(this.constructClient({ endpoint, snippet }));
            writer.newLine();
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
            writer.addRequire(this.context.getRootModuleName());

            const clientClassRef = this.context.getRootClientClassReference();
            const builderArgs = this.getRootClientBuilderArgs({ endpoint, snippet });
    
            writer.write(`${CLIENT_VAR_NAME} = `);
            writer.writeNode(ruby.instantiateClass({
                classReference: clientClassRef,
                arguments_: builderArgs,
            }));
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
                    value: ruby.codeblock(baseUrl)
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
        switch (auth.type) {
            case "basic":
                if (values.type !== "basic") {
                    this.context.errors.add({
                        severity: "CRITICAL",
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                return this.getRootClientBasicAuthArgs({ auth, values });
            case "bearer":
                if (values.type !== "bearer") {
                    this.context.errors.add({
                        severity: "CRITICAL",
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                return this.getRootClientBearerAuthArgs({ auth, values });
            case "header":
                if (values.type !== "header") {
                    this.context.errors.add({
                        severity: "CRITICAL",
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                return this.getRootClientHeaderAuthArgs({ auth, values });
            case "oauth":
                if (values.type !== "oauth") {
                    this.context.errors.add({
                        severity: "CRITICAL",
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                return this.getRootClientOAuthArgs({ auth, values });
            default:
                // Should never happen
                return [];
        }
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
                name: "username",
                value: ruby.codeblock(values.username)
            }),
            ruby.keywordArgument({
                name: "password",
                value: ruby.codeblock(values.password)
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
                name: "access_token",
                value: ruby.codeblock(values.token)
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
                value: ruby.codeblock(values.value as string)
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
                name: "client_id",
                value: ruby.codeblock(values.clientId)
            }),
            ruby.keywordArgument({
                name: "client_secret",
                value: ruby.codeblock(values.clientSecret)
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
            const value = (values as any)[header.name.name.originalName];
            if (value != null) {
                args.push(
                    ruby.keywordArgument({
                        name: header.name.name.snakeCase.safeName,
                        value: ruby.codeblock(value)
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
}
