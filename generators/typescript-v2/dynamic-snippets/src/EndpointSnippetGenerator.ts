import { Scope, Severity } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { ts } from "@fern-api/typescript-ast";

import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";

const CLIENT_VAR_NAME = "client";
const STRING_TYPE_REFERENCE: FernIr.dynamic.TypeReference = {
    type: "primitive",
    value: "STRING"
};

export class EndpointSnippetGenerator {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
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
                    name: this.context.getRootClientName(),
                    importFrom: this.context.getModuleImport()
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
        const environmentArgs = this.getConstructorEnvironmentArgs({
            baseUrl: snippet.baseURL,
            environment: snippet.environment
        });
        if (environmentArgs.length > 0) {
            fields.push(...environmentArgs);
        }
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
        this.context.errors.scope(Scope.Headers);
        if (this.context.ir.headers != null && snippet.headers != null) {
            fields.push(
                ...this.getConstructorHeaderArgs({ headers: this.context.ir.headers, values: snippet.headers })
            );
        }
        this.context.errors.unscope();
        if (fields.length === 0) {
            return ts.TypeLiteral.nop();
        }
        return ts.TypeLiteral.object({ fields });
    }

    private getConstructorEnvironmentArgs({
        baseUrl,
        environment
    }: {
        baseUrl: string | undefined;
        environment: FernIr.dynamic.EnvironmentValues | undefined;
    }): ts.ObjectField[] {
        const environmentValue = this.getEnvironmentValue({ baseUrl, environment });
        if (environmentValue == null) {
            return [];
        }
        return [
            {
                name: "environment",
                value: environmentValue
            }
        ];
    }

    private getEnvironmentValue({
        baseUrl,
        environment
    }: {
        baseUrl: string | undefined;
        environment: FernIr.dynamic.EnvironmentValues | undefined;
    }): ts.TypeLiteral | undefined {
        if (baseUrl != null && environment != null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Cannot specify both baseUrl and environment options"
            });
            return undefined;
        }
        if (baseUrl != null) {
            return ts.TypeLiteral.string(baseUrl);
        }
        if (environment != null) {
            if (this.context.isSingleEnvironmentID(environment)) {
                const environmentTypeReference = this.context.getEnvironmentTypeReferenceFromID(environment);
                if (environmentTypeReference == null) {
                    this.context.errors.add({
                        severity: Severity.Warning,
                        message: `Environment ${JSON.stringify(environment)} was not found`
                    });
                    return undefined;
                }
                return ts.TypeLiteral.reference(environmentTypeReference);
            }
            if (this.context.isMultiEnvironmentValues(environment)) {
                if (!this.context.validateMultiEnvironmentUrlValues(environment)) {
                    return undefined;
                }
                return ts.TypeLiteral.object({
                    fields: Object.entries(environment).map(([key, value]) => ({
                        name: key,
                        value: this.context.dynamicTypeLiteralMapper.convert({
                            typeReference: STRING_TYPE_REFERENCE,
                            value
                        })
                    }))
                });
            }
        }
        return undefined;
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
                value: this.context.dynamicTypeLiteralMapper.convert({
                    typeReference: auth.header.typeReference,
                    value: values.value
                })
            }
        ];
    }

    private getConstructorHeaderArgs({
        headers,
        values
    }: {
        headers: FernIr.dynamic.NamedParameter[];
        values: FernIr.dynamic.Values;
    }): ts.ObjectField[] {
        const fields: ts.ObjectField[] = [];
        for (const header of headers) {
            const field = this.getConstructorHeaderArg({ header, value: values.value });
            if (field != null) {
                fields.push(field);
            }
        }
        return fields;
    }

    private getConstructorHeaderArg({
        header,
        value
    }: {
        header: FernIr.dynamic.NamedParameter;
        value: unknown;
    }): ts.ObjectField | undefined {
        const typeLiteral = this.context.dynamicTypeLiteralMapper.convert({
            typeReference: header.typeReference,
            value
        });
        if (ts.TypeLiteral.isNop(typeLiteral)) {
            // Literal header values (e.g. "X-API-Version") should not be included in the
            // client constructor.
            return undefined;
        }
        return {
            name: this.context.getPropertyName(header.name.name),
            value: typeLiteral
        };
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
