import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { SdkCustomConfigSchema } from "../../SdkCustomConfig";
import { SdkGeneratorContext, WIRE_TEST_FOLDER } from "../../SdkGeneratorContext";

export class GlobalTestSetupGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    constructor(context: SdkGeneratorContext) {
        super(context);
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.context.getGlobalTestSetupClassReference(),
            partial: false,
            access: "public",
            annotations: [
                csharp.annotation({
                    reference: csharp.classReference({ name: "SetUpFixture", namespace: "NUnit.Framework" })
                })
            ]
        });

        class_.addField(
            csharp.field({
                access: "public",
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
                access: "public",
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

        class_.addMethod(
            csharp.method({
                name: "GlobalSetup",
                access: "public",
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
                    writer.writeLine(`Client = new ${this.context.getRootClientClassName()}("API_KEY", new `);
                    writer.writeNode(this.context.getClientOptionsClassReference());
                    writer.write(" { BaseUrl = Server.Urls[0] });");
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
                access: "public",
                body: csharp.codeblock((writer) => {
                    writer.writeLine("Server.Stop();");
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
            directory: WIRE_TEST_FOLDER
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getTestFilesDirectory(),
            WIRE_TEST_FOLDER,
            RelativeFilePath.of(`${this.context.getGlobalTestSetupClassReference().name}.cs`)
        );
    }
}
