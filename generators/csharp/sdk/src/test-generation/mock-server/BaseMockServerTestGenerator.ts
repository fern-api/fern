import { NamedArgument } from "@fern-api/base-generator";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { ExampleEndpointCall, OAuthScheme } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../../SdkCustomConfig";
import { MOCK_SERVER_TEST_FOLDER, SdkGeneratorContext } from "../../SdkGeneratorContext";
import { MultiUrlEnvironmentGenerator } from "../../environment/MultiUrlEnvironmentGenerator";
import { RootClientGenerator } from "../../root-client/RootClientGenerator";
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
        const class_ = csharp.class_({
            ...this.context.getBaseMockServerTestClassReference(),
            partial: false,
            access: csharp.Access.Public,
            annotations: [
                csharp.annotation({
                    reference: csharp.classReference({ name: "SetUpFixture", namespace: "NUnit.Framework" })
                })
            ]
        });

        class_.addField(
            csharp.field({
                access: csharp.Access.Protected,
                name: "Server",
                static_: true,
                type: csharp.Type.reference(
                    csharp.classReference({
                        name: "WireMockServer",
                        namespace: "WireMock.Server"
                    })
                ),
                get: true,
                initializer: csharp.codeblock("null!"),
                set: true
            })
        );

        class_.addField(
            csharp.field({
                access: csharp.Access.Protected,
                name: "Client",
                static_: true,
                type: csharp.Type.reference(
                    csharp.classReference({
                        name: this.context.getRootClientClassName(),
                        namespace: this.context.getNamespace()
                    })
                ),
                get: true,
                initializer: csharp.codeblock("null!"),
                set: true
            })
        );

        class_.addField(
            csharp.field({
                access: csharp.Access.Protected,
                name: "RequestOptions",
                static_: true,
                type: csharp.Type.reference(this.context.getRequestOptionsClassReference()),
                get: true,
                initializer: csharp.codeblock("new()"),
                set: true
            })
        );

        if (this.context.hasIdempotencyHeaders()) {
            class_.addField(
                csharp.field({
                    access: csharp.Access.Protected,
                    name: "IdempotentRequestOptions",
                    static_: true,
                    type: csharp.Type.reference(this.context.getIdempotentRequestOptionsClassReference()),
                    get: true,
                    initializer: csharp.codeblock("new()"),
                    set: true
                })
            );
        }

        const oauth = this.context.getOauth();

        class_.addMethod(
            csharp.method({
                name: "GlobalSetup",
                access: csharp.Access.Public,
                body: csharp.codeblock((writer) => {
                    writer.writeLine("// Start the WireMock server");
                    writer.write("Server = WireMockServer.Start(new ");
                    writer.writeNode(
                        csharp.classReference({
                            name: "WireMockServerSettings",
                            namespace: "WireMock.Settings"
                        })
                    );
                    writer.write(" { Logger = new ");
                    writer.writeNode(
                        csharp.classReference({
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
                            clientOptionsArgument: csharp.instantiateClass({
                                classReference: this.context.getClientOptionsClassReference(),
                                arguments_: [
                                    this.context.ir.environments?.environments._visit<NamedArgument>({
                                        singleBaseUrl: () => ({
                                            name: "BaseUrl",
                                            assignment: csharp.codeblock("Server.Urls[0]")
                                        }),
                                        multipleBaseUrls: (value) => {
                                            const environments = new MultiUrlEnvironmentGenerator({
                                                context: this.context,
                                                multiUrlEnvironments: value
                                            });
                                            return {
                                                name: "Environment",
                                                assignment: environments.generateSnippet(
                                                    csharp.codeblock("Server.Urls[0]")
                                                )
                                            };
                                        },
                                        _other: () => {
                                            throw new Error("Internal error; Unexpected environment type");
                                        }
                                    }) ?? { name: "BaseUrl", assignment: csharp.codeblock("Server.Urls[0]") },
                                    { name: "MaxRetries", assignment: csharp.codeblock("0") }
                                ]
                            })
                        })
                    );

                    if (oauth) {
                        writer.writeNodeStatement(
                            csharp.invokeMethod({
                                method: MOCK_OAUTH_METHOD_NAME,
                                arguments_: []
                            })
                        );
                    }
                }),
                isAsync: false,
                parameters: [],
                annotations: [
                    csharp.annotation({
                        reference: csharp.classReference({ name: "OneTimeSetUp", namespace: "NUnit.Framework" })
                    })
                ]
            })
        );

        if (oauth) {
            class_.addMethod(this.generateMockAuthMethod(oauth));
        }

        class_.addMethod(
            csharp.method({
                name: "GlobalTeardown",
                access: csharp.Access.Public,
                body: csharp.codeblock((writer) => {
                    writer.writeLine("Server.Stop();");
                    writer.writeLine("Server.Dispose();");
                }),
                isAsync: false,
                parameters: [],
                annotations: [
                    csharp.annotation({
                        reference: csharp.classReference({ name: "OneTimeTearDown", namespace: "NUnit.Framework" })
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

    protected generateMockAuthMethod(scheme: OAuthScheme): csharp.Method {
        const tokenEndpointReference = scheme.configuration.tokenEndpoint.endpointReference;
        const tokenEndpointHttpService = this.context.getHttpServiceOrThrow(tokenEndpointReference.serviceId);
        const httpEndpoint = this.context.resolveEndpointOrThrow(
            tokenEndpointHttpService,
            tokenEndpointReference.endpointId
        );
        const allExamples = [...httpEndpoint.autogeneratedExamples, ...httpEndpoint.userSpecifiedExamples].map(
            (example) => example.example
        );
        // TODO: support other response body types
        const useableExamples = allExamples.filter((example): example is ExampleEndpointCall => {
            const response = example?.response;
            return response?.type === "ok" && response.value.type === "body";
        });
        useableExamples.forEach((example) => {
            const jsonExample = example.request?.jsonExample as Record<string, unknown> | undefined;
            if (!jsonExample) {
                return;
            }
            for (const prop in jsonExample) {
                let value = jsonExample[prop];
                if (typeof value === "string") {
                    value = value.toLowerCase();
                    if (value === "client_id") {
                        jsonExample[prop] = "CLIENT_ID";
                    }
                    if (value === "client_secret") {
                        jsonExample[prop] = "CLIENT_SECRET";
                    }
                }
            }
        });
        return csharp.method({
            access: csharp.Access.Private,
            name: MOCK_OAUTH_METHOD_NAME,
            parameters: [],
            body: this.mockEndpointGenerator.generateForExamples(httpEndpoint, useableExamples)
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
