import { NamedArgument } from "@fern-api/base-generator";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ExampleEndpointCall, Name, OAuthScheme } from "@fern-fern/ir-sdk/api";
import { MultiUrlEnvironmentGenerator } from "../../environment/MultiUrlEnvironmentGenerator";
import { RootClientGenerator } from "../../root-client/RootClientGenerator";
import { SdkCustomConfigSchema } from "../../SdkCustomConfig";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { MockEndpointGenerator } from "./MockEndpointGenerator";

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
            reference: this.types.BaseMockServerTest,
            partial: false,
            access: ast.Access.Public,
            annotations: [this.extern.NUnit.Framework.SetUpFixture]
        });

        class_.addField({
            origin: class_.explicit("Server"),
            access: ast.Access.Protected,
            static_: true,
            type: this.csharp.Type.reference(this.extern.WireMock.Server),
            get: true,
            initializer: this.csharp.codeblock("null!"),
            set: true
        });

        class_.addField({
            origin: class_.explicit("Client"),
            access: ast.Access.Protected,
            static_: true,
            type: this.csharp.Type.reference(this.types.RootClient),
            get: true,
            initializer: this.csharp.codeblock("null!"),
            set: true
        });

        class_.addField({
            origin: class_.explicit("RequestOptions"),
            access: ast.Access.Protected,
            static_: true,
            type: this.csharp.Type.reference(this.types.RequestOptions),
            get: true,
            initializer: this.csharp.codeblock("new()"),
            set: true
        });

        if (this.context.common.hasIdempotencyHeaders()) {
            // create an initializer for the fields
            const initializer = this.csharp.codeblock((writer) => {
                writer.writeLine("new()");
                writer.pushScope();
                this.context.common.getIdempotencyInitializers(writer);
                writer.popScope();
            });

            class_.addField({
                origin: class_.explicit("IdempotentRequestOptions"),
                access: ast.Access.Protected,
                static_: true,
                type: this.csharp.Type.reference(this.types.IdempotentRequestOptions),
                get: true,
                initializer,
                set: true
            });
        }

        const oauth = this.context.getOauth();

        class_.addMethod({
            name: "GlobalSetup",
            access: ast.Access.Public,
            body: this.csharp.codeblock((writer) => {
                writer.writeLine("// Start the WireMock server");
                writer.writeStatement(
                    "Server = WireMockServer.Start(new ",
                    this.extern.WireMock.WireMockServerSettings,
                    " { Logger = new ",
                    this.extern.WireMock.WireMockConsoleLogger,
                    "() })"
                );
                writer.writeLine();

                writer.writeLine("// Initialize the Client");
                writer.writeLine("Client = ");
                writer.writeNodeStatement(
                    this.rootClientGenerator.generateExampleClientInstantiationSnippet({
                        includeEnvVarArguments: true,
                        clientOptionsArgument: this.csharp.instantiateClass({
                            classReference: this.types.ClientOptions,
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
                            method: this.names.methods.mockOauth,
                            arguments_: []
                        })
                    );
                }
            }),
            isAsync: false,
            parameters: [],
            annotations: [this.extern.NUnit.Framework.OneTimeSetUp]
        });

        if (oauth) {
            this.generateMockAuthMethod(oauth, class_);
        }

        class_.addMethod({
            name: "GlobalTeardown",
            access: ast.Access.Public,
            body: this.csharp.codeblock((writer) => {
                writer.writeLine("Server.Stop();");
                writer.writeLine("Server.Dispose();");
            }),
            isAsync: false,
            parameters: [],
            annotations: [this.extern.NUnit.Framework.OneTimeTearDown]
        });

        return new CSharpFile({
            clazz: class_,
            directory: this.constants.folders.mockServerTests,
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    protected generateMockAuthMethod(scheme: OAuthScheme, cls: ast.Class) {
        const shouldScope = !!scheme.configuration.refreshEndpoint;
        cls.addMethod({
            access: ast.Access.Private,
            name: this.names.methods.mockOauth,
            parameters: [],
            body: this.csharp.codeblock((writer) => {
                if (shouldScope) {
                    writer.pushScope();
                }
                // token endpoint
                const tokenEndpointReference = scheme.configuration.tokenEndpoint.endpointReference;
                const tokenEndpointHttpService = this.context.common.getHttpServiceOrThrow(
                    tokenEndpointReference.serviceId
                );
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
                        scheme.configuration.tokenEndpoint.requestProperties.clientId.propertyPath?.map(
                            (val) => val.name
                        ) ?? [],
                        scheme.configuration.tokenEndpoint.requestProperties.clientId.property.name.name,
                        "CLIENT_ID"
                    );
                    deepSetProperty(
                        jsonExample,
                        scheme.configuration.tokenEndpoint.requestProperties.clientSecret.propertyPath?.map(
                            (val) => val.name
                        ) ?? [],
                        scheme.configuration.tokenEndpoint.requestProperties.clientSecret.property.name.name,
                        "CLIENT_SECRET"
                    );
                });
                writer.writeNode(
                    this.mockEndpointGenerator.generateForExamples(tokenHttpEndpoint, tokenUseableExamples)
                );
                if (shouldScope) {
                    writer.popScope();
                }

                // refresh endpoint
                if (shouldScope) {
                    writer.pushScope();
                }
                if (scheme.configuration.refreshEndpoint) {
                    const refreshEndpointReference = scheme.configuration.refreshEndpoint.endpointReference;
                    const refreshEndpointHttpService = this.context.common.getHttpServiceOrThrow(
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
                    writer.popScope();
                }
            })
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.constants.folders.testFiles,
            this.generation.constants.folders.mockServerTests,
            RelativeFilePath.of(`${this.types.BaseMockServerTest.name}.cs`)
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
