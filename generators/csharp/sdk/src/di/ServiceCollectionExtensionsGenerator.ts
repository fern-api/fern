import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

type AuthScheme = FernIr.AuthScheme;

/**
 * Represents a configuration property derived from an auth scheme or header
 * that will be included in the generated DI options class.
 */
interface OptionsProperty {
    name: string;
    pascalName: string;
    docs: string;
    isOptional: boolean;
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
        return RelativeFilePath.of(`Extensions/ServiceCollectionExtensions.cs`);
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
                    isOptional: header.valueType.type === "container" && header.valueType.container.type === "optional"
                });
                seenNames.add(name);
            }
        }

        return properties;
    }

    private getPropertiesFromAuthScheme(scheme: AuthScheme): OptionsProperty[] {
        if (scheme.type === "header") {
            const name = scheme.name.name.camelCase.safeName;
            const pascalName = scheme.name.name.pascalCase.safeName;
            return [
                {
                    name,
                    pascalName,
                    docs: scheme.docs ?? `The ${name} to use for authentication.`,
                    isOptional: false
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
                    isOptional: false
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
                    isOptional: false
                },
                {
                    name: passwordName,
                    pascalName: passwordPascal,
                    docs: `The ${passwordName} to use for authentication.`,
                    isOptional: false
                }
            ];
        } else if (scheme.type === "oauth") {
            return [
                {
                    name: "clientId",
                    pascalName: "ClientId",
                    docs: "The client ID for OAuth authentication.",
                    isOptional: false
                },
                {
                    name: "clientSecret",
                    pascalName: "ClientSecret",
                    docs: "The client secret for OAuth authentication.",
                    isOptional: false
                }
            ];
        }
        return [];
    }

    public doGenerate(): CSharpFile {
        const authProperties = this.getAuthProperties();
        const class_ = this.csharp.class_({
            reference: this.csharp.classReference({
                name: "ServiceCollectionExtensions",
                namespace: `${this.namespaces.root}.Extensions`
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
            directory: RelativeFilePath.of("Extensions"),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: `${this.namespaces.root}.Extensions`,
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
                                namespace: `${this.namespaces.root}.Extensions`
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

    private addInternalRegistration(class_: ast.Class, authProperties: OptionsProperty[]): void {
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
                writer.writeLine(`services.TryAddScoped(provider =>`);

                writer.writeLine("{");
                writer.indent();
                writer.writeLine(
                    `var options = provider.GetRequiredService<Microsoft.Extensions.Options.IOptionsSnapshot<${this.optionsClassName}>>().Value;`
                );
                writer.writeLine(
                    `var httpClientFactory = provider.GetRequiredService<System.Net.Http.IHttpClientFactory>();`
                );
                writer.writeLine("");
                writer.writeLine(`var clientOptions = new ClientOptions`);
                writer.writeLine("{");
                writer.indent();
                writer.writeLine(`HttpClient = httpClientFactory.CreateClient("${this.clientName}"),`);
                writer.writeLine("MaxRetries = options.MaxRetries,");
                writer.writeLine("Timeout = options.Timeout,");
                writer.dedent();
                writer.writeLine("};");
                writer.writeLine("");
                writer.writeLine(`if (!string.IsNullOrEmpty(options.BaseUrl))`);
                writer.writeLine("{");
                writer.indent();
                writer.writeLine("clientOptions.BaseUrl = options.BaseUrl;");
                writer.dedent();
                writer.writeLine("}");
                writer.writeLine("");

                // Build constructor arguments
                const constructorArgs = authProperties.map((p) => `options.${p.pascalName}`);
                constructorArgs.push("clientOptions");

                writer.writeLine(`return new ${this.clientName}(${constructorArgs.join(", ")});`);
                writer.dedent();
                writer.writeLine("});");
                writer.writeLine("");
                writer.writeLine("return services;");
            })
        });
    }
}
