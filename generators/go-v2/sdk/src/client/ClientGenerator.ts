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
    OAuthClientCredentials,
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

        // Add oauthTokenProvider field if OAuth is configured (root client only)
        if (this.isRootClient && this.getOAuthClientCredentials() != null) {
            struct.addField(
                go.field({
                    name: "oauthTokenProvider",
                    type: go.Type.pointer(
                        go.Type.reference(
                            go.typeReference({
                                name: "OAuthTokenProvider",
                                importPath: this.context.getCoreImportPath()
                            })
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
        // Add oauthTokenProvider field if OAuth is configured (root client only)
        const oauthEndpointInfo = this.isRootClient ? this.getOAuthTokenEndpointInfo() : undefined;
        if (this.isRootClient && oauthEndpointInfo != null) {
            fields.push({
                name: "oauthTokenProvider",
                value: go.TypeInstantiation.reference(go.codeblock("oauthTokenProvider"))
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
                // Write OAuth token fetcher closure if OAuth is configured (root client only)
                if (oauthEndpointInfo != null) {
                    this.writeOAuthTokenFetcher({ writer, oauthEndpointInfo });
                }
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

    private writeOAuthTokenFetcher({
        writer,
        oauthEndpointInfo
    }: {
        writer: go.Writer;
        oauthEndpointInfo: OAuthTokenEndpointInfo;
    }): void {
        const coreAlias = writer.addImport(this.context.getCoreImportPath());
        writer.addImport("context");
        const jsonAlias = writer.addImport("encoding/json");
        const httpAlias = writer.addImport("net/http");
        const bytesAlias = writer.addImport("bytes");

        // Generate the token fetcher closure
        writer.writeLine(
            `tokenFetcher := func(ctx context.Context) (*${coreAlias}.OAuthTokenResponse, error) {`
        );
        writer.indent();

        // Build request body
        writer.writeLine(`requestBody := map[string]interface{}{`);
        writer.indent();
        writer.writeLine(`"client_id":     options.ClientID,`);
        writer.writeLine(`"client_secret": options.ClientSecret,`);
        writer.writeLine(`"grant_type":    "client_credentials",`);
        writer.dedent();
        writer.writeLine(`}`);
        writer.newLine();

        // Marshal request body
        writer.writeLine(`jsonBody, err := ${jsonAlias}.Marshal(requestBody)`);
        writer.writeLine(`if err != nil {`);
        writer.indent();
        writer.writeLine(`return nil, err`);
        writer.dedent();
        writer.writeLine(`}`);
        writer.newLine();

        // Build URL
        writer.writeLine(`url := options.BaseURL + "${oauthEndpointInfo.tokenEndpointURL}"`);
        writer.newLine();

        // Create HTTP request
        writer.writeLine(
            `req, err := ${httpAlias}.NewRequestWithContext(ctx, ${httpAlias}.MethodPost, url, ${bytesAlias}.NewReader(jsonBody))`
        );
        writer.writeLine(`if err != nil {`);
        writer.indent();
        writer.writeLine(`return nil, err`);
        writer.dedent();
        writer.writeLine(`}`);
        writer.writeLine(`req.Header.Set("Content-Type", "application/json")`);
        writer.newLine();

        // Execute request
        writer.writeLine(`httpClient := options.HTTPClient`);
        writer.writeLine(`if httpClient == nil {`);
        writer.indent();
        writer.writeLine(`httpClient = ${httpAlias}.DefaultClient`);
        writer.dedent();
        writer.writeLine(`}`);
        writer.writeLine(`resp, err := httpClient.Do(req)`);
        writer.writeLine(`if err != nil {`);
        writer.indent();
        writer.writeLine(`return nil, err`);
        writer.dedent();
        writer.writeLine(`}`);
        writer.writeLine(`defer resp.Body.Close()`);
        writer.newLine();

        // Check response status
        writer.writeLine(`if resp.StatusCode < 200 || resp.StatusCode >= 300 {`);
        writer.indent();
        writer.writeLine(`return nil, ${coreAlias}.NewAPIError(resp.StatusCode, resp.Header, nil)`);
        writer.dedent();
        writer.writeLine(`}`);
        writer.newLine();

        // Decode response - use a generic map to handle different property names
        writer.writeLine(`var rawResponse map[string]interface{}`);
        writer.writeLine(`if err := ${jsonAlias}.NewDecoder(resp.Body).Decode(&rawResponse); err != nil {`);
        writer.indent();
        writer.writeLine(`return nil, err`);
        writer.dedent();
        writer.writeLine(`}`);
        writer.newLine();

        // Extract token response fields
        writer.writeLine(`tokenResp := &${coreAlias}.OAuthTokenResponse{}`);
        writer.writeLine(`if accessToken, ok := rawResponse["${oauthEndpointInfo.accessTokenProperty}"].(string); ok {`);
        writer.indent();
        writer.writeLine(`tokenResp.AccessToken = accessToken`);
        writer.dedent();
        writer.writeLine(`}`);
        writer.writeLine(`if expiresIn, ok := rawResponse["${oauthEndpointInfo.expiresInProperty}"].(float64); ok {`);
        writer.indent();
        writer.writeLine(`tokenResp.ExpiresIn = int(expiresIn)`);
        writer.dedent();
        writer.writeLine(`}`);
        if (oauthEndpointInfo.refreshTokenProperty != null) {
            writer.writeLine(
                `if refreshToken, ok := rawResponse["${oauthEndpointInfo.refreshTokenProperty}"].(string); ok {`
            );
            writer.indent();
            writer.writeLine(`tokenResp.RefreshToken = refreshToken`);
            writer.dedent();
            writer.writeLine(`}`);
        }
        writer.writeLine(`return tokenResp, nil`);
        writer.dedent();
        writer.writeLine(`}`);
        writer.newLine();

        // Create the OAuthTokenProvider
        writer.writeLine(`oauthTokenProvider := ${coreAlias}.NewOAuthTokenProvider(tokenFetcher)`);
        writer.writeLine(`options.OAuthTokenProvider = oauthTokenProvider`);
        writer.newLine();
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

    private getOAuthClientCredentials(): OAuthClientCredentials | undefined {
        if (this.context.ir.auth == null) {
            return undefined;
        }
        for (const scheme of this.context.ir.auth.schemes) {
            if (scheme.type === "oauth" && scheme.configuration?.type === "clientCredentials") {
                return scheme.configuration;
            }
        }
        return undefined;
    }

    private getOAuthTokenEndpointInfo(): OAuthTokenEndpointInfo | undefined {
        const oauthCreds = this.getOAuthClientCredentials();
        if (oauthCreds == null || oauthCreds.tokenEndpoint == null) {
            return undefined;
        }

        const tokenEndpoint = oauthCreds.tokenEndpoint;
        if (tokenEndpoint.endpointReference == null) {
            return undefined;
        }

        const service = this.context.ir.services[tokenEndpoint.endpointReference.serviceId];
        if (service == null) {
            return undefined;
        }

        let endpoint: HttpEndpoint | undefined;
        for (const ep of service.endpoints) {
            if (ep.id === tokenEndpoint.endpointReference.endpointId) {
                endpoint = ep;
                break;
            }
        }
        if (endpoint == null) {
            return undefined;
        }

        // Build endpoint path
        let tokenEndpointURL = "";
        if (service.basePath != null) {
            tokenEndpointURL = this.buildHttpPath(service.basePath);
        }
        tokenEndpointURL += this.buildHttpPath(endpoint.path);

        // Get response property names
        let accessTokenProperty = "access_token";
        let expiresInProperty = "expires_in";
        let refreshTokenProperty: string | undefined;

        if (tokenEndpoint.responseProperties != null) {
            if (
                tokenEndpoint.responseProperties.accessToken?.property != null &&
                tokenEndpoint.responseProperties.accessToken.property.name != null
            ) {
                accessTokenProperty = tokenEndpoint.responseProperties.accessToken.property.name.wireValue;
            }
            if (
                tokenEndpoint.responseProperties.expiresIn?.property != null &&
                tokenEndpoint.responseProperties.expiresIn.property.name != null
            ) {
                expiresInProperty = tokenEndpoint.responseProperties.expiresIn.property.name.wireValue;
            }
            if (
                tokenEndpoint.responseProperties.refreshToken?.property != null &&
                tokenEndpoint.responseProperties.refreshToken.property.name != null
            ) {
                refreshTokenProperty = tokenEndpoint.responseProperties.refreshToken.property.name.wireValue;
            }
        }

        return {
            tokenEndpointURL,
            accessTokenProperty,
            expiresInProperty,
            refreshTokenProperty
        };
    }

    private buildHttpPath(httpPath: { head: string; parts: Array<{ pathParameter: string; tail: string }> }): string {
        let path = httpPath.head;
        for (const part of httpPath.parts) {
            path += `{${part.pathParameter}}${part.tail}`;
        }
        return path;
    }
}

interface OAuthTokenEndpointInfo {
    tokenEndpointURL: string;
    accessTokenProperty: string;
    expiresInProperty: string;
    refreshTokenProperty?: string;
}
