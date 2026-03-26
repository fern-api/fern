import { CSharpFile, FileGenerator, GrpcClientInfo } from "@fern-api/csharp-base";
import { ast, Writer } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { RootClientGenerator } from "../../root-client/RootClientGenerator.js";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { GrpcStubGenerator } from "./GrpcStubGenerator.js";

/**
 * Generates the BaseGrpcMockServerTest base class that handles all the
 * ceremony of creating stubs, building the mock server, and instantiating
 * the SDK client. Individual test classes inherit from this and only
 * contain the unique test-specific code (stub configuration, method call,
 * assertion).
 */
export class BaseGrpcMockServerTestGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private readonly rootClientGenerator: RootClientGenerator;
    private readonly stubGenerators: GrpcStubGenerator[];
    private readonly grpcClientInfos: GrpcClientInfo[];

    constructor(context: SdkGeneratorContext, stubGenerators: GrpcStubGenerator[], grpcClientInfos: GrpcClientInfo[]) {
        super(context);
        this.rootClientGenerator = new RootClientGenerator(context);
        this.stubGenerators = stubGenerators;
        this.grpcClientInfos = grpcClientInfos;
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.Types.BaseGrpcMockServerTest,
            partial: false,
            access: ast.Access.Public
        });

        // Add stub properties (one per gRPC service)
        for (const stubGenerator of this.stubGenerators) {
            const stubClassName = stubGenerator.getStubClassName();
            class_.addField({
                origin: class_.explicit(stubClassName),
                access: ast.Access.Protected,
                type: this.csharp.classReference({
                    name: stubClassName,
                    namespace: this.namespaces.mockServerTest
                }),
                get: true,
                initializer: this.csharp.codeblock("null!"),
                set: true
            });
        }

        // Add Client property
        class_.addField({
            origin: class_.explicit("Client"),
            access: ast.Access.Protected,
            type: this.Types.RootClient,
            get: true,
            initializer: this.csharp.codeblock("null!"),
            set: true
        });

        // Add private _mock field
        class_.addField({
            origin: class_.explicit("_mock"),
            access: ast.Access.Private,
            type: this.csharp.classReference({
                name: "GrpcMockServer",
                namespace: this.namespaces.mockServerTest
            }),
            initializer: this.csharp.codeblock("null!")
        });

        // Add [OneTimeSetUp] method
        class_.addMethod({
            name: "GlobalSetup",
            access: ast.Access.Public,
            body: this.csharp.codeblock((writer: Writer) => {
                // Create stubs
                for (const stubGenerator of this.stubGenerators) {
                    const stubClassName = stubGenerator.getStubClassName();
                    writer.writeTextStatement(`${stubClassName} = new ${stubClassName}()`);
                }
                writer.newLine();

                // Build mock server
                writer.writeLine("_mock = await GrpcMockServerBuilder.Configure()");
                for (const stubGenerator of this.stubGenerators) {
                    const serviceBaseClassName = stubGenerator.getServiceBaseClassName();
                    const stubClassName = stubGenerator.getStubClassName();
                    writer.writeLine(`    .WithService<${serviceBaseClassName}>(${stubClassName})`);
                }
                writer.writeTextStatement("    .BuildAsync()");
                writer.newLine();

                // Instantiate client
                writer.addNamespace("Grpc.Net.Client");
                writer.write("Client = ");
                writer.writeNodeStatement(
                    this.rootClientGenerator.generateExampleClientInstantiationSnippet({
                        includeEnvVarArguments: true,
                        asSnippet: false,
                        clientOptionsArgument: this.csharp.instantiateClass({
                            classReference: this.Types.ClientOptions,
                            arguments_: [
                                {
                                    name: "BaseUrl",
                                    assignment: this.csharp.codeblock('"http://localhost"')
                                },
                                { name: "MaxRetries", assignment: this.csharp.codeblock("0") },
                                {
                                    name: "GrpcOptions",
                                    assignment: this.csharp.codeblock((w) => {
                                        w.writeLine("new GrpcChannelOptions");
                                        w.writeLine("{");
                                        w.writeLine("    HttpClient = _mock.HttpClient,");
                                        w.write("}");
                                    })
                                }
                            ]
                        })
                    })
                );
            }),
            isAsync: true,
            parameters: [],
            annotations: [this.NUnit.Framework.OneTimeSetUp]
        });

        // Add [OneTimeTearDown] method
        class_.addMethod({
            name: "GlobalTeardown",
            access: ast.Access.Public,
            body: this.csharp.codeblock((writer: Writer) => {
                writer.writeTextStatement("await _mock.DisposeAsync()");
            }),
            isAsync: true,
            parameters: [],
            annotations: [this.NUnit.Framework.OneTimeTearDown]
        });

        // Add ParseProtoJson<T> helper method
        class_.addRawBodyContent(
            this.csharp.codeblock((writer: Writer) => {
                writer.addNamespace("Google.Protobuf");
                writer.writeLine("protected static T ParseProtoJson<T>(string json) where T : IMessage<T>, new()");
                writer.pushScope();
                writer.writeLine("var settings = JsonParser.Settings.Default.WithIgnoreUnknownFields(true);");
                writer.writeLine("return new JsonParser(settings).Parse<T>(json);");
                writer.popScope();
            })
        );

        return new CSharpFile({
            clazz: class_,
            directory: this.constants.folders.mockServerTests,
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.constants.folders.testFiles,
            this.generation.constants.folders.mockServerTests,
            RelativeFilePath.of(`${this.Types.BaseGrpcMockServerTest.name}.cs`)
        );
    }
}
