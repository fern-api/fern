import { NamedArgument } from "@fern-api/base-generator";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { ExampleEndpointCall, Name, OAuthScheme } from "@fern-fern/ir-sdk/api";
import { MultiUrlEnvironmentGenerator } from "../../environment/MultiUrlEnvironmentGenerator";
import { RootClientGenerator } from "../../root-client/RootClientGenerator";
import { SdkCustomConfigSchema } from "../../SdkCustomConfig";
import { MOCK_SERVER_TEST_FOLDER, SdkGeneratorContext } from "../../SdkGeneratorContext";
import { MockEndpointGenerator } from "./MockEndpointGenerator";

const MOCK_OAUTH_METHOD_NAME = "MockOAuthEndpoint";

export class BaseMockServerTestGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private readonly rootClientGenerator: RootClientGenerator;
    private readonly mockEndpointGenerator: MockEndpointGenerator;
    constructor(context: SdkGeneratorContext) {
        super(context);
        this.rootClientGenerator = new RootClientGenerator(context);
        this.mockEndpointGenerator = new MockEndpointGenerator(context);
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            ...this.context.getBaseMockServerTestClassReference(),
            partial: false,
            access: ast.Access.Public,
            annotations: [
                this.csharp.annotation({
                    reference: this.csharp.classReference({ name: "SetUpFixture", namespace: "NUnit.Framework" })
                })
            ]
        });

        class_.addField(
            this.csharp.field({
                access: ast.Access.Protected,
                name: "Server",
                static_: true,
                type: this.csharp.Type.reference(
                    this.csharp.classReference({
                        name: "WireMockServer",
                        namespace: "WireMock.Server"
                    })
                ),
                get: true,
                initializer: this.csharp.codeblock("null!"),
                set: true
            })
        );

        class_.addField(
            this.csharp.field({
                access: ast.Access.Protected,
                name: "Client",
                static_: true,
                type: this.csharp.Type.reference(
                    this.csharp.classReference({
                        name: this.context.getRootClientClassName(),
                        namespace: this.context.getNamespace()
                    })
                ),
                get: true,
                initializer: this.csharp.codeblock("null!"),
                set: true
            })
        );

        class_.addField(
            this.csharp.field({
                access: ast.Access.Protected,
                name: "RequestOptions",
                static_: true,
                type: this.csharp.Type.reference(this.context.getRequestOptionsClassReference()),
                get: true,
                initializer: this.csharp.codeblock("new()"),
                set: true
            })
        );

        if (this.context.hasIdempotencyHeaders()) {
            class_.addField(
                this.csharp.field({
                    access: ast.Access.Protected,
                    name: "IdempotentRequestOptions",
                    static_: true,
                    type: this.csharp.Type.reference(this.context.getIdempotentRequestOptionsClassReference()),
                    get: true,
                    initializer: this.csharp.codeblock("new()"),
                    set: true
                })
            );
        }

        const oauth = this.context.getOauth();

        class_.addMethod(
            this.csharp.method({
                name: "GlobalSetup",
                access: ast.Access.Public,
                body: this.csharp.codeblock((writer) => {
                    writer.writeLine("// Start the WireMock server");
                    writer.write("Server = WireMockServer.Start(new ");
                    writer.writeNode(
                        this.csharp.classReference({
                            name: "WireMockServerSettings",
                            namespace: "WireMock.Settings"
                        })
                    );
                    writer.write(" { Logger = new ");
                    writer.writeNode(
                        this.csharp.classReference({
                            name: "WireMockConsoleLogger",
                            namespace: "WireMock.Logging"
                        })
                    );
                    writer.writeTextStatement("() })");
                    writer.newLine();

                    writer.writeLine("// Initialize the Client");
                    writer.writeLine("Client = ");
                    writer.writeNodeStatement(
                        this.rootClientGenerator.generateExampleClientInstantiationSnippet({
                            includeEnvVarArguments: true,
                            clientOptionsArgument: this.csharp.instantiateClass({
                                classReference: this.context.getClientOptionsClassReference(),
                                arguments_: [
                                    this.context.ir.environments?.environments._visit<NamedArgument>({
                                        singleBaseUrl: () => ({
                                            name: "BaseUrl",
                                            assignment: this.csharp.codeblock("Server.Urls[0]")
                                        }),
                                        multipleBaseUrls: (value) => {
                                            const environments = new MultiUrlEnvironmentGenerator({
                                                context: this.context,
                                                multiUrlEnvironments: value
                                            });
                                            return {
                                                name: "Environment",
                                                assignment: environments.generateSnippet(
                                                    this.csharp.codeblock("Server.Urls[0]")
                                                )
                                            };
                                        },
                                        _other: () => {
                                            throw new Error("Internal error; Unexpected environment type");
                                        }
                                    }) ?? { name: "BaseUrl", assignment: this.csharp.codeblock("Server.Urls[0]") },
                                    { name: "MaxRetries", assignment: this.csharp.codeblock("0") }
                                ]
                            })
                        })
                    );

                    if (oauth) {
                        writer.writeNodeStatement(
                            this.csharp.invokeMethod({
                                method: MOCK_OAUTH_METHOD_NAME,
                                arguments_: []
                            })
                        );
                    }
                }),
                isAsync: false,
                parameters: [],
                annotations: [
                    this.csharp.annotation({
                        reference: this.csharp.classReference({ name: "OneTimeSetUp", namespace: "NUnit.Framework" })
                    })
                ]
            })
        );

        if (oauth) {
            class_.addMethod(this.generateMockAuthMethod(oauth));
        }

        class_.addMethod(
            this.csharp.method({
                name: "GlobalTeardown",
                access: ast.Access.Public,
                body: this.csharp.codeblock((writer) => {
                    writer.writeLine("Server.Stop();");
                    writer.writeLine("Server.Dispose();");
                }),
                isAsync: false,
                parameters: [],
                annotations: [
                    this.csharp.annotation({
                        reference: this.csharp.classReference({ name: "OneTimeTearDown", namespace: "NUnit.Framework" })
                    })
                ]
            })
        );

        return new CSharpFile({
            clazz: class_,
            directory: MOCK_SERVER_TEST_FOLDER,
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected generateMockAuthMethod(scheme: OAuthScheme): ast.Method {
        const shouldScope = !!scheme.configuration.refreshEndpoint;
        return this.csharp.method({
            access: ast.Access.Private,
            name: MOCK_OAUTH_METHOD_NAME,
            parameters: [],
            body: this.csharp.codeblock((writer) => {
                if (shouldScope) {
                    writer.writeLine("{");
                    writer.indent();
                }
                // token endpoint
                const tokenEndpointReference = scheme.configuration.tokenEndpoint.endpointReference;
                const tokenEndpointHttpService = this.context.getHttpServiceOrThrow(tokenEndpointReference.serviceId);
                const tokenHttpEndpoint = this.context.resolveEndpointOrThrow(
                    tokenEndpointHttpService,
                    tokenEndpointReference.endpointId
                );
                const tokenAllExamples = [
                    ...tokenHttpEndpoint.autogeneratedExamples,
                    ...tokenHttpEndpoint.userSpecifiedExamples
                ].map((example) => example.example);
                // TODO: support other response body types
                const tokenUseableExamples = tokenAllExamples.filter((example): example is ExampleEndpointCall => {
                    const response = example?.response;
                    return response?.type === "ok" && response.value.type === "body";
                });
                tokenUseableExamples.forEach((example) => {
                    const jsonExample = example.request?.jsonExample as Record<string, unknown> | undefined;
                    if (!jsonExample) {
                        return;
                    }
                    deepSetProperty(
                        jsonExample,
                        scheme.configuration.tokenEndpoint.requestProperties.clientId.propertyPath,
                        scheme.configuration.tokenEndpoint.requestProperties.clientId.property.name.name,
                        "CLIENT_ID"
                    );
                    deepSetProperty(
                        jsonExample,
                        scheme.configuration.tokenEndpoint.requestProperties.clientSecret.propertyPath,
                        scheme.configuration.tokenEndpoint.requestProperties.clientSecret.property.name.name,
                        "CLIENT_SECRET"
                    );
                });
                writer.writeNode(
                    this.mockEndpointGenerator.generateForExamples(tokenHttpEndpoint, tokenUseableExamples)
                );
                if (shouldScope) {
                    writer.writeLine("}");
                    writer.dedent();
                }

                // refresh endpoint
                if (shouldScope) {
                    writer.writeLine("{");
                    writer.indent();
                }
                if (scheme.configuration.refreshEndpoint) {
                    const refreshEndpointReference = scheme.configuration.refreshEndpoint.endpointReference;
                    const refreshEndpointHttpService = this.context.getHttpServiceOrThrow(
                        refreshEndpointReference.serviceId
                    );
                    const refreshHttpEndpoint = this.context.resolveEndpointOrThrow(
                        refreshEndpointHttpService,
                        refreshEndpointReference.endpointId
                    );
                    const refreshAllExamples = [
                        ...refreshHttpEndpoint.autogeneratedExamples,
                        ...refreshHttpEndpoint.userSpecifiedExamples
                    ].map((example) => example.example);
                    // TODO: support other response body types
                    const refreshUseableExamples = refreshAllExamples.filter(
                        (example): example is ExampleEndpointCall => {
                            const response = example?.response;
                            return response?.type === "ok" && response.value.type === "body";
                        }
                    );
                    writer.writeNode(
                        this.mockEndpointGenerator.generateForExamples(refreshHttpEndpoint, refreshUseableExamples)
                    );
                }
                if (shouldScope) {
                    writer.writeLine("}");
                    writer.dedent();
                }
            })
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getTestFilesDirectory(),
            MOCK_SERVER_TEST_FOLDER,
            RelativeFilePath.of(`${this.context.getBaseMockServerTestClassReference().name}.cs`)
        );
    }
}

/**
 * Deep sets a property on an object if the property path exists
 * @param obj The object to modify
 * @param path Array of property names forming the path to the property
 * @param finalProp The final property name to set
 * @param value The value to set the property to
 * @returns A boolean indicating if the property was set
 */
function deepSetProperty(
    obj: Record<string, unknown>,
    path: Name[] | undefined,
    finalProp: Name,
    value: unknown
): boolean {
    // Start with the provided object
    let current: Record<string, unknown> | unknown = obj;
    if (!path) {
        path = [];
    }
    // Traverse the path
    for (const prop of path) {
        if (current == null || typeof current !== "object") {
            return false;
        }
        if (prop.originalName in current === false) {
            // Property path doesn't exist, return false
            return false;
        }

        // Move to the next level
        current = (current as Record<string, unknown>)[prop.originalName];
    }

    // Check if the final property exists at the current level
    if (current == null || typeof current !== "object") {
        return false;
    }
    if (finalProp.originalName in current === false) {
        // Property path doesn't exist, return false
        return false;
    }
    // Set the property value
    (current as Record<string, unknown>)[finalProp.originalName] = value;
    return true;
}
