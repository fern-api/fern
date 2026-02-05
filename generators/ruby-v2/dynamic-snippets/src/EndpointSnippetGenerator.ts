import { AbstractFormatter, Options, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { ruby } from "@fern-api/ruby-ast";

import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";

const CLIENT_VAR_NAME = "client";
const INSTANCE_CLIENT_VAR_NAME = "@client";

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

    public async generateSnippetAst({
        endpoint,
        request,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
        options?: Options;
    }): Promise<ruby.AstNode> {
        if (options?.skipClientInstantiation) {
            return this.buildCodeBlockWithoutClient({ endpoint, snippet: request });
        }
        return this.buildCodeBlock({ endpoint, snippet: request });
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

    /**
     * Builds a code block without client instantiation.
     * Used for wire tests where the client is already instantiated in the test setup.
     */
    private buildCodeBlockWithoutClient({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ruby.AstNode {
        return ruby.codeblock((writer) => {
            writer.writeNodeStatement(this.callMethodOnExistingClient({ endpoint, snippet }));
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
                // Inferred auth parameters are handled by the root client constructor
                // (e.g., client_id, client_secret from the token endpoint request)
                // No additional auth arguments needed here
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
                // Ruby SDK methods use keyword arguments (via **params), not positional arguments
                invokeMethodArgs.keywordArguments = this.getMethodArgsForBodyRequest({
                    request: endpoint.request,
                    snippet
                });
                break;
            default:
                assertNever(endpoint.request);
        }

        // Add request_options with additional_headers for unmapped headers (e.g., X-Test-Id)
        const requestOptions = this.getRequestOptions({ endpoint, snippet });
        if (requestOptions != null) {
            invokeMethodArgs.keywordArguments = invokeMethodArgs.keywordArguments ?? [];
            invokeMethodArgs.keywordArguments.push(requestOptions);
        }

        return ruby.invokeMethod(invokeMethodArgs);
    }

    /**
     * Calls a method on an existing client instance variable (@client).
     * Used for wire tests where the client is already instantiated in the test setup.
     */
    private callMethodOnExistingClient({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ruby.MethodInvocation {
        const invokeMethodArgs: ruby.MethodInvocation.Args = {
            on: ruby.codeblock(INSTANCE_CLIENT_VAR_NAME),
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
                invokeMethodArgs.keywordArguments = this.getMethodArgsForBodyRequest({
                    request: endpoint.request,
                    snippet
                });
                break;
            default:
                assertNever(endpoint.request);
        }

        // Add request_options with additional_headers for unmapped headers (e.g., X-Test-Id)
        const requestOptions = this.getRequestOptions({ endpoint, snippet });
        if (requestOptions != null) {
            invokeMethodArgs.keywordArguments = invokeMethodArgs.keywordArguments ?? [];
            invokeMethodArgs.keywordArguments.push(requestOptions);
        }

        return ruby.invokeMethod(invokeMethodArgs);
    }

    /**
     * Builds request_options from snippet headers for per-request options.
     * This is used when generating snippets for wire tests where headers like X-Test-Id
     * should be passed as request_options[:additional_headers] rather than as method parameters.
     * Only includes headers that are NOT already mapped to the request directly (i.e., not defined in the IR).
     */
    private getRequestOptions({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ruby.KeywordArgument | undefined {
        const headers = snippet.headers ?? {};
        const entries = Object.entries(headers);
        if (entries.length === 0) {
            return undefined;
        }

        // Build a set of header names that are already mapped to the request directly
        const mappedHeaderNames = new Set<string>();

        // Add global headers from IR
        if (this.context.ir.headers != null) {
            for (const header of this.context.ir.headers) {
                mappedHeaderNames.add(header.name.wireValue.toLowerCase());
            }
        }

        // Add endpoint-level headers from inlined request
        if (endpoint.request.type === "inlined" && endpoint.request.headers != null) {
            for (const header of endpoint.request.headers) {
                mappedHeaderNames.add(header.name.wireValue.toLowerCase());
            }
        }

        // Filter out headers that are already mapped to the request
        const unmappedEntries = entries.filter(([name]) => !mappedHeaderNames.has(name.toLowerCase()));
        if (unmappedEntries.length === 0) {
            return undefined;
        }

        // Build request_options: { additional_headers: { "X-Test-Id" => "value" } }
        const additionalHeadersEntries = unmappedEntries.map(([name, value]) => ({
            key: ruby.TypeLiteral.string(name),
            value: ruby.TypeLiteral.string(String(value))
        }));

        return ruby.keywordArgument({
            name: "request_options",
            value: ruby.TypeLiteral.hash([
                {
                    key: ruby.TypeLiteral.string("additional_headers"),
                    value: ruby.TypeLiteral.hash(additionalHeadersEntries)
                }
            ])
        });
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
        if (request.body != null && snippet.requestBody != null) {
            switch (request.body.type) {
                case "properties":
                    args.push(...this.getMethodArgsForPropertiesRequest({ request: request.body, snippet }));
                    break;
                case "referenced": {
                    // Handle referenced body types (like BillOutData)
                    const bodyType = request.body.bodyType;
                    if (bodyType.type === "typeReference") {
                        const typeRef = bodyType.value;
                        if (typeRef.type === "named") {
                            const namedType = this.context.resolveNamedType({ typeId: typeRef.value });
                            if (namedType != null && namedType.type === "object") {
                                // For objects, flatten the body fields into keyword arguments
                                const bodyRecord = this.context.getRecord(snippet.requestBody);
                                if (bodyRecord != null) {
                                    const bodyFields = this.getBodyFieldsAsKeywordArgs({
                                        namedType,
                                        bodyRecord
                                    });
                                    args.push(...bodyFields);
                                }
                            } else if (namedType != null) {
                                // For non-object named types, convert and pass as single argument
                                const bodyArgs = this.getBodyArgsForNonObjectType({
                                    namedType,
                                    typeRef,
                                    bodyValue: snippet.requestBody
                                });
                                args.push(...bodyArgs);
                            }
                        } else {
                            // For non-named type references, convert directly
                            const convertedValue = this.context.dynamicTypeLiteralMapper.convert({
                                typeReference: typeRef,
                                value: snippet.requestBody
                            });
                            if (!ruby.TypeLiteral.isNop(convertedValue)) {
                                args.push(
                                    ruby.keywordArgument({
                                        name: request.body.bodyKey.snakeCase.safeName,
                                        value: convertedValue
                                    })
                                );
                            }
                        }
                    }
                    break;
                }
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
                const value = this.context.dynamicTypeLiteralMapper.convert(parameter);
                // Skip nop values (undefined/null) to avoid generating empty arguments like "channel: ,"
                if (ruby.TypeLiteral.isNop(value)) {
                    continue;
                }
                args.push(
                    ruby.keywordArgument({
                        name: this.context.getPropertyName(parameter.name.name),
                        value
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
            const value = this.context.dynamicTypeLiteralMapper.convert(parameter);
            // Skip nop values (undefined/null) to avoid generating empty arguments like "channel: ,"
            if (ruby.TypeLiteral.isNop(value)) {
                continue;
            }
            args.push(
                ruby.keywordArgument({
                    name: this.context.getPropertyName(parameter.name.name),
                    value
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
    }): ruby.KeywordArgument[] {
        const args: ruby.KeywordArgument[] = [];

        // Add path parameters as keyword arguments (Ruby SDK uses **params)
        args.push(
            ...this.getNamedParameterArgs({
                kind: "PathParameters",
                namedParameters: request.pathParameters,
                values: snippet.pathParameters
            })
        );

        // Add body fields as keyword arguments
        if (request.body != null && snippet.requestBody != null) {
            switch (request.body.type) {
                case "bytes":
                    // Not supported in Ruby snippets yet
                    this.context.errors.add({
                        severity: "CRITICAL",
                        message: "Bytes request body is not supported in Ruby snippets yet"
                    });
                    break;
                case "typeReference": {
                    const typeRef = request.body.value;

                    // Check if this is a named type that we can resolve
                    if (typeRef.type === "named") {
                        const namedType = this.context.resolveNamedType({ typeId: typeRef.value });
                        if (namedType != null && namedType.type === "object") {
                            // For objects, flatten the body fields into keyword arguments
                            const bodyRecord = this.context.getRecord(snippet.requestBody);
                            if (bodyRecord != null) {
                                const bodyFields = this.getBodyFieldsAsKeywordArgs({
                                    namedType,
                                    bodyRecord
                                });
                                args.push(...bodyFields);
                            }
                        } else if (namedType != null) {
                            // For non-object named types (undiscriminated unions, aliases, etc.),
                            // convert the entire body value and pass as a single 'request' keyword argument
                            const bodyArgs = this.getBodyArgsForNonObjectType({
                                namedType,
                                typeRef,
                                bodyValue: snippet.requestBody
                            });
                            args.push(...bodyArgs);
                        }
                    } else {
                        // For non-named type references (containers, primitives, etc.),
                        // convert the body value directly
                        const convertedValue = this.context.dynamicTypeLiteralMapper.convert({
                            typeReference: typeRef,
                            value: snippet.requestBody
                        });
                        if (!ruby.TypeLiteral.isNop(convertedValue)) {
                            args.push(
                                ruby.keywordArgument({
                                    name: "request",
                                    value: convertedValue
                                })
                            );
                        }
                    }
                    break;
                }
                default:
                    assertNever(request.body);
            }
        }

        return args;
    }

    private getBodyArgsForNonObjectType({
        namedType,
        typeRef,
        bodyValue
    }: {
        namedType: FernIr.dynamic.NamedType;
        typeRef: FernIr.dynamic.TypeReference;
        bodyValue: unknown;
    }): ruby.KeywordArgument[] {
        const args: ruby.KeywordArgument[] = [];

        switch (namedType.type) {
            case "undiscriminatedUnion": {
                // For undiscriminated unions, the body value should match one of the variants
                // Try to convert it and extract the fields as keyword arguments
                const bodyRecord = this.context.getRecord(bodyValue);
                if (bodyRecord != null) {
                    // The body is an object - try to find a matching variant and extract its fields
                    for (const variant of namedType.types) {
                        if (variant.type === "named") {
                            const variantType = this.context.resolveNamedType({ typeId: variant.value });
                            if (variantType != null && variantType.type === "object") {
                                // Check if the body matches this variant's properties
                                const variantProps = new Set(variantType.properties.map((p) => p.name.wireValue));
                                const bodyKeys = Object.keys(bodyRecord);
                                const allKeysMatch = bodyKeys.every((key) => variantProps.has(key));
                                if (allKeysMatch && bodyKeys.length > 0) {
                                    // This variant matches - flatten its fields
                                    const bodyFields = this.getBodyFieldsAsKeywordArgs({
                                        namedType: variantType,
                                        bodyRecord
                                    });
                                    args.push(...bodyFields);
                                    return args;
                                }
                            }
                        }
                    }
                }
                // If we couldn't match a variant or extract fields, convert the whole value
                const convertedValue = this.context.dynamicTypeLiteralMapper.convert({
                    typeReference: typeRef,
                    value: bodyValue
                });
                if (!ruby.TypeLiteral.isNop(convertedValue)) {
                    args.push(
                        ruby.keywordArgument({
                            name: "request",
                            value: convertedValue
                        })
                    );
                }
                break;
            }
            case "alias": {
                // For aliases, check if the underlying type is an object we can flatten
                const aliasedType = namedType.typeReference;
                if (aliasedType.type === "named") {
                    const resolvedAliasType = this.context.resolveNamedType({ typeId: aliasedType.value });
                    if (resolvedAliasType != null && resolvedAliasType.type === "object") {
                        const bodyRecord = this.context.getRecord(bodyValue);
                        if (bodyRecord != null) {
                            const bodyFields = this.getBodyFieldsAsKeywordArgs({
                                namedType: resolvedAliasType,
                                bodyRecord
                            });
                            args.push(...bodyFields);
                            return args;
                        }
                    }
                }
                // For non-object aliases (arrays, primitives, etc.), convert the whole value
                const convertedValue = this.context.dynamicTypeLiteralMapper.convert({
                    typeReference: typeRef,
                    value: bodyValue
                });
                if (!ruby.TypeLiteral.isNop(convertedValue)) {
                    args.push(
                        ruby.keywordArgument({
                            name: "request",
                            value: convertedValue
                        })
                    );
                }
                break;
            }
            case "discriminatedUnion":
            case "enum": {
                // For discriminated unions and enums, convert the whole value
                const convertedValue = this.context.dynamicTypeLiteralMapper.convert({
                    typeReference: typeRef,
                    value: bodyValue
                });
                if (!ruby.TypeLiteral.isNop(convertedValue)) {
                    args.push(
                        ruby.keywordArgument({
                            name: "request",
                            value: convertedValue
                        })
                    );
                }
                break;
            }
            case "object":
                // This shouldn't happen as objects are handled separately
                break;
            default:
                assertNever(namedType);
        }

        return args;
    }

    private getBodyFieldsAsKeywordArgs({
        namedType,
        bodyRecord
    }: {
        namedType: FernIr.dynamic.NamedType;
        bodyRecord: Record<string, unknown>;
    }): ruby.KeywordArgument[] {
        const args: ruby.KeywordArgument[] = [];

        // Handle different type shapes
        switch (namedType.type) {
            case "object": {
                // For objects, convert each property to a keyword argument
                for (const property of namedType.properties) {
                    const wireValue = property.name.wireValue;
                    const value = bodyRecord[wireValue];
                    if (value !== undefined) {
                        // Scope errors to the property name for better error messages
                        this.context.errors.scope(wireValue);
                        const convertedValue = this.context.dynamicTypeLiteralMapper.convert({
                            typeReference: property.typeReference,
                            value
                        });
                        this.context.errors.unscope();
                        if (!ruby.TypeLiteral.isNop(convertedValue)) {
                            args.push(
                                ruby.keywordArgument({
                                    name: this.context.getPropertyName(property.name.name),
                                    value: convertedValue
                                })
                            );
                        }
                    }
                }
                break;
            }
            case "alias":
            case "discriminatedUnion":
            case "undiscriminatedUnion":
            case "enum":
                // For these types, we can't easily flatten to keyword args
                // Fall back to passing the whole body as-is (this may need refinement)
                break;
            default:
                assertNever(namedType);
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
