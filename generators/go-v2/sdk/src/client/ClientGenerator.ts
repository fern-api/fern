import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { FileGenerator, GoFile } from "@fern-api/go-base";

import {
    BasicAuthScheme,
    BearerAuthScheme,
    FernFilepath,
    HeaderAuthScheme,
    HttpEndpoint,
    HttpService,
    Name,
    OAuthScheme,
    ServiceId,
    Subpackage,
    SubpackageId
} from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace ClientGenerator {
    interface Args {
        context: SdkGeneratorContext;
        isRootClient?: boolean;
        fernFilepath: FernFilepath;
        subpackage: Subpackage | undefined;
        nestedSubpackages: SubpackageId[];
        serviceId: ServiceId | undefined;
        service: HttpService | undefined;
    }
}

export class ClientGenerator extends FileGenerator<GoFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private isRootClient: boolean = false;
    private fernFilepath: FernFilepath;
    private nestedSubpackages: SubpackageId[] = [];
    private subpackage: Subpackage | undefined;
    private serviceId: ServiceId | undefined;
    private service: HttpService | undefined;

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
        }
    }

    private writeHeaderEnvironmentVariables({ writer }: { writer: go.Writer }): void {
        for (const header of this.context.ir.headers) {
            if (header.env == null) {
                continue;
            }
            this.writeEnvConditional({
                writer,
                propertyReference: this.getOptionsPropertyReference(header.name.name),
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
            }
        }
    }

    private writeBasicAuthEnvironmentVariables({
        writer,
        scheme
    }: {
        writer: go.Writer;
        scheme: BasicAuthScheme;
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
        scheme: BearerAuthScheme;
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
        scheme: HeaderAuthScheme;
    }): void {
        if (scheme.headerEnvVar != null) {
            this.writeEnvConditional({
                writer,
                propertyReference: this.getOptionsPropertyReference(scheme.name.name),
                env: scheme.headerEnvVar
            });
        }
    }

    private writeOAuthEnvironmentVariables({ writer, scheme }: { writer: go.Writer; scheme: OAuthScheme }): void {
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
        const oauthScheme = this.getOAuthClientCredentialsScheme();
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

        // Get the method name from the endpoint
        const methodName = this.context.getMethodName(tokenEndpoint.name);

        // Get the request field names from the IR
        const requestProperties = oauthScheme.configuration.tokenEndpoint.requestProperties;
        const clientIdFieldName = this.getRequestPropertyFieldName(requestProperties.clientId);
        const clientSecretFieldName = this.getRequestPropertyFieldName(requestProperties.clientSecret);

        // Create the OAuthTokenProvider
        writer.writeNode(
            go.codeblock((w) => {
                w.write("oauthTokenProvider := ");
                w.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "NewOAuthTokenProvider",
                            importPath: this.context.getCoreImportPath()
                        }),
                        arguments_: [
                            go.selector({ on: go.codeblock("options"), selector: go.codeblock("ClientID") }),
                            go.selector({ on: go.codeblock("options"), selector: go.codeblock("ClientSecret") })
                        ]
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
                const requestWrapperName =
                    tokenEndpoint.sdkRequest?.shape.type === "wrapper"
                        ? tokenEndpoint.sdkRequest.shape.wrapperName
                        : tokenEndpoint.sdkRequest?.requestParameterName;
                const requestTypeRef =
                    requestWrapperName != null
                        ? this.context.getRequestWrapperTypeReference(serviceId, requestWrapperName)
                        : go.typeReference({ name: "GetTokenRequest", importPath: this.context.getRootImportPath() });
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
                w.writeLine(`${clientIdFieldName}: options.ClientID,`);
                w.writeLine(`${clientSecretFieldName}: options.ClientSecret,`);
                w.dedent();
                w.writeLine("})");
                w.writeLine("if err != nil {");
                w.indent();
                w.writeLine('return "", 0, err');
                w.dedent();
                w.writeLine("}");
                // Check for empty access token (handles both pointer and non-pointer types)
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
                w.writeLine("expiresIn := core.DefaultExpirySeconds");
                w.writeLine("if response.ExpiresIn > 0 {");
                w.indent();
                w.writeLine("expiresIn = response.ExpiresIn");
                w.dedent();
                w.writeLine("}");
                w.writeLine("return response.AccessToken, expiresIn, nil");
                w.dedent();
                w.writeLine("})");
                w.dedent();
                w.writeLine("})");
            })
        );
    }

    private getOAuthTokenEndpoint(): HttpEndpoint | undefined {
        const oauthScheme = this.getOAuthClientCredentialsScheme();
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

    private getRequestPropertyFieldName(requestProperty: {
        property: { type: string; name?: { name: Name } };
    }): string {
        // The property can be either "query" or "body" type
        // Both have a name field that contains the Name object
        if (requestProperty.property.type === "body" && requestProperty.property.name != null) {
            return this.context.getFieldName(requestProperty.property.name.name);
        }
        if (requestProperty.property.type === "query" && requestProperty.property.name != null) {
            return this.context.getFieldName(requestProperty.property.name.name);
        }
        // Fallback to default names if we can't extract from IR
        return "ClientId";
    }

    private getOAuthClientCredentialsScheme(): OAuthScheme | undefined {
        if (this.context.ir.auth == null) {
            return undefined;
        }
        for (const scheme of this.context.ir.auth.schemes) {
            if (scheme.type === "oauth" && scheme.configuration?.type === "clientCredentials") {
                return scheme;
            }
        }
        return undefined;
    }

    private getAuthServiceFernFilepath(): FernFilepath | undefined {
        const oauthScheme = this.getOAuthClientCredentialsScheme();
        if (oauthScheme?.configuration?.type === "clientCredentials") {
            const serviceId = oauthScheme.configuration.tokenEndpoint.endpointReference.serviceId;
            const service = this.context.ir.services[serviceId];
            if (service != null) {
                return service.name.fernFilepath;
            }
        }
        return undefined;
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

    private getOptionsPropertyReference(name: Name): go.Selector {
        return go.selector({ on: go.codeblock("options"), selector: go.codeblock(this.context.getFieldName(name)) });
    }

    private instantiateSubClient({ subpackage }: { subpackage: Subpackage }): go.TypeInstantiation {
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

    private getClientConstructor({ subpackage }: { subpackage: Subpackage }): go.TypeReference {
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
