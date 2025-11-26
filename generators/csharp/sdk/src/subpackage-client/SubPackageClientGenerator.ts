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
        rawResponseClient: () => this.classReference.explicit("_rawClient"),
        clientName: () => this.model.getPropertyNameFor(this.members.client),
        grpcClientName: () => this.model.getPropertyNameFor(this.members.grpcClient),
        rawResponseClientName: () => this.model.getPropertyNameFor(this.members.rawResponseClient)
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
        const class_ = this.csharp.class_({
            reference: this.classReference,
            partial: true,
            access: ast.Access.Public
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

        // Add WithRawResponse property if this client has endpoints
        if (this.service != null && this.serviceId != null) {
            const rawClientClassReference = this.context.getRawSubpackageClassReference(this.subpackage);
            class_.addField({
                origin: this.members.rawResponseClient,
                access: ast.Access.Private,
                type: rawClientClassReference
            });

            class_.addField({
                name: "WithRawResponse",
                access: ast.Access.Public,
                get: true,
                type: rawClientClassReference,
                summary: "Access endpoints with raw HTTP response data (status code, headers)."
            });
        }

        class_.addConstructor(this.getConstructorMethod());
        if (this.service != null && this.serviceId != null) {
            this.generateEndpoints(class_);
        }

        // add websocket api endpoints if needed
        this.generateWebsocketFactories(class_);

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
                writer.writeLine(`${this.members.clientName} = client;`);

                if (this.grpcClientInfo != null) {
                    writer.writeLine(`${this.members.grpcClient} = ${this.members.clientName}.Grpc;`);
                    writer.write(this.grpcClientInfo.privatePropertyName);
                    writer.write(" = ");
                    writer.writeNodeStatement(
                        this.csharp.instantiateClass({
                            classReference: this.grpcClientInfo.classReference,
                            arguments_: [this.csharp.codeblock(`${this.members.grpcClient}.Channel`)]
                        })
                    );
                }

                // Instantiate raw response client if this client has endpoints
                if (this.service != null && this.serviceId != null) {
                    const rawClientClassReference = this.context.getRawSubpackageClassReference(this.subpackage);
                    writer.write(`${this.members.rawResponseClientName} = `);
                    writer.writeNodeStatement(
                        this.csharp.instantiateClass({
                            classReference: rawClientClassReference,
                            arguments_: [this.csharp.codeblock(this.members.clientName)]
                        })
                    );
                    writer.writeLine(`WithRawResponse = ${this.members.rawResponseClientName};`);
                }

                const arguments_ = [this.csharp.codeblock(this.members.clientName)];
                for (const subpackage of this.getSubpackages()) {
                    // skip subpackages that are completely empty (recursively)
                    if (this.context.subPackageHasEndpointsRecursively(subpackage)) {
                        writer.writeLine(`${subpackage.name.pascalCase.safeName} = `);
                        writer.writeNodeStatement(
                            this.csharp.instantiateClass({
                                classReference: this.context.getSubpackageClassReference(subpackage),
                                arguments_
                            })
                        );
                    }
                }
            })
        };
    }

    private getSubpackages(): Subpackage[] {
        return this.context.getSubpackages(this.subpackage.subpackages);
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.sourceFiles, RelativeFilePath.of(`${this.classReference.name}.cs`));
    }
}
