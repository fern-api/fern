import { CSharpFile, FileGenerator, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { SdkCustomConfigSchema } from "../../SdkCustomConfig";
import { MOCK_SERVER_TEST_FOLDER, SdkGeneratorContext } from "../../SdkGeneratorContext";
import { RootClientGenerator } from "../../root-client/RootClientGenerator";

export class BaseMockServerTestGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private readonly rootClientGenerator: RootClientGenerator;
    constructor(context: SdkGeneratorContext) {
        super(context);
        this.rootClientGenerator = new RootClientGenerator(context);
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
                initializer: csharp.codeblock("null!"),
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
                    initializer: csharp.codeblock("null!"),
                    set: true
                })
            );
        }

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
                            includeEnvVarArguments: true
                        })
                    );
                    writer.newLine();

                    writer.writeLine("RequestOptions = ");
                    writer.writeNodeStatement(
                        new csharp.ClassInstantiation({
                            classReference: this.context.getRequestOptionsClassReference(),
                            arguments_: [{ name: "BaseUrl", assignment: csharp.codeblock("Server.Urls[0]") }]
                        })
                    );

                    if (this.context.hasIdempotencyHeaders()) {
                        writer.writeLine("IdempotentRequestOptions = ");
                        writer.writeNodeStatement(
                            new csharp.ClassInstantiation({
                                classReference: this.context.getIdempotentRequestOptionsClassReference(),
                                arguments_: [{ name: "BaseUrl", assignment: csharp.codeblock("Server.Urls[0]") }]
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

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getTestFilesDirectory(),
            MOCK_SERVER_TEST_FOLDER,
            RelativeFilePath.of(`${this.context.getBaseMockServerTestClassReference().name}.cs`)
        );
    }
}
