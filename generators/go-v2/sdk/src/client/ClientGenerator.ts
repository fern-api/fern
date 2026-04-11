import { NameInput } from "@fern-api/base-generator";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { FileGenerator, GoFile } from "@fern-api/go-base";
import { FernIr } from "@fern-fern/ir-sdk";

import {
    getInferredAuthCredentialParams,
    getInferredAuthScheme,
    getOAuthClientCredentialsScheme,
    getRequestPropertyFieldName,
    isRequestPropertyOptional,
    isTypeReferenceOptional,
    resolveTokenEndpointBodyProperties
} from "../authUtils.js";
import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export declare namespace ClientGenerator {
    interface Args {
        context: SdkGeneratorContext;
        isRootClient?: boolean;
        fernFilepath: FernIr.FernFilepath;
        subpackage: FernIr.Subpackage | undefined;
        nestedSubpackages: FernIr.SubpackageId[];
        serviceId: FernIr.ServiceId | undefined;
        service: FernIr.HttpService | undefined;
    }
}

export class ClientGenerator extends FileGenerator<GoFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private isRootClient: boolean = false;
    private fernFilepath: FernIr.FernFilepath;
    private nestedSubpackages: FernIr.SubpackageId[] = [];
    private subpackage: FernIr.Subpackage | undefined;
    private serviceId: FernIr.ServiceId | undefined;
    private service: FernIr.HttpService | undefined;

    constructor({
        fernFilepath,
        isRootClient = false,
        subpackage,
        nestedSubpackages,
        context,
        serviceId,
        service
    }: ClientGenerator.Args) {
        super(context);
        this.isRootClient = isRootClient;
        this.fernFilepath = fernFilepath;
        this.subpackage = subpackage;
        this.nestedSubpackages = nestedSubpackages;
        this.serviceId = serviceId;
        this.service = service;
    }

    public doGenerate(): GoFile {
        const struct = go.struct({
            ...this.context.getClientClassReference({
                fernFilepath: this.fernFilepath,
                subpackage: this.subpackage
            })
        });

        struct.addConstructor(this.getConstructor());

        struct.addField(
            go.field({
                name: "options",
                type: this.context.getRequestOptionsType()
            })
        );

        if (this.serviceId != null && this.service != null) {
            for (const endpoint of this.service.endpoints) {
                const method = this.context.endpointGenerator.generate({
                    serviceId: this.serviceId,
                    service: this.service,
                    subpackage: this.subpackage,
                    endpoint
                });
                if (method != null) {
                    struct.addMethod(method);
                }
            }
            if (this.service.endpoints.length > 0) {
                struct.addField(
                    go.field({
                        name: "WithRawResponse",
                        type: go.Type.pointer(
                            go.Type.reference(
                                this.context.getRawClientClassReference({
                                    fernFilepath: this.service.name.fernFilepath,
                                    subpackage: this.subpackage
                                })
                            )
                        )
                    })
                );
            }
        }

        for (const subpackageId of this.nestedSubpackages) {
            const subpackage = this.context.getSubpackageOrThrow(subpackageId);
            if (!this.context.shouldGenerateSubpackageClient(subpackage)) {
                continue;
            }
            struct.addField(
                go.field({
                    name: this.context.getClassName(subpackage.name),
                    type: go.Type.pointer(
                        go.Type.reference(
                            this.context.getClientClassReference({ fernFilepath: subpackage.fernFilepath, subpackage })
                        )
                    )
                })
            );
        }

        struct.addField(
            go.field({
                name: "baseURL",
                type: go.Type.string()
            }),
            this.context.caller.getField()
        );

        return new GoFile({
            node: struct,
            rootImportPath: this.context.getRootImportPath(),
            packageName: this.getPackageName(),
            importPath: this.getImportPath(),
            directory: this.getDirectory(),
            filename: this.context.getClientFilename(this.subpackage),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.getDirectory(), RelativeFilePath.of(this.context.getClientFilename(this.subpackage)));
    }

    private getConstructor(): go.Struct.Constructor {
        const fields: go.StructField[] = [];
        for (const subpackageId of this.nestedSubpackages) {
            const subpackage = this.context.getSubpackageOrThrow(subpackageId);
            if (!this.context.shouldGenerateSubpackageClient(subpackage)) {
                continue;
            }
            fields.push({
                name: this.context.getClassName(subpackage.name),
                value: this.instantiateSubClient({ subpackage })
            });
        }
        if (this.service != null && this.service.endpoints.length > 0) {
            fields.push({
                name: "WithRawResponse",
                value: this.instantiateRawClient()
            });
        }
        fields.push(
            {
                name: "options",
                value: go.TypeInstantiation.reference(go.codeblock("options"))
            },
            {
                name: "baseURL",
                value: go.TypeInstantiation.reference(
                    go.selector({
                        on: go.codeblock("options"),
                        selector: go.codeblock("BaseURL")
                    })
                )
            },
            {
                name: "caller",
                value: go.TypeInstantiation.reference(
                    this.context.caller.instantiate({
                        client: go.TypeInstantiation.reference(
                            go.selector({
                                on: go.codeblock("options"),
                                selector: go.codeblock("HTTPClient")
                            })
                        ),
                        maxAttempts: go.TypeInstantiation.reference(
                            go.selector({
                                on: go.codeblock("options"),
                                selector: go.codeblock("MaxAttempts")
                            })
                        )
                    })
                )
            }
        );
        return {
            name: this.context.getClientConstructorName(this.subpackage),
            parameters: [
                this.isRootClient
                    ? this.context.getVariadicRequestOptionParameter()
                    : this.context.getRequestOptionsParameter()
            ],
            body: go.codeblock((writer) => {
                if (this.isRootClient) {
                    writer.write("options := ");
                    writer.writeNode(this.context.callNewRequestOptions(go.codeblock("opts...")));
                    writer.newLine();
                }
                this.writeEnvironmentVariables({ writer });
                writer.write("return ");
                writer.writeNode(
                    go.TypeInstantiation.structPointer({
                        typeReference: this.context.getClientClassReference({
                            fernFilepath: this.fernFilepath,
                            subpackage: this.subpackage
                        }),
                        fields
                    })
                );
            })
        };
    }

    private writeEnvironmentVariables({ writer }: { writer: go.Writer }): void {
        this.writeAuthEnvironmentVariables({ writer });
        this.writeHeaderEnvironmentVariables({ writer });
        if (this.isRootClient) {
            this.writeOAuthTokenFetching({ writer });
            this.writeInferredAuthTokenFetching({ writer });
        }
    }

    private writeHeaderEnvironmentVariables({ writer }: { writer: go.Writer }): void {
        for (const header of this.context.ir.headers) {
            if (header.env == null) {
                continue;
            }
            this.writeEnvConditional({
                writer,
                propertyReference: this.getOptionsPropertyReference(header.name),
                env: header.env
            });
        }
    }

    private writeAuthEnvironmentVariables({ writer }: { writer: go.Writer }): void {
        if (this.context.ir.auth == null) {
            return;
        }
        for (const scheme of this.context.ir.auth.schemes) {
            switch (scheme.type) {
                case "basic":
                    this.writeBasicAuthEnvironmentVariables({ writer, scheme });
                    break;
                case "bearer":
                    this.writeBearerAuthEnvironmentVariables({ writer, scheme });
                    break;
                case "header":
                    this.writeHeaderAuthEnvironmentVariables({ writer, scheme });
                    break;
                case "oauth":
                    this.writeOAuthEnvironmentVariables({ writer, scheme });
                    break;
                case "inferred":
                    this.writeInferredAuthEnvironmentVariables({ writer });
                    break;
            }
        }
    }

    private writeBasicAuthEnvironmentVariables({
        writer,
        scheme
    }: {
        writer: go.Writer;
        scheme: FernIr.BasicAuthScheme;
    }): void {
        if (scheme.usernameEnvVar != null) {
            this.writeEnvConditional({
                writer,
                propertyReference: this.getOptionsPropertyReference(scheme.username),
                env: scheme.usernameEnvVar
            });
        }
        if (scheme.passwordEnvVar != null) {
            this.writeEnvConditional({
                writer,
                propertyReference: this.getOptionsPropertyReference(scheme.password),
                env: scheme.passwordEnvVar
            });
        }
    }

    private writeBearerAuthEnvironmentVariables({
        writer,
        scheme
    }: {
        writer: go.Writer;
        scheme: FernIr.BearerAuthScheme;
    }): void {
        if (scheme.tokenEnvVar != null) {
            this.writeEnvConditional({
                writer,
                propertyReference: this.getOptionsPropertyReference(scheme.token),
                env: scheme.tokenEnvVar
            });
        }
    }

    private writeHeaderAuthEnvironmentVariables({
        writer,
        scheme
    }: {
        writer: go.Writer;
        scheme: FernIr.HeaderAuthScheme;
    }): void {
        if (scheme.headerEnvVar != null) {
            this.writeEnvConditional({
                writer,
                propertyReference: this.getOptionsPropertyReference(scheme.name),
                env: scheme.headerEnvVar
            });
        }
    }

    private writeOAuthEnvironmentVariables({
        writer,
        scheme
    }: {
        writer: go.Writer;
        scheme: FernIr.OAuthScheme;
    }): void {
        const configuration = scheme.configuration;
        if (configuration == null || configuration.type !== "clientCredentials") {
            return;
        }
        if (configuration.clientIdEnvVar != null) {
            this.writeEnvConditional({
                writer,
                propertyReference: go.selector({ on: go.codeblock("options"), selector: go.codeblock("ClientID") }),
                env: configuration.clientIdEnvVar
            });
        }
        if (configuration.clientSecretEnvVar != null) {
            this.writeEnvConditional({
                writer,
                propertyReference: go.selector({ on: go.codeblock("options"), selector: go.codeblock("ClientSecret") }),
                env: configuration.clientSecretEnvVar
            });
        }
    }

    private writeOAuthTokenFetching({ writer }: { writer: go.Writer }): void {
        const oauthScheme = getOAuthClientCredentialsScheme(this.context.ir);
        if (oauthScheme == null || oauthScheme.configuration?.type !== "clientCredentials") {
            return;
        }

        const authServiceFernFilepath = this.getAuthServiceFernFilepath();
        if (authServiceFernFilepath == null) {
            return;
        }

        // Get the token endpoint from the IR
        const tokenEndpoint = this.getOAuthTokenEndpoint();
        if (tokenEndpoint == null) {
            return;
        }

        // If inferred auth is also configured, only generate the shared authOptions/authClient
        // setup here. The inferred auth block will handle SetTokenGetter, matching the Java
        // behavior where inferred auth takes precedence in the default construction path.
        const hasInferredAuth = getInferredAuthScheme(this.context.ir) != null;
        if (hasInferredAuth) {
            writer.writeNode(
                go.codeblock((w) => {
                    // Clone options for the auth client to avoid infinite recursion
                    w.writeLine("authOptions := *options");

                    // Create the auth client (shared between OAuth and inferred auth)
                    const authClientImportPath = this.context.getClientFileLocation({
                        fernFilepath: authServiceFernFilepath,
                        subpackage: undefined
                    }).importPath;
                    w.write("authClient := ");
                    w.writeNode(
                        go.invokeFunc({
                            func: go.typeReference({
                                name: "NewClient",
                                importPath: authClientImportPath
                            }),
                            arguments_: [go.codeblock("&authOptions")]
                        })
                    );
                    w.newLine();
                })
            );
            return;
        }

        // Get the method name from the endpoint
        const methodName = this.context.getMethodName(tokenEndpoint.name);

        // Get the request field names from the IR
        const requestProperties = oauthScheme.configuration.tokenEndpoint.requestProperties;
        const clientIdFieldName = getRequestPropertyFieldName(this.context, requestProperties.clientId);
        const clientSecretFieldName = getRequestPropertyFieldName(this.context, requestProperties.clientSecret);

        // Create the token provider for OAuth (defaultExpirySeconds=0 means tokens without expiry never auto-refresh)
        writer.writeNode(
            go.codeblock((w) => {
                w.write("oauthTokenProvider := ");
                w.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "NewTokenProvider",
                            importPath: this.context.getCoreImportPath()
                        }),
                        arguments_: [go.codeblock("0")]
                    })
                );
                w.newLine();

                // Clone options for the auth client to avoid infinite recursion
                // This is done before SetTokenGetter so authOptions won't have the token getter
                w.writeLine("authOptions := *options");

                // Create the auth client
                const authClientImportPath = this.context.getClientFileLocation({
                    fernFilepath: authServiceFernFilepath,
                    subpackage: undefined
                }).importPath;
                w.write("authClient := ");
                w.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "NewClient",
                            importPath: authClientImportPath
                        }),
                        arguments_: [go.codeblock("&authOptions")]
                    })
                );
                w.newLine();

                // Set up the token getter function
                w.writeLine("options.SetTokenGetter(func() (string, error) {");
                w.indent();
                w.writeLine("return oauthTokenProvider.GetOrFetch(func() (string, int, error) {");
                w.indent();

                // Fetch a new token from the auth endpoint
                // Get the request type reference from the endpoint
                const serviceId = oauthScheme.configuration.tokenEndpoint.endpointReference.serviceId;
                const requestTypeRef = this.getTokenEndpointRequestTypeReference(serviceId, tokenEndpoint);
                w.write(`response, err := authClient.${methodName}(`);
                w.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "Background",
                            importPath: "context"
                        }),
                        arguments_: []
                    })
                );
                w.write(", &");
                w.writeNode(requestTypeRef);
                w.writeLine("{");
                w.indent();
                // Check if request fields are optional (pointer types) and wrap accordingly
                const clientIdIsOptional = isRequestPropertyOptional(requestProperties.clientId);
                const clientSecretIsOptional = isRequestPropertyOptional(requestProperties.clientSecret);

                w.write(`${clientIdFieldName}: `);
                if (clientIdIsOptional) {
                    w.writeNode(
                        go.invokeFunc({
                            func: go.typeReference({
                                name: "String",
                                importPath: this.context.getRootImportPath()
                            }),
                            arguments_: [go.codeblock("options.ClientID")]
                        })
                    );
                } else {
                    w.write("options.ClientID");
                }
                w.writeLine(",");
                w.write(`${clientSecretFieldName}: `);
                if (clientSecretIsOptional) {
                    w.writeNode(
                        go.invokeFunc({
                            func: go.typeReference({
                                name: "String",
                                importPath: this.context.getRootImportPath()
                            }),
                            arguments_: [go.codeblock("options.ClientSecret")]
                        })
                    );
                } else {
                    w.write("options.ClientSecret");
                }
                w.writeLine(",");
                w.dedent();
                w.writeLine("})");
                w.writeLine("if err != nil {");
                w.indent();
                w.writeLine('return "", 0, err');
                w.dedent();
                w.writeLine("}");
                // Check for empty access token
                w.writeLine('if response.AccessToken == "" {');
                w.indent();
                w.write('return "", 0, ');
                w.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "New",
                            importPath: "errors"
                        }),
                        arguments_: [go.codeblock('"oauth response missing access token"')]
                    })
                );
                w.newLine();
                w.dedent();
                w.writeLine("}");
                // Handle ExpiresIn with fallback to default
                // Check if expiresIn is optional (pointer type) to determine how to access it
                const responseProperties = oauthScheme.configuration.tokenEndpoint.responseProperties;
                const expiresInIsOptional =
                    responseProperties.expiresIn != null &&
                    this.isResponsePropertyOptional(responseProperties.expiresIn);

                w.writeLine("expiresIn := core.DefaultExpirySeconds");
                if (expiresInIsOptional) {
                    w.writeLine("if response.ExpiresIn != nil {");
                    w.indent();
                    w.writeLine("expiresIn = *response.ExpiresIn");
                    w.dedent();
                    w.writeLine("}");
                } else {
                    w.writeLine("if response.ExpiresIn > 0 {");
                    w.indent();
                    w.writeLine("expiresIn = response.ExpiresIn");
                    w.dedent();
                    w.writeLine("}");
                }
                w.writeLine("return response.AccessToken, expiresIn, nil");
                w.dedent();
                w.writeLine("})");
                w.dedent();
                w.writeLine("})");
            })
        );
    }

    private getOAuthTokenEndpoint(): FernIr.HttpEndpoint | undefined {
        const oauthScheme = getOAuthClientCredentialsScheme(this.context.ir);
        if (oauthScheme?.configuration?.type !== "clientCredentials") {
            return undefined;
        }
        const { endpointId, serviceId } = oauthScheme.configuration.tokenEndpoint.endpointReference;
        const service = this.context.ir.services[serviceId];
        if (service == null) {
            return undefined;
        }
        return service.endpoints.find((ep) => ep.id === endpointId);
    }

    private isResponsePropertyOptional(responseProperty: FernIr.ResponseProperty): boolean {
        return isTypeReferenceOptional(responseProperty.property.valueType);
    }

    private getAuthServiceFernFilepath(): FernIr.FernFilepath | undefined {
        const oauthScheme = getOAuthClientCredentialsScheme(this.context.ir);
        if (oauthScheme?.configuration?.type === "clientCredentials") {
            const serviceId = oauthScheme.configuration.tokenEndpoint.endpointReference.serviceId;
            const service = this.context.ir.services[serviceId];
            if (service != null) {
                return service.name.fernFilepath;
            }
        }
        return undefined;
    }

    private writeInferredAuthEnvironmentVariables({ writer }: { writer: go.Writer }): void {
        const inferredScheme = getInferredAuthScheme(this.context.ir);
        if (inferredScheme == null) {
            return;
        }
        const credentialParams = this.getInferredAuthCredentialParameters();
        for (const param of credentialParams) {
            if (param.envVar != null) {
                this.writeEnvConditional({
                    writer,
                    propertyReference: go.selector({
                        on: go.codeblock("options"),
                        selector: go.codeblock(param.fieldName)
                    }),
                    env: param.envVar
                });
            }
        }
    }

    private writeInferredAuthTokenFetching({ writer }: { writer: go.Writer }): void {
        const inferredScheme = getInferredAuthScheme(this.context.ir);
        if (inferredScheme == null) {
            return;
        }

        const authServiceFernFilepath = this.getInferredAuthServiceFernFilepath();
        if (authServiceFernFilepath == null) {
            return;
        }

        const tokenEndpoint = this.getInferredAuthTokenEndpoint();
        if (tokenEndpoint == null) {
            return;
        }

        const methodName = this.context.getMethodName(tokenEndpoint.name);
        const credentialParams = this.getInferredAuthCredentialParameters();

        // When OAuth is also configured, authOptions/authClient are already declared
        // by writeOAuthTokenFetching. We only need the inferred auth provider and SetTokenGetter.
        const hasOAuth = getOAuthClientCredentialsScheme(this.context.ir) != null;

        writer.writeNode(
            go.codeblock((w) => {
                // Create the token provider for inferred auth (DefaultExpirySeconds applies a 1hr default when expiry is missing)
                w.write("inferredAuthProvider := ");
                w.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "NewTokenProvider",
                            importPath: this.context.getCoreImportPath()
                        }),
                        arguments_: [go.codeblock("core.DefaultExpirySeconds")]
                    })
                );
                w.newLine();

                // Only declare authOptions/authClient if OAuth hasn't already done so
                if (!hasOAuth) {
                    // Clone options for the auth client to avoid infinite recursion
                    w.writeLine("authOptions := *options");

                    // Create the auth client
                    const authClientImportPath = this.context.getClientFileLocation({
                        fernFilepath: authServiceFernFilepath,
                        subpackage: undefined
                    }).importPath;
                    w.write("authClient := ");
                    w.writeNode(
                        go.invokeFunc({
                            func: go.typeReference({
                                name: "NewClient",
                                importPath: authClientImportPath
                            }),
                            arguments_: [go.codeblock("&authOptions")]
                        })
                    );
                    w.newLine();
                }

                // Set up the token getter function
                w.writeLine("options.SetTokenGetter(func() (string, error) {");
                w.indent();
                w.writeLine("return inferredAuthProvider.GetOrFetch(func() (string, int, error) {");
                w.indent();

                // Build the request struct for the token endpoint call
                const serviceId = inferredScheme.tokenEndpoint.endpoint.serviceId;
                const requestTypeRef = this.getTokenEndpointRequestTypeReference(serviceId, tokenEndpoint);

                w.write(`response, err := authClient.${methodName}(`);
                w.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "Background",
                            importPath: "context"
                        }),
                        arguments_: []
                    })
                );
                w.write(", &");
                w.writeNode(requestTypeRef);
                w.writeLine("{");
                w.indent();

                // Set credential parameters from options
                for (const param of credentialParams) {
                    if (param.isOptional) {
                        w.write(`${param.fieldName}: `);
                        w.writeNode(
                            go.invokeFunc({
                                func: go.typeReference({
                                    name: "String",
                                    importPath: this.context.getRootImportPath()
                                }),
                                arguments_: [go.codeblock(`options.${param.fieldName}`)]
                            })
                        );
                        w.writeLine(",");
                    } else {
                        w.writeLine(`${param.fieldName}: options.${param.fieldName},`);
                    }
                }

                w.dedent();
                w.writeLine("})");
                w.writeLine("if err != nil {");
                w.indent();
                w.writeLine('return "", 0, err');
                w.dedent();
                w.writeLine("}");

                // Extract access token from response using authenticatedRequestHeaders
                // The first authenticated request header's response property gives us the access token field
                const authHeaders = inferredScheme.tokenEndpoint.authenticatedRequestHeaders;
                let accessTokenField = "AccessToken";
                const firstAuthHeader = authHeaders[0];
                if (firstAuthHeader != null && firstAuthHeader.responseProperty != null) {
                    accessTokenField = this.context.getFieldName(firstAuthHeader.responseProperty.property.name);
                }

                // Check for empty access token
                w.writeLine(`if response.${accessTokenField} == "" {`);
                w.indent();
                w.write('return "", 0, ');
                w.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "New",
                            importPath: "errors"
                        }),
                        arguments_: [go.codeblock('"inferred auth response missing access token"')]
                    })
                );
                w.newLine();
                w.dedent();
                w.writeLine("}");

                // Handle ExpiresIn with fallback to default
                const expiryProperty = inferredScheme.tokenEndpoint.expiryProperty;
                if (expiryProperty != null) {
                    const expiryField = this.context.getFieldName(expiryProperty.property.name);
                    const expiryIsOptional = this.isResponsePropertyOptional(expiryProperty);

                    w.writeLine("expiresIn := core.DefaultExpirySeconds");
                    if (expiryIsOptional) {
                        w.writeLine(`if response.${expiryField} != nil {`);
                        w.indent();
                        w.writeLine(`expiresIn = *response.${expiryField}`);
                        w.dedent();
                        w.writeLine("}");
                    } else {
                        w.writeLine(`if response.${expiryField} > 0 {`);
                        w.indent();
                        w.writeLine(`expiresIn = response.${expiryField}`);
                        w.dedent();
                        w.writeLine("}");
                    }
                    w.writeLine(`return response.${accessTokenField}, expiresIn, nil`);
                } else {
                    // No expiry property — use default
                    w.writeLine(`return response.${accessTokenField}, core.DefaultExpirySeconds, nil`);
                }

                w.dedent();
                w.writeLine("})");
                w.dedent();
                w.writeLine("})");
            })
        );
    }

    private getInferredAuthTokenEndpoint(): FernIr.HttpEndpoint | undefined {
        const inferredScheme = getInferredAuthScheme(this.context.ir);
        if (inferredScheme == null) {
            return undefined;
        }
        const { endpointId, serviceId } = inferredScheme.tokenEndpoint.endpoint;
        const service = this.context.ir.services[serviceId];
        if (service == null) {
            return undefined;
        }
        return service.endpoints.find((ep) => ep.id === endpointId);
    }

    private getInferredAuthServiceFernFilepath(): FernIr.FernFilepath | undefined {
        const inferredScheme = getInferredAuthScheme(this.context.ir);
        if (inferredScheme == null) {
            return undefined;
        }
        const serviceId = inferredScheme.tokenEndpoint.endpoint.serviceId;
        const service = this.context.ir.services[serviceId];
        if (service != null) {
            return service.name.fernFilepath;
        }
        return undefined;
    }

    private getInferredAuthCredentialParameters(): Array<{
        fieldName: string;
        isOptional: boolean;
        envVar: string | undefined;
    }> {
        const tokenEndpoint = this.getInferredAuthTokenEndpoint();
        if (tokenEndpoint == null) {
            return [];
        }

        // Get base credential params from shared utility
        const baseParams = getInferredAuthCredentialParams(tokenEndpoint, this.context.ir.types, this.context);

        // Enrich with envVar from endpoint headers
        const headerEnvVars = new Map<string, string>();
        for (const header of tokenEndpoint.headers) {
            if (header.env != null) {
                headerEnvVars.set(this.context.getFieldName(header.name), header.env);
            }
        }

        return baseParams.map((param) => ({
            ...param,
            envVar: headerEnvVars.get(param.fieldName)
        }));
    }

    /**
     * Resolves the request type reference for a token endpoint, handling both
     * wrapper requests and justRequestBody (named type reference) requests.
     */
    private getTokenEndpointRequestTypeReference(
        serviceId: FernIr.ServiceId,
        tokenEndpoint: FernIr.HttpEndpoint
    ): go.TypeReference {
        if (tokenEndpoint.sdkRequest?.shape.type === "wrapper") {
            return this.context.getRequestWrapperTypeReference(serviceId, tokenEndpoint.sdkRequest.shape.wrapperName);
        }
        if (
            tokenEndpoint.sdkRequest?.shape.type === "justRequestBody" &&
            tokenEndpoint.sdkRequest.shape.value.type === "typeReference" &&
            tokenEndpoint.sdkRequest.shape.value.requestBodyType.type === "named"
        ) {
            const namedType = tokenEndpoint.sdkRequest.shape.value.requestBodyType;
            return go.typeReference({
                name: this.context.getClassName(namedType.name),
                importPath: this.context.getPackageLocation(namedType.fernFilepath).importPath
            });
        }
        // Fallback: use requestParameterName if available
        if (tokenEndpoint.sdkRequest?.requestParameterName != null) {
            return this.context.getRequestWrapperTypeReference(
                serviceId,
                tokenEndpoint.sdkRequest.requestParameterName
            );
        }
        return go.typeReference({
            name: "GetTokenRequest",
            importPath: this.context.getRootImportPath()
        });
    }

    /**
     * Resolves body properties for a token endpoint, handling both inlined
     * request bodies and referenced type declarations.
     */
    private resolveTokenEndpointBodyProperties(
        tokenEndpoint: FernIr.HttpEndpoint
    ): Array<{ name: FernIr.NameAndWireValueOrString; valueType: FernIr.TypeReference }> {
        return resolveTokenEndpointBodyProperties(tokenEndpoint, this.context.ir.types);
    }

    private writeEnvConditional({
        writer,
        propertyReference,
        env
    }: {
        writer: go.Writer;
        propertyReference: go.Selector;
        env: string;
    }): void {
        writer.write("if ");
        writer.writeNode(propertyReference);
        writer.writeLine(' == "" {');
        writer.indent();
        writer.writeNode(propertyReference);
        writer.write(" = ");
        writer.writeNode(this.context.callGetenv(env));
        writer.newLine();
        writer.dedent();
        writer.writeLine("}");
    }

    private getOptionsPropertyReference(name: NameInput): go.Selector {
        return go.selector({
            on: go.codeblock("options"),
            selector: go.codeblock(this.context.getFieldName(name))
        });
    }

    private instantiateSubClient({ subpackage }: { subpackage: FernIr.Subpackage }): go.TypeInstantiation {
        return go.TypeInstantiation.reference(
            go.invokeFunc({
                func: this.getClientConstructor({ subpackage }),
                arguments_: [go.codeblock("options")],
                multiline: false
            })
        );
    }

    private instantiateRawClient(): go.TypeInstantiation {
        return go.TypeInstantiation.reference(
            go.invokeFunc({
                func: go.typeReference({
                    name: this.context.getRawClientConstructorName(this.subpackage),
                    importPath: this.context.getClientFileLocation({
                        fernFilepath: this.fernFilepath,
                        subpackage: this.subpackage
                    }).importPath
                }),
                arguments_: [go.codeblock("options")],
                multiline: false
            })
        );
    }

    private getClientConstructor({ subpackage }: { subpackage: FernIr.Subpackage }): go.TypeReference {
        return go.typeReference({
            name: this.context.getClientConstructorName(subpackage),
            importPath: this.context.getClientFileLocation({ fernFilepath: subpackage.fernFilepath, subpackage })
                .importPath
        });
    }

    private getPackageName(): string {
        return this.context.getClientPackageName({ fernFilepath: this.fernFilepath, subpackage: this.subpackage });
    }

    private getDirectory(): RelativeFilePath {
        return this.context.getClientFileLocation({ fernFilepath: this.fernFilepath, subpackage: this.subpackage })
            .directory;
    }

    private getImportPath(): string {
        return this.context.getClientFileLocation({ fernFilepath: this.fernFilepath, subpackage: this.subpackage })
            .importPath;
    }
}
