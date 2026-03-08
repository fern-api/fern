import { ast, CsharpConfigSchema, Generation, type MinimalGeneratorConfig } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

type IntermediateRepresentation = FernIr.IntermediateRepresentation;

function createGeneration(customConfig: CsharpConfigSchema = {}): Generation {
    return new Generation({} as unknown as IntermediateRepresentation, "", customConfig, {} as MinimalGeneratorConfig);
}

describe("DI generation patterns", () => {
    describe("ServiceCollectionExtensions class structure", () => {
        it("generates a static class with extension methods", () => {
            const generation = createGeneration();
            const clazz = generation.csharp.class_({
                reference: generation.csharp.classReference({
                    name: "ServiceCollectionExtensions",
                    namespace: "MyApi"
                }),
                access: ast.Access.Public,
                static_: true
            });

            clazz.addMethod({
                access: ast.Access.Public,
                isAsync: false,
                type: ast.MethodType.STATIC,
                name: "AddMyApiClient",
                summary:
                    'Registers the <see cref="MyApiClient"/> and related services in the dependency injection container.',
                return_: generation.csharp.classReference({
                    name: "IServiceCollection",
                    namespace: "Microsoft.Extensions.DependencyInjection"
                }),
                parameters: [
                    generation.csharp.parameter({
                        name: "services",
                        type: generation.csharp.classReference({
                            name: "IServiceCollection",
                            namespace: "Microsoft.Extensions.DependencyInjection"
                        }),
                        this_: true
                    })
                ],
                body: generation.csharp.codeblock((writer) => {
                    writer.writeLine("services.AddOptions<MyApiClientOptions>()");
                    writer.indent();
                    writer.writeLine('.BindConfiguration("MyApiClient");');
                    writer.dedent();
                    writer.writeLine("");
                    writer.writeLine("return services.AddMyApiClientInternal();");
                })
            });

            const output = clazz.toString({
                namespace: "MyApi",
                allNamespaceSegments: new Set<string>(),
                allTypeClassReferences: new Map<string, Set<string>>(),
                generation
            });

            expect(output).toMatchSnapshot();
        });

        it("generates Action<Options> overload", () => {
            const generation = createGeneration();
            const clazz = generation.csharp.class_({
                reference: generation.csharp.classReference({
                    name: "ServiceCollectionExtensions",
                    namespace: "MyApi"
                }),
                access: ast.Access.Public,
                static_: true
            });

            clazz.addMethod({
                access: ast.Access.Public,
                isAsync: false,
                type: ast.MethodType.STATIC,
                name: "AddMyApiClient",
                summary:
                    'Registers the <see cref="MyApiClient"/> and related services with the specified configuration.',
                return_: generation.csharp.classReference({
                    name: "IServiceCollection",
                    namespace: "Microsoft.Extensions.DependencyInjection"
                }),
                parameters: [
                    generation.csharp.parameter({
                        name: "services",
                        type: generation.csharp.classReference({
                            name: "IServiceCollection",
                            namespace: "Microsoft.Extensions.DependencyInjection"
                        }),
                        this_: true
                    }),
                    generation.csharp.parameter({
                        name: "configure",
                        type: generation.csharp.classReference({
                            name: "Action",
                            namespace: "System",
                            generics: [
                                generation.csharp.classReference({
                                    name: "MyApiClientOptions",
                                    namespace: "MyApi"
                                })
                            ]
                        })
                    })
                ],
                body: generation.csharp.codeblock((writer) => {
                    writer.writeLine("services.AddOptions<MyApiClientOptions>()");
                    writer.indent();
                    writer.writeLine(".Configure(configure);");
                    writer.dedent();
                    writer.writeLine("");
                    writer.writeLine("return services.AddMyApiClientInternal();");
                })
            });

            const output = clazz.toString({
                namespace: "MyApi",
                allNamespaceSegments: new Set<string>(),
                allTypeClassReferences: new Map<string, Set<string>>(),
                generation
            });

            expect(output).toMatchSnapshot();
        });

        it("generates internal registration with root client and interface", () => {
            const generation = createGeneration();
            const clazz = generation.csharp.class_({
                reference: generation.csharp.classReference({
                    name: "ServiceCollectionExtensions",
                    namespace: "MyApi"
                }),
                access: ast.Access.Public,
                static_: true
            });

            clazz.addMethod({
                access: ast.Access.Private,
                isAsync: false,
                type: ast.MethodType.STATIC,
                name: "AddMyApiClientInternal",
                return_: generation.csharp.classReference({
                    name: "IServiceCollection",
                    namespace: "Microsoft.Extensions.DependencyInjection"
                }),
                parameters: [
                    generation.csharp.parameter({
                        name: "services",
                        type: generation.csharp.classReference({
                            name: "IServiceCollection",
                            namespace: "Microsoft.Extensions.DependencyInjection"
                        }),
                        this_: true
                    })
                ],
                body: generation.csharp.codeblock((writer) => {
                    writer.writeLine('services.AddHttpClient("MyApiClient");');
                    writer.writeLine("");

                    // Root client registration
                    writer.writeLine(
                        "Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped(services, provider =>"
                    );
                    writer.writeLine("{");
                    writer.indent();
                    writer.writeLine(
                        "var options = provider.GetRequiredService<Microsoft.Extensions.Options.IOptionsSnapshot<MyApiClientOptions>>().Value;"
                    );
                    writer.writeLine(
                        "var httpClientFactory = provider.GetRequiredService<System.Net.Http.IHttpClientFactory>();"
                    );
                    writer.writeLine("");
                    writer.writeLine("var clientOptions = new ClientOptions");
                    writer.writeLine("{");
                    writer.indent();
                    writer.writeLine('HttpClient = httpClientFactory.CreateClient("MyApiClient"),');
                    writer.writeLine("MaxRetries = options.MaxRetries,");
                    writer.writeLine("Timeout = options.Timeout,");
                    writer.writeLine('BaseUrl = !string.IsNullOrEmpty(options.BaseUrl) ? options.BaseUrl! : "",');
                    writer.dedent();
                    writer.writeLine("};");
                    writer.writeLine("");
                    writer.writeLine("return new MyApiClient(options.ApiKey!, clientOptions);");
                    writer.dedent();
                    writer.writeLine("});");
                    writer.writeLine("");

                    // Root client interface registration
                    writer.writeLine(
                        "Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<IMyApiClient>(services, provider => provider.GetRequiredService<MyApiClient>());"
                    );
                    writer.writeLine("");

                    // Subclient registrations
                    writer.writeLine(
                        "Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<IServiceClient>(services, provider => provider.GetRequiredService<MyApiClient>().Service);"
                    );
                    writer.writeLine(
                        "Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<ServiceClient>(services, provider => (ServiceClient)provider.GetRequiredService<MyApiClient>().Service);"
                    );
                    writer.writeLine("");
                    writer.writeLine("return services;");
                })
            });

            const output = clazz.toString({
                namespace: "MyApi",
                allNamespaceSegments: new Set<string>(),
                allTypeClassReferences: new Map<string, Set<string>>(),
                generation
            });

            expect(output).toMatchSnapshot();
            // Verify key DI registration patterns are present
            expect(output).toContain("TryAddScoped(services, provider =>");
            expect(output).toContain("TryAddScoped<IMyApiClient>");
            expect(output).toContain("TryAddScoped<IServiceClient>");
            expect(output).toContain("TryAddScoped<ServiceClient>");
            expect(output).toContain("GetRequiredService<MyApiClient>().Service");
        });
    });

    describe("DependencyInjectionOptions class structure", () => {
        it("generates options class with auth and config properties", () => {
            const generation = createGeneration();
            const clazz = generation.csharp.class_({
                reference: generation.csharp.classReference({
                    name: "MyApiClientOptions",
                    namespace: "MyApi"
                }),
                access: ast.Access.Public,
                summary: 'Configuration options for the <see cref="MyApiClient"/> when using dependency injection.'
            });

            // Auth property
            clazz.addField({
                name: "ApiKey",
                access: ast.Access.Public,
                type: generation.Primitive.string.asOptional(),
                get: true,
                set: true,
                summary: "The apiKey to use for authentication."
            });

            // Client config properties
            clazz.addField({
                name: "BaseUrl",
                access: ast.Access.Public,
                type: generation.Primitive.string.asOptional(),
                get: true,
                set: true,
                summary: "The base URL for the API. If not specified, the default environment URL is used."
            });

            const output = clazz.toString({
                namespace: "MyApi",
                allNamespaceSegments: new Set<string>(),
                allTypeClassReferences: new Map<string, Set<string>>(),
                generation
            });

            expect(output).toMatchSnapshot();
            // Verify key properties are present
            expect(output).toContain("ApiKey");
            expect(output).toContain("BaseUrl");
            expect(output).toContain("MyApiClientOptions");
        });
    });

    describe("namespace generation", () => {
        it("uses root namespace without Extensions suffix", () => {
            const generation = createGeneration();
            const clazz = generation.csharp.class_({
                reference: generation.csharp.classReference({
                    name: "ServiceCollectionExtensions",
                    namespace: "MyApi"
                }),
                access: ast.Access.Public,
                static_: true
            });

            const output = clazz.toString({
                namespace: "MyApi",
                allNamespaceSegments: new Set<string>(),
                allTypeClassReferences: new Map<string, Set<string>>(),
                generation
            });

            // Should NOT contain .Extensions namespace
            expect(output).not.toContain("namespace MyApi.Extensions");
        });

        it("options class uses root namespace", () => {
            const generation = createGeneration();
            const clazz = generation.csharp.class_({
                reference: generation.csharp.classReference({
                    name: "MyApiClientOptions",
                    namespace: "MyApi"
                }),
                access: ast.Access.Public
            });

            const output = clazz.toString({
                namespace: "MyApi",
                allNamespaceSegments: new Set<string>(),
                allTypeClassReferences: new Map<string, Set<string>>(),
                generation
            });

            expect(output).not.toContain("namespace MyApi.Extensions");
        });
    });

    describe("config key integration", () => {
        it("generateDiExtensions returns true when generate-dependency-injection-extensions is true", () => {
            const generation = createGeneration({
                "generate-dependency-injection-extensions": true
            });
            expect(generation.settings.generateDiExtensions).toBe(true);
        });

        it("generateDiExtensions returns false when generate-dependency-injection-extensions is false", () => {
            const generation = createGeneration({
                "generate-dependency-injection-extensions": false
            });
            expect(generation.settings.generateDiExtensions).toBe(false);
        });

        it("generateDiExtensions defaults to false when not provided", () => {
            const generation = createGeneration({});
            expect(generation.settings.generateDiExtensions).toBe(false);
        });
    });

    describe("IConfigurationSection overload", () => {
        it("generates IConfigurationSection parameter overload", () => {
            const generation = createGeneration();
            const clazz = generation.csharp.class_({
                reference: generation.csharp.classReference({
                    name: "ServiceCollectionExtensions",
                    namespace: "MyApi"
                }),
                access: ast.Access.Public,
                static_: true
            });

            clazz.addMethod({
                access: ast.Access.Public,
                isAsync: false,
                type: ast.MethodType.STATIC,
                name: "AddMyApiClient",
                summary:
                    'Registers the <see cref="MyApiClient"/> and related services with configuration from the specified <see cref="IConfigurationSection"/>.',
                return_: generation.csharp.classReference({
                    name: "IServiceCollection",
                    namespace: "Microsoft.Extensions.DependencyInjection"
                }),
                parameters: [
                    generation.csharp.parameter({
                        name: "services",
                        type: generation.csharp.classReference({
                            name: "IServiceCollection",
                            namespace: "Microsoft.Extensions.DependencyInjection"
                        }),
                        this_: true
                    }),
                    generation.csharp.parameter({
                        name: "configurationSection",
                        type: generation.csharp.classReference({
                            name: "IConfigurationSection",
                            namespace: "Microsoft.Extensions.Configuration"
                        })
                    })
                ],
                body: generation.csharp.codeblock((writer) => {
                    writer.writeLine("services.AddOptions<MyApiClientOptions>()");
                    writer.indent();
                    writer.writeLine(".Bind(configurationSection);");
                    writer.dedent();
                    writer.writeLine("");
                    writer.writeLine("return services.AddMyApiClientInternal();");
                })
            });

            const output = clazz.toString({
                namespace: "MyApi",
                allNamespaceSegments: new Set<string>(),
                allTypeClassReferences: new Map<string, Set<string>>(),
                generation
            });

            expect(output).toMatchSnapshot();
            expect(output).toContain("IConfigurationSection configurationSection");
            expect(output).toContain(".Bind(configurationSection)");
        });
    });
});
