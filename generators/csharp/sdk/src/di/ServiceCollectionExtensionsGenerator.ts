import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { collectInferredAuthCredentials } from "../utils/inferredAuthUtils.js";

type AuthScheme = FernIr.AuthScheme;
type OAuthScheme = FernIr.OAuthScheme;

/**
 * Represents a configuration property derived from an auth scheme or header
 * that will be included in the generated DI options class.
 */
interface OptionsProperty {
    name: string;
    pascalName: string;
    docs: string;
    isOptional: boolean;
    hasEnvironmentVariable: boolean;
}

/**
 * Generates ServiceCollectionExtensions.cs with IServiceCollection extension methods
 * for registering the generated SDK client in the .NET DI container.
 *
 * This follows the patterns used by popular .NET SDKs:
 * - twilio-aspnet: AddTwilioClient() with multiple overloads
 * - Stripe: AddStripe() with IConfiguration binding
 * - SendGrid: AddSendGrid() with Action<Options> pattern
 *
 * The generated code is wrapped in #if !NETFRAMEWORK to ensure
 * it only compiles for .NET Core targets.
 */
export class ServiceCollectionExtensionsGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private readonly clientName: string;
    private readonly optionsClassName: string;
    private readonly configSectionName: string;

    constructor(context: SdkGeneratorContext) {
        super(context);
        this.clientName = this.names.classes.rootClient;
        this.optionsClassName = `${this.clientName}Options`;
        this.configSectionName = this.clientName;
    }

    protected getFilepath(): RelativeFilePath {
        return RelativeFilePath.of(`ServiceCollectionExtensions.cs`);
    }

    /**
     * Extracts auth parameters from the IR auth schemes to generate options properties.
     */
    private getAuthProperties(): OptionsProperty[] {
        const properties: OptionsProperty[] = [];
        const seenNames = new Set<string>();

        for (const scheme of this.context.ir.auth.schemes) {
            for (const prop of this.getPropertiesFromAuthScheme(scheme)) {
                if (!seenNames.has(prop.name)) {
                    properties.push(prop);
                    seenNames.add(prop.name);
                }
            }
        }

        // Also include global headers as options properties
        for (const header of this.context.ir.headers) {
            if (header.valueType.type === "container" && header.valueType.container.type === "literal") {
                continue; // Skip literal headers
            }
            const name = header.name.name.camelCase.safeName;
            const pascalName = header.name.name.pascalCase.safeName;
            if (!seenNames.has(name)) {
                properties.push({
                    name,
                    pascalName,
                    docs: header.docs ?? `The ${name} header value.`,
                    isOptional: header.valueType.type === "container" && header.valueType.container.type === "optional",
                    hasEnvironmentVariable: false
                });
                seenNames.add(name);
            }
        }

        return properties;
    }

    /**
     * Converts an auth scheme into options properties.
     * Mirrors the parameter extraction logic in RootClientGenerator.getParameterFromAuthScheme.
     */
    private getPropertiesFromAuthScheme(scheme: AuthScheme): OptionsProperty[] {
        const isOptional = this.context.ir.sdkConfig.isAuthMandatory;
        if (scheme.type === "header") {
            const name = scheme.name.name.camelCase.safeName;
            const pascalName = scheme.name.name.pascalCase.safeName;
            return [
                {
                    name,
                    pascalName,
                    docs: scheme.docs ?? `The ${name} to use for authentication.`,
                    isOptional,
                    hasEnvironmentVariable: scheme.headerEnvVar != null
                }
            ];
        } else if (scheme.type === "bearer") {
            const name = scheme.token.camelCase.safeName;
            const pascalName = scheme.token.pascalCase.safeName;
            return [
                {
                    name,
                    pascalName,
                    docs: scheme.docs ?? `The ${name} to use for authentication.`,
                    isOptional,
                    hasEnvironmentVariable: scheme.tokenEnvVar != null
                }
            ];
        } else if (scheme.type === "basic") {
            const usernameName = scheme.username.camelCase.safeName;
            const usernamePascal = scheme.username.pascalCase.safeName;
            const passwordName = scheme.password.camelCase.safeName;
            const passwordPascal = scheme.password.pascalCase.safeName;
            return [
                {
                    name: usernameName,
                    pascalName: usernamePascal,
                    docs: `The ${usernameName} to use for authentication.`,
                    isOptional,
                    hasEnvironmentVariable: scheme.usernameEnvVar != null
                },
                {
                    name: passwordName,
                    pascalName: passwordPascal,
                    docs: `The ${passwordName} to use for authentication.`,
                    isOptional,
                    hasEnvironmentVariable: scheme.passwordEnvVar != null
                }
            ];
        } else if (scheme.type === "oauth") {
            const oauth = this.context.getOauth();
            if (oauth == null) {
                return [];
            }
            const properties: OptionsProperty[] = [
                {
                    name: "clientId",
                    pascalName: "ClientId",
                    docs: "The client ID for OAuth authentication.",
                    isOptional,
                    hasEnvironmentVariable: scheme.configuration.clientIdEnvVar != null
                },
                {
                    name: "clientSecret",
                    pascalName: "ClientSecret",
                    docs: "The client secret for OAuth authentication.",
                    isOptional,
                    hasEnvironmentVariable: scheme.configuration.clientSecretEnvVar != null
                }
            ];
            // Include additional OAuth parameters (custom properties and scopes)
            properties.push(...this.getOAuthAdditionalProperties(scheme, isOptional));
            return properties;
        } else if (scheme.type === "inferred") {
            const inferred = this.context.getInferredAuth();
            if (inferred == null) {
                return [];
            }
            return this.getInferredAuthProperties(inferred, isOptional);
        }
        return [];
    }

    /**
     * Gets additional OAuth properties from custom token endpoint properties and scopes.
     * Mirrors the logic in RootClientGenerator.getOAuthAdditionalConstructorParams.
     *
     * Note: hasEnvironmentVariable is false for these properties because the IR's
     * OAuthCustomProperty schema does not include environment variable bindings.
     * Only the top-level clientId/clientSecret have env var support via
     * scheme.configuration.clientIdEnvVar / clientSecretEnvVar.
     */
    private getOAuthAdditionalProperties(scheme: OAuthScheme, isOptional: boolean): OptionsProperty[] {
        const properties: OptionsProperty[] = [];
        for (const customProperty of scheme.configuration.tokenEndpoint.requestProperties.customProperties ?? []) {
            if (this.isLiteralTypeReference(customProperty.property.valueType)) {
                continue;
            }
            const typeRef = this.context.csharpTypeMapper.convert({
                reference: customProperty.property.valueType
            });
            if (typeRef.isOptional) {
                continue;
            }
            const name = customProperty.property.name.name.camelCase.safeName;
            const pascalName = customProperty.property.name.name.pascalCase.safeName;
            properties.push({
                name,
                pascalName,
                docs: `The ${name} for OAuth authentication.`,
                isOptional,
                hasEnvironmentVariable: false
            });
        }
        const scopes = scheme.configuration.tokenEndpoint.requestProperties.scopes;
        if (scopes && !this.isLiteralTypeReference(scopes.property.valueType)) {
            const typeRef = this.context.csharpTypeMapper.convert({
                reference: scopes.property.valueType
            });
            if (!typeRef.isOptional) {
                const name = scopes.property.name.name.camelCase.safeName;
                const pascalName = scopes.property.name.name.pascalCase.safeName;
                properties.push({
                    name,
                    pascalName,
                    docs: `The ${name} for OAuth authentication.`,
                    isOptional,
                    hasEnvironmentVariable: false
                });
            }
        }
        return properties;
    }

    /**
     * Gets properties from inferred auth credentials.
     * Mirrors the logic in RootClientGenerator.getParameterFromAuthScheme for inferred type.
     *
     * Note: hasEnvironmentVariable is false for inferred auth credentials because they
     * are derived from token endpoint headers and body properties, which don't have
     * environment variable bindings in the IR (unlike top-level auth scheme headers
     * which have headerEnvVar/tokenEnvVar). This is consistent with
     * RootClientGenerator which also does not set environmentVariable for inferred params.
     */
    private getInferredAuthProperties(inferred: FernIr.InferredAuthScheme, isOptional: boolean): OptionsProperty[] {
        const tokenEndpointReference = inferred.tokenEndpoint.endpoint;
        const tokenEndpointHttpService = this.context.getHttpService(tokenEndpointReference.serviceId);
        if (tokenEndpointHttpService == null) {
            return [];
        }
        const tokenEndpoint = this.context.resolveEndpoint(tokenEndpointHttpService, tokenEndpointReference.endpointId);
        const credentials = collectInferredAuthCredentials(this.context, tokenEndpoint);
        return credentials.map((credential) => ({
            name: credential.camelName,
            pascalName: credential.pascalName,
            docs: credential.docs ?? `The ${credential.camelName} for authentication.`,
            isOptional: isOptional || credential.isOptional,
            hasEnvironmentVariable: false
        }));
    }

    private isLiteralTypeReference(typeReference: FernIr.TypeReference): boolean {
        return typeReference.type === "container" && typeReference.container.type === "literal";
    }

    public doGenerate(): CSharpFile {
        const authProperties = this.getAuthProperties();
        const class_ = this.csharp.class_({
            reference: this.csharp.classReference({
                name: "ServiceCollectionExtensions",
                namespace: this.namespaces.root
            }),
            access: ast.Access.Public,
            static_: true
        });

        // Add the parameterless overload (auto-bind from IConfiguration)
        this.addParameterlessOverload(class_, authProperties);

        // Add the Action<Options> overload
        this.addActionOverload(class_, authProperties);

        // Add the IConfigurationSection overload
        this.addConfigurationSectionOverload(class_, authProperties);

        // Add the private internal registration method
        this.addInternalRegistration(class_, authProperties);

        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of(""),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation,
            fileHeader: "#if !NETFRAMEWORK",
            fileFooter: "#endif"
        });
    }

    private addParameterlessOverload(class_: ast.Class, _authProperties: OptionsProperty[]): void {
        class_.addMethod({
            access: ast.Access.Public,
            isAsync: false,
            type: ast.MethodType.STATIC,
            name: `Add${this.clientName}`,
            summary: `Registers the <see cref="${this.clientName}"/> and related services in the dependency injection container. Configuration is read from the "${this.configSectionName}" section of the application's <see cref="IConfiguration"/>.`,
            return_: this.csharp.classReference({
                name: "IServiceCollection",
                namespace: "Microsoft.Extensions.DependencyInjection"
            }),
            parameters: [
                this.csharp.parameter({
                    name: "services",
                    type: this.csharp.classReference({
                        name: "IServiceCollection",
                        namespace: "Microsoft.Extensions.DependencyInjection"
                    }),
                    this_: true
                })
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(`services.AddOptions<${this.optionsClassName}>()`);
                writer.indent();
                writer.writeLine(`.BindConfiguration("${this.configSectionName}");`);
                writer.dedent();
                writer.writeLine("");
                writer.writeLine(`return services.Add${this.clientName}Internal();`);
            })
        });
    }

    private addActionOverload(class_: ast.Class, _authProperties: OptionsProperty[]): void {
        class_.addMethod({
            access: ast.Access.Public,
            isAsync: false,
            type: ast.MethodType.STATIC,
            name: `Add${this.clientName}`,
            summary: `Registers the <see cref="${this.clientName}"/> and related services in the dependency injection container with the specified configuration.`,
            return_: this.csharp.classReference({
                name: "IServiceCollection",
                namespace: "Microsoft.Extensions.DependencyInjection"
            }),
            parameters: [
                this.csharp.parameter({
                    name: "services",
                    type: this.csharp.classReference({
                        name: "IServiceCollection",
                        namespace: "Microsoft.Extensions.DependencyInjection"
                    }),
                    this_: true
                }),
                this.csharp.parameter({
                    name: "configure",
                    type: this.csharp.classReference({
                        name: "Action",
                        namespace: "System",
                        generics: [
                            this.csharp.classReference({
                                name: this.optionsClassName,
                                namespace: this.namespaces.root
                            })
                        ]
                    })
                })
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(`services.AddOptions<${this.optionsClassName}>()`);
                writer.indent();
                writer.writeLine(".Configure(configure);");
                writer.dedent();
                writer.writeLine("");
                writer.writeLine(`return services.Add${this.clientName}Internal();`);
            })
        });
    }

    private addConfigurationSectionOverload(class_: ast.Class, _authProperties: OptionsProperty[]): void {
        class_.addMethod({
            access: ast.Access.Public,
            isAsync: false,
            type: ast.MethodType.STATIC,
            name: `Add${this.clientName}`,
            summary: `Registers the <see cref="${this.clientName}"/> and related services in the dependency injection container with configuration from the specified <see cref="IConfigurationSection"/>.`,
            return_: this.csharp.classReference({
                name: "IServiceCollection",
                namespace: "Microsoft.Extensions.DependencyInjection"
            }),
            parameters: [
                this.csharp.parameter({
                    name: "services",
                    type: this.csharp.classReference({
                        name: "IServiceCollection",
                        namespace: "Microsoft.Extensions.DependencyInjection"
                    }),
                    this_: true
                }),
                this.csharp.parameter({
                    name: "configurationSection",
                    type: this.csharp.classReference({
                        name: "IConfigurationSection",
                        namespace: "Microsoft.Extensions.Configuration"
                    })
                })
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(`services.AddOptions<${this.optionsClassName}>()`);
                writer.indent();
                writer.writeLine(".Bind(configurationSection);");
                writer.dedent();
                writer.writeLine("");
                writer.writeLine(`return services.Add${this.clientName}Internal();`);
            })
        });
    }

    /**
     * Resolves the default environment URL expression for the BaseUrl fallback.
     * When the API defines environments with a default, this returns the C# expression
     * (e.g., "Environments.PRODUCTION") to use as the BaseUrl default instead of "".
     * Returns undefined if no default environment is configured.
     */
    private getDefaultEnvironmentExpression(): string | undefined {
        const defaultEnvironmentId = this.context.ir.environments?.defaultEnvironment;
        if (defaultEnvironmentId == null) {
            return undefined;
        }
        const defaultEnvironmentName = this.context.ir.environments?.environments._visit({
            singleBaseUrl: (value) => {
                const env = value.environments.find((e) => e.id === defaultEnvironmentId);
                return this.settings.pascalCaseEnvironments
                    ? env?.name.pascalCase.safeName
                    : env?.name.screamingSnakeCase.safeName;
            },
            multipleBaseUrls: (value) => {
                const env = value.environments.find((e) => e.id === defaultEnvironmentId);
                return this.settings.pascalCaseEnvironments
                    ? env?.name.pascalCase.safeName
                    : env?.name.screamingSnakeCase.safeName;
            },
            _other: () => undefined
        });
        if (defaultEnvironmentName == null) {
            return undefined;
        }
        return `Environments.${defaultEnvironmentName}`;
    }

    /**
     * Writes a TryAddScoped registration line for a service type resolved via a factory lambda.
     * This helper reduces duplication in the subclient registration loop.
     *
     * @param writer - The code writer
     * @param serviceType - The fully-qualified service type to register (e.g., "IServiceClient")
     * @param factoryBody - The lambda body expression (e.g., "provider.GetRequiredService<MyClient>().Service")
     */
    private writeTryAddScoped(
        writer: { writeLine: (line: string) => void },
        serviceType: string,
        factoryBody: string
    ): void {
        writer.writeLine(
            `Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<${serviceType}>(services, provider => ${factoryBody});`
        );
    }

    private addInternalRegistration(class_: ast.Class, authProperties: OptionsProperty[]): void {
        const defaultEnvExpression = this.getDefaultEnvironmentExpression();

        class_.addMethod({
            access: ast.Access.Private,
            isAsync: false,
            type: ast.MethodType.STATIC,
            name: `Add${this.clientName}Internal`,
            return_: this.csharp.classReference({
                name: "IServiceCollection",
                namespace: "Microsoft.Extensions.DependencyInjection"
            }),
            parameters: [
                this.csharp.parameter({
                    name: "services",
                    type: this.csharp.classReference({
                        name: "IServiceCollection",
                        namespace: "Microsoft.Extensions.DependencyInjection"
                    }),
                    this_: true
                })
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(`services.AddHttpClient("${this.clientName}");`);
                writer.writeLine("");

                // Register the root client concrete type via a scoped factory lambda
                writer.writeLine(
                    `Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped(services, provider =>`
                );

                writer.writeLine("{");
                writer.indent();
                writer.writeLine(
                    `var options = provider.GetRequiredService<Microsoft.Extensions.Options.IOptionsSnapshot<${this.optionsClassName}>>().Value;`
                );
                writer.writeLine(
                    `var httpClientFactory = provider.GetRequiredService<System.Net.Http.IHttpClientFactory>();`
                );
                writer.writeLine("");

                // Use object initializer for all ClientOptions properties to avoid
                // init-only property assignment errors on NET5_0_OR_GREATER.
                // BaseUrl falls back to the SDK's default environment URL when available,
                // or empty string when no default environment is configured.
                const baseUrlFallback = defaultEnvExpression ?? `""`;
                writer.writeLine(`var clientOptions = new ClientOptions`);
                writer.writeLine("{");
                writer.indent();
                writer.writeLine(`HttpClient = httpClientFactory.CreateClient("${this.clientName}"),`);
                writer.writeLine("MaxRetries = options.MaxRetries,");
                writer.writeLine("Timeout = options.Timeout,");
                writer.writeLine(
                    `BaseUrl = !string.IsNullOrEmpty(options.BaseUrl) ? options.BaseUrl! : ${baseUrlFallback},`
                );
                writer.dedent();
                writer.writeLine("};");
                writer.writeLine("");

                // Build constructor arguments, matching root client constructor ordering:
                // required params first, then optional params, then clientOptions.
                // Required params use explicit null validation with ArgumentNullException
                // instead of the null-forgiving operator (!) to provide clear runtime errors
                // when required options are not configured.
                const requiredProps = authProperties.filter((p) => !p.isOptional && !p.hasEnvironmentVariable);
                const optionalProps = authProperties.filter((p) => p.isOptional || p.hasEnvironmentVariable);

                for (const prop of requiredProps) {
                    writer.writeLine(
                        `var ${prop.name} = options.${prop.pascalName} ?? throw new System.ArgumentNullException(nameof(options.${prop.pascalName}), "${prop.pascalName} is required but was not configured. Provide it via appsettings.json or the options delegate.");`
                    );
                }
                if (requiredProps.length > 0) {
                    writer.writeLine("");
                }

                const constructorArgs = [
                    ...requiredProps.map((p) => p.name),
                    ...optionalProps.map((p) => `options.${p.pascalName}`),
                    "clientOptions"
                ];

                writer.writeLine(`return new ${this.clientName}(${constructorArgs.join(", ")});`);
                writer.dedent();
                writer.writeLine("});");
                writer.writeLine("");

                // Register the root client interface, resolved via the concrete root client
                const interfaceName = `I${this.clientName}`;
                this.writeTryAddScoped(writer, interfaceName, `provider.GetRequiredService<${this.clientName}>()`);
                writer.writeLine("");

                // Register subclient interfaces and concrete types, resolved via the root client's properties
                this.writeSubclientRegistrations(writer);
                writer.writeLine("");
                writer.writeLine("return services;");
            })
        });
    }

    /**
     * Writes TryAddScoped registrations for all subclients that have endpoints.
     * Each subclient gets two registrations:
     * 1. Interface -> resolved from root client property
     * 2. Concrete type -> cast from root client property
     *
     * Uses fully-qualified names for subclients in different namespaces to avoid
     * ambiguous type references without requiring additional using statements.
     */
    private writeSubclientRegistrations(writer: { writeLine: (line: string) => void }): void {
        const subpackages = this.context.getSubpackages(this.context.ir.rootPackage.subpackages);
        for (const subpackage of subpackages) {
            if (!this.context.subPackageHasEndpointsRecursively(subpackage)) {
                continue;
            }
            const subpackagePropertyName = subpackage.name.pascalCase.safeName;
            const subClientClassName = `${subpackage.name.pascalCase.unsafeName}Client`;
            const subClientInterfaceName = `I${subClientClassName}`;
            const subClientClassRef = this.context.getSubpackageClassReference(subpackage);
            const subClientInterfaceRef = this.context.getSubpackageInterfaceReference(subpackage);

            // Use fully-qualified names when the subclient lives in a different namespace
            const subClientFqn =
                subClientClassRef.namespace !== this.namespaces.root
                    ? `${subClientClassRef.namespace}.${subClientClassName}`
                    : subClientClassName;
            const subClientInterfaceFqn =
                subClientInterfaceRef.namespace !== this.namespaces.root
                    ? `${subClientInterfaceRef.namespace}.${subClientInterfaceName}`
                    : subClientInterfaceName;

            const rootClientProperty = `provider.GetRequiredService<${this.clientName}>().${subpackagePropertyName}`;
            this.writeTryAddScoped(writer, subClientInterfaceFqn, rootClientProperty);
            this.writeTryAddScoped(writer, subClientFqn, `(${subClientFqn})${rootClientProperty}`);
        }
    }
}
