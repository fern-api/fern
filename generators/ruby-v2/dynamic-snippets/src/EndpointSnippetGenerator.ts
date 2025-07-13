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
                arguments_: [],
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
    }): { name: string; value: string } | undefined {
        if (baseUrl != null && environment != null) {
            this.context.errors.add({
                severity: "CRITICAL",
                message: "Cannot specify both baseUrl and environment options"
            });
            return undefined;
        }
        if (baseUrl != null) {
            // Most Ruby SDKs accept a base_url or similar param
            return {
                name: "base_url",
                value: baseUrl
            };
        }
        if (environment != null) {
            // If environment is a single string, use it directly
            if (typeof environment === "string") {
                return {
                    name: "environment",
                    value: environment
                };
            }
            // If environment is an object, try to serialize as needed
            // (This is a placeholder; real logic may depend on SDK)
            return {
                name: "environment",
                value: JSON.stringify(environment)
            };
        }
        return undefined;
    }

    // Helper for auth arguments
    private getRootClientAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth;
        values: FernIr.dynamic.AuthValues;
    }): { name: string; value: string }[] {
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
    }): { name: string; value: string }[] {
        // Ruby SDKs rarely use basic auth at client construction, but if so:
        return [
            { name: "username", value: values.username },
            { name: "password", value: values.password }
        ];
    }

    private getRootClientBearerAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BearerAuth;
        values: FernIr.dynamic.BearerAuthValues;
    }): { name: string; value: string }[] {
        // Most Ruby SDKs use "access_token" or "token"
        return [
            { name: "access_token", value: values.token }
        ];
    }

    private getRootClientHeaderAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.HeaderAuth;
        values: FernIr.dynamic.HeaderAuthValues;
    }): { name: string; value: string }[] {
        // Custom header auth, e.g. X-API-KEY
        return [
            { name: auth.header.name.name.snakeCase.safeName, value: values.value as any }
        ];
    }

    private getRootClientOAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.OAuth;
        values: FernIr.dynamic.OAuthValues;
    }): { name: string; value: string }[] {
        // OAuth client credentials
        return [
            { name: "client_id", value: values.clientId },
            { name: "client_secret", value: values.clientSecret }
        ];
    }

    // Helper for headers
    private getRootClientHeaderArgs({
        headers,
        values
    }: {
        headers: FernIr.dynamic.NamedParameter[];
        values: FernIr.dynamic.Values;
    }): { name: string; value: string }[] {
        const args: { name: string; value: string }[] = [];
        for (const header of headers) {
            const value = (values as any)[header.name.name.originalName];
            if (value != null) {
                args.push({
                    name: header.name.name.snakeCase.safeName,
                    value: value
                });
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
    }): { name: string; value: string }[] {
        const builderArgs: { name: string; value: string }[] = [];

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
        const baseUrlArg = this.getRootClientBaseUrlArg({
            baseUrl: snippet.baseURL,
            environment: snippet.environment
        });
        if (baseUrlArg != null) {
            builderArgs.push(baseUrlArg);
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
