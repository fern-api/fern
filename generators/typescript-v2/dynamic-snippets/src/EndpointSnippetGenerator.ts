import { Severity } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { ts } from "@fern-api/typescript-ast";
import { NpmPackage, constructNpmPackage, getNamespaceExport } from "@fern-api/typescript-browser-compatible-base";

import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";

const CLIENT_VAR_NAME = "client";

export class EndpointSnippetGenerator {
    private context: DynamicSnippetsGeneratorContext;
    private namespaceExport: string;
    private moduleName: string;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
        this.namespaceExport = getNamespaceExport({
            organization: this.context.config.organization,
            workspaceName: this.context.config.workspaceName,
            namespaceExport: this.context.customConfig?.namespaceExport
        });
        this.moduleName =
            constructNpmPackage({
                generatorConfig: context.config,
                isPackagePrivate: context.customConfig?.private ?? false
            })?.packageName ?? this.context.config.organization;
    }

    public async generateSnippet({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): Promise<string> {
        const code = this.buildCodeBlock({ endpoint, snippet: request });
        return await code.toString();
    }

    public generateSnippetSync({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): string {
        const code = this.buildCodeBlock({ endpoint, snippet: request });
        return code.toStringSync();
    }

    private buildCodeBlock({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ts.AstNode {
        return ts.codeblock((writer) => {
            writer.writeNode(this.constructClient({ endpoint, snippet }));
            writer.writeLine();
            writer.writeNode(this.callMethod({ endpoint, snippet }));
        });
    }

    private constructClient({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ts.AstNode {
        return ts.variable({
            name: CLIENT_VAR_NAME,
            const: true,
            initializer: ts.instantiateClass({
                class_: ts.reference({
                    name: this.namespaceExport,
                    importFrom: {
                        type: "named",
                        moduleName: this.moduleName
                    }
                }),
                arguments_: [this.getConstructorArgs({ endpoint, snippet })]
            })
        });
    }

    private callMethod({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ts.AstNode {
        return ts.invokeMethod({
            on: ts.reference({ name: CLIENT_VAR_NAME }),
            method: this.getMethod({ endpoint }),
            async: true,
            arguments_: [
                // TODO: Map method arguments!
            ]
        });
    }

    private getConstructorArgs({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ts.AstNode {
        const fields: ts.ObjectField[] = [];
        if (endpoint.auth != null) {
            if (snippet.auth != null) {
                fields.push(...this.getConstructorAuthArgs({ auth: endpoint.auth, values: snippet.auth }));
            } else {
                this.context.errors.add({
                    severity: Severity.Warning,
                    message: `Auth with ${endpoint.auth.type} configuration is required for this endpoint`
                });
            }
        }
        if (fields.length === 0) {
            return ts.TypeLiteral.nop();
        }
        return ts.TypeLiteral.object({ fields });
    }

    private getConstructorAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth;
        values: FernIr.dynamic.AuthValues;
    }): ts.ObjectField[] {
        switch (auth.type) {
            case "basic":
                if (values.type !== "basic") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                return this.getConstructorBasicAuthArg({ auth, values });
            case "bearer":
                if (values.type !== "bearer") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                return this.getConstructorBearerAuthArgs({ auth, values });
            case "header":
                if (values.type !== "header") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                return this.getConstructorHeaderAuthArgs({ auth, values });
        }
    }

    private getConstructorBasicAuthArg({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BasicAuth;
        values: FernIr.dynamic.BasicAuthValues;
    }): ts.ObjectField[] {
        return [
            {
                name: this.context.getPropertyName(auth.username),
                value: ts.TypeLiteral.string(values.username)
            },
            {
                name: this.context.getPropertyName(auth.password),
                value: ts.TypeLiteral.string(values.password)
            }
        ];
    }

    private getConstructorBearerAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BearerAuth;
        values: FernIr.dynamic.BearerAuthValues;
    }): ts.ObjectField[] {
        return [
            {
                name: this.context.getPropertyName(auth.token),
                value: ts.TypeLiteral.string(values.token)
            }
        ];
    }

    private getConstructorHeaderAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.HeaderAuth;
        values: FernIr.dynamic.HeaderAuthValues;
    }): ts.ObjectField[] {
        return [
            {
                name: this.context.getPropertyName(auth.header.name.name),
                value: ts.TypeLiteral.string("TODO: Implement me!")
            }
        ];
    }

    private getMethod({ endpoint }: { endpoint: FernIr.dynamic.Endpoint }): string {
        if (endpoint.declaration.fernFilepath.allParts.length > 0) {
            return `${endpoint.declaration.fernFilepath.allParts
                .map((val) => this.context.getMethodName(val))
                .join(".")}.${this.context.getMethodName(endpoint.declaration.name)}`;
        }
        return this.context.getMethodName(endpoint.declaration.name);
    }
}
