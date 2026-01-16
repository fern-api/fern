import { CSharpFile, FileGenerator, GrpcClientInfo } from "@fern-api/csharp-base";
import { ast, lazy } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { HttpService, ServiceId, Subpackage } from "@fern-fern/ir-sdk/api";
import { RawClient } from "../endpoint/http/RawClient";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { WebSocketClientGenerator } from "../websocket/WebsocketClientGenerator";

export declare namespace SubClientGenerator {
    interface Args {
        subpackage: Subpackage;
        context: SdkGeneratorContext;
        serviceId?: ServiceId;
        service?: HttpService;
    }
}

export class SubPackageClientGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private classReference: ast.ClassReference;
    private subpackage: Subpackage;
    private serviceId?: ServiceId;
    private service?: HttpService;
    private rawClient: RawClient;
    private grpcClientInfo: GrpcClientInfo | undefined;

    constructor({ subpackage, context, serviceId, service }: SubClientGenerator.Args) {
        super(context);
        this.classReference = this.context.getSubpackageClassReference(subpackage);
        this.subpackage = subpackage;
        this.rawClient = new RawClient(context);
        this.service = service;
        this.serviceId = serviceId;
        this.grpcClientInfo =
            this.serviceId != null ? this.context.getGrpcClientInfoForServiceId(this.serviceId) : undefined;
    }
    private members = lazy({
        client: () => this.classReference.explicit("_client"),
        grpcClient: () => this.classReference.explicit("_grpc"),
        clientName: () => this.model.getPropertyNameFor(this.members.client),
        grpcClientName: () => this.model.getPropertyNameFor(this.members.grpcClient)
    });
    /**
     * Generates the c# factory methods to create the websocket api client.
     *
     * @remarks
     * This method only returns methods if WebSockets are enabled via the `enableWebsockets`
     *
     * @returns an array of ast.Method objects that represent the factory methods.
     */
    private generateWebsocketFactories(cls: ast.Class) {
        // add functions to create the websocket api client
        if (this.settings.enableWebsockets) {
            for (const subpackage of this.getSubpackages()) {
                if (subpackage.websocket != null) {
                    const websocketChannel = this.context.getWebsocketChannel(subpackage.websocket);
                    if (websocketChannel != null) {
                        WebSocketClientGenerator.createWebSocketApiFactories(
                            cls,
                            subpackage,
                            this.context,
                            this.classReference.namespace,
                            websocketChannel
                        );
                    }
                }
            }
        }
    }

    public doGenerate(): CSharpFile {
        const interfaceReference = this.context.getSubpackageInterfaceReference(this.subpackage);
        const class_ = this.csharp.class_({
            reference: this.classReference,
            partial: true,
            access: ast.Access.Public,
            interfaceReferences: [interfaceReference]
        });

        class_.addField({
            origin: this.members.client,
            access: ast.Access.Private,
            type: this.Types.RawClient
        });

        if (this.grpcClientInfo != null) {
            class_.addField({
                origin: this.members.grpcClient,
                access: ast.Access.Private,
                type: this.Types.RawGrpcClient
            });

            class_.addField({
                origin: class_.explicit(this.members.grpcClientName),
                access: ast.Access.Private,
                type: this.grpcClientInfo.classReference
            });
        }

        for (const subpackage of this.getSubpackages()) {
            // skip subpackages that have no endpoints (recursively)
            if (this.context.subPackageHasEndpointsRecursively(subpackage)) {
                class_.addField({
                    origin: subpackage,
                    access: ast.Access.Public,
                    get: true,
                    type: this.context.getSubpackageClassReference(subpackage)
                });
            }
        }

        class_.addConstructor(this.getConstructorMethod());
        if (this.service != null && this.serviceId != null) {
            this.generateEndpoints(class_);
        }

        // add websocket api endpoints if needed
        this.generateWebsocketFactories(class_);

        // add raw access client
        this.generateRawAccessClient(class_);

        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of(this.context.getDirectoryForSubpackage(this.subpackage)),
            allNamespaceSegments: this.registry.allNamespacesOf(this.classReference.namespace),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    private generateEndpoints(cls: ast.Class) {
        const service = this.service;
        if (!service) {
            throw new Error("Internal error; Service is not defined");
        }
        const serviceId = this.serviceId;
        if (!serviceId) {
            throw new Error("Internal error; ServiceId is not defined");
        }
        service.endpoints.flatMap((endpoint) => {
            this.context.endpointGenerator.generate(cls, {
                serviceId,
                endpoint,
                rawClientReference: this.members.clientName,
                rawClient: this.rawClient,
                rawGrpcClientReference: this.members.grpcClientName,
                grpcClientInfo: this.grpcClientInfo
            });
        });
    }

    private getConstructorMethod() {
        const parameters: ast.Parameter[] = [
            this.csharp.parameter({
                name: "client",
                type: this.Types.RawClient
            })
        ];
        return {
            access: ast.Access.Internal,
            parameters,
            body: this.csharp.codeblock((writer) => {
                const writeConstructorBody = (innerWriter: typeof writer) => {
                    innerWriter.writeLine(`${this.members.clientName} = client;`);

                    if (this.grpcClientInfo != null) {
                        innerWriter.writeLine(`${this.members.grpcClient} = ${this.members.clientName}.Grpc;`);
                        innerWriter.write(this.grpcClientInfo.privatePropertyName);
                        innerWriter.write(" = ");
                        innerWriter.writeNodeStatement(
                            this.csharp.instantiateClass({
                                classReference: this.grpcClientInfo.classReference,
                                arguments_: [this.csharp.codeblock(`${this.members.grpcClient}.Channel`)]
                            })
                        );
                    }

                    const arguments_ = [this.csharp.codeblock(this.members.clientName)];
                    for (const subpackage of this.getSubpackages()) {
                        // skip subpackages that are completely empty (recursively)
                        if (this.context.subPackageHasEndpointsRecursively(subpackage)) {
                            innerWriter.writeLine(`${subpackage.name.pascalCase.safeName} = `);
                            innerWriter.writeNodeStatement(
                                this.csharp.instantiateClass({
                                    classReference: this.context.getSubpackageClassReference(subpackage),
                                    arguments_
                                })
                            );
                        }
                    }

                    innerWriter.writeLine(`Raw = new RawAccessClient(${this.members.clientName});`);
                };

                if (this.settings.includeExceptionHandler) {
                    writer.controlFlowWithoutStatement("try");
                    writeConstructorBody(writer);
                    writer.endControlFlow();
                    writer.controlFlow("catch", this.csharp.codeblock("Exception ex"));
                    writer.writeLine("client.Options.ExceptionHandler?.CaptureException(ex);");
                    writer.writeLine("throw;");
                    writer.endControlFlow();
                } else {
                    writeConstructorBody(writer);
                }
            })
        };
    }

    private getSubpackages(): Subpackage[] {
        return this.context.getSubpackages(this.subpackage.subpackages);
    }

    private generateRawAccessClient(class_: ast.Class) {
        const rawAccessClientReference = this.csharp.classReference({
            name: "RawAccessClient",
            namespace: this.classReference.namespace
        });

        class_.addField({
            access: ast.Access.Public,
            get: true,
            origin: class_.explicit("Raw"),
            type: rawAccessClientReference
        });

        const nestedClass = this.csharp.class_({
            reference: rawAccessClientReference,
            partial: true,
            access: ast.Access.Public
        });

        nestedClass.addField({
            access: ast.Access.Private,
            origin: nestedClass.explicit("_client"),
            type: this.Types.RawClient,
            readonly: true
        });

        nestedClass.addConstructor({
            access: ast.Access.Internal,
            parameters: [
                this.csharp.parameter({
                    name: "client",
                    type: this.Types.RawClient
                })
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeLine("_client = client;");
            })
        });

        const serviceId = this.serviceId;
        if (this.service != null && serviceId != null) {
            this.service.endpoints.flatMap((endpoint) => {
                return this.context.endpointGenerator.generateRaw(nestedClass, {
                    serviceId,
                    endpoint,
                    rawClientReference: "_client",
                    rawClient: this.rawClient
                });
            });
        }

        nestedClass.addMethod({
            name: "ExtractHeaders",
            access: ast.Access.Private,
            type: ast.MethodType.STATIC,
            parameters: [
                this.csharp.parameter({
                    name: "response",
                    type: this.context.System.Net.Http.HttpResponseMessage
                })
            ],
            return_: this.context.System.Collections.Generic.IReadOnlyDictionary(
                this.context.generation.Primitive.string,
                this.context.System.Collections.Generic.IEnumerable(this.context.generation.Primitive.string)
            ),
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(
                    "var headers = new Dictionary<string, IEnumerable<string>>(StringComparer.OrdinalIgnoreCase);"
                );
                writer.writeLine("foreach (var header in response.Headers)");
                writer.pushScope();
                writer.writeLine("headers[header.Key] = header.Value.ToList();");
                writer.popScope();
                writer.writeLine("if (response.Content != null)");
                writer.pushScope();
                writer.writeLine("foreach (var header in response.Content.Headers)");
                writer.pushScope();
                writer.writeLine("headers[header.Key] = header.Value.ToList();");
                writer.popScope();
                writer.popScope();
                writer.writeLine("return headers;");
            })
        });

        class_.addNestedClass(nestedClass);
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.sourceFiles, RelativeFilePath.of(`${this.classReference.name}.cs`));
    }
}
