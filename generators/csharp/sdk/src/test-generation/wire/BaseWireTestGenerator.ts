import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { SdkCustomConfigSchema } from "../../SdkCustomConfig";
import { SdkGeneratorContext, WIRE_TEST_FOLDER } from "../../SdkGeneratorContext";

/*
code to generate:

[TestFixture]
public abstract class BaseWireTest
{
    protected static Pinecone Client => GlobalTestSetup.Client;
    protected static WireMockServer Server => GlobalTestSetup.Server;
    
    [TearDown]
    public void BaseTearDown()
    {
        // Reset the WireMock server after each test
        Server.Reset();
    }
}
*/
export class BaseWireTestGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    constructor(context: SdkGeneratorContext) {
        super(context);
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.context.getBaseWireTestClassReference(),
            partial: false,
            access: "public",
            abstract: true,
            annotations: [
                csharp.annotation({
                    reference: csharp.classReference({ name: "TestFixture", namespace: "NUnit.Framework" })
                })
            ]
        });

        class_.addField(
            csharp.field({
                access: "protected",
                name: "Server",
                static_: true,
                type: csharp.Type.reference(
                    csharp.classReference({
                        name: "WireMockServer",
                        namespace: "WireMock.Server"
                    })
                ),
                get: true,
                initializer: csharp.codeblock("GlobalTestSetup.Server"),
                set: true
            })
        );

        class_.addField(
            csharp.field({
                access: "protected",
                name: "Client",
                static_: true,
                type: csharp.Type.reference(
                    csharp.classReference({
                        name: this.context.getRootClientClassName(),
                        namespace: this.context.getNamespace()
                    })
                ),
                get: true,
                initializer: csharp.codeblock("GlobalTestSetup.Client"),
                set: true
            })
        );

        class_.addMethod(
            csharp.method({
                name: "BaseTearDown",
                access: "public",
                body: csharp.codeblock((writer) => {
                    writer.writeLine("// Reset the WireMock server after each test");
                    writer.writeLine("Server.Reset();;;");
                }),
                isAsync: false,
                parameters: [],
                annotations: [
                    csharp.annotation({
                        reference: csharp.classReference({ name: "TearDown", namespace: "NUnit.Framework" })
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
            RelativeFilePath.of(`${this.context.getBaseWireTestClassReference().name}.cs`)
        );
    }
}
