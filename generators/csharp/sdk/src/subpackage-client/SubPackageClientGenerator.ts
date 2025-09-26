import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, GrpcClientInfo } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { HttpService, ServiceId, Subpackage } from "@fern-fern/ir-sdk/api";
import { RawClient } from "../endpoint/http/RawClient";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { WebSocketClientGenerator } from "../websocket/WebsocketClientGenerator";

export const CLIENT_MEMBER_NAME = "_client";
export const GRPC_CLIENT_MEMBER_NAME = "_grpc";

export declare namespace SubClientGenerator {
    interface Args {
        subpackage: Subpackage;
        context: SdkGeneratorContext;
        serviceId?: ServiceId;
        service?: HttpService;
    }
}

export class SubPackageClientGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
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
    /**
     * Generates the c# factory methods to create the websocket api client.
     *
     * @remarks
     * This method only returns methods if WebSockets are enabled via the `enableWebsockets`
     *
     * @returns an array of ast.Method objects that represent the factory methods.
     */
    private generateWebsocketFactories(): ast.Method[] {
        // add functions to create the websocket api client
        const methods: ast.Method[] = [];
        if (this.context.enableWebsockets) {
            for (const subpackage of this.getSubpackages()) {
                if (subpackage.websocket != null) {
                    const websocketChannel = this.context.getWebsocketChannel(subpackage.websocket);
                    if (websocketChannel != null) {
                        methods.push(
                            ...WebSocketClientGenerator.createWebSocketApiFactories(
                                subpackage,
                                this.context,
                                this.classReference.namespace,
                                websocketChannel
                            )
                        );
                    }
                }
            }
        }
        return methods;
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            ...this.classReference,
            partial: true,
            access: ast.Access.Public
        });

        class_.addField(
            this.csharp.field({
                access: ast.Access.Private,
                name: CLIENT_MEMBER_NAME,
                type: this.csharp.Type.reference(this.context.getRawClientClassReference())
            })
        );

        if (this.grpcClientInfo != null) {
            class_.addField(
                this.csharp.field({
                    access: ast.Access.Private,
                    name: GRPC_CLIENT_MEMBER_NAME,
                    type: this.csharp.Type.reference(this.context.getRawGrpcClientClassReference())
                })
            );
            class_.addField(
                this.csharp.field({
                    access: ast.Access.Private,
                    name: this.grpcClientInfo.privatePropertyName,
                    type: this.csharp.Type.reference(this.grpcClientInfo.classReference)
                })
            );
        }

        for (const subpackage of this.getSubpackages()) {
            // skip subpackages that have no endpoints (recursively)
            if (this.context.subPackageHasEndpoints(subpackage)) {
                class_.addField(
                    this.csharp.field({
                        access: ast.Access.Public,
                        get: true,
                        name: subpackage.name.pascalCase.safeName,
                        type: this.csharp.Type.reference(this.context.getSubpackageClassReference(subpackage))
                    })
                );
            }
        }

        class_.addConstructor(this.getConstructorMethod());
        if (this.service != null && this.serviceId != null) {
            const methods = this.generateEndpoints();
            class_.addMethods(methods);
        }

        // add websocket api endpoints if needed
        class_.addMethods(this.generateWebsocketFactories());

        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of(this.context.getDirectoryForSubpackage(this.subpackage)),
            allNamespaceSegments: this.csharp.nameRegistry.allNamespacesOf(this.classReference.namespace),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private generateEndpoints(): ast.Method[] {
        const service = this.service;
        if (!service) {
            throw new Error("Internal error; Service is not defined");
        }
        const serviceId = this.serviceId;
        if (!serviceId) {
            throw new Error("Internal error; ServiceId is not defined");
        }
        return service.endpoints.flatMap((endpoint) => {
            return this.context.endpointGenerator.generate({
                serviceId,
                endpoint,
                rawClientReference: CLIENT_MEMBER_NAME,
                rawClient: this.rawClient,
                rawGrpcClientReference: GRPC_CLIENT_MEMBER_NAME,
                grpcClientInfo: this.grpcClientInfo
            });
        });
    }

    private getConstructorMethod(): ast.Class.Constructor {
        const parameters: ast.Parameter[] = [
            this.csharp.parameter({
                name: "client",
                type: this.csharp.Type.reference(this.context.getRawClientClassReference())
            })
        ];
        return {
            access: ast.Access.Internal,
            parameters,
            body: this.csharp.codeblock((writer) => {
                writer.writeLine("_client = client;");

                if (this.grpcClientInfo != null) {
                    writer.writeLine("_grpc = _client.Grpc;");
                    writer.write(this.grpcClientInfo.privatePropertyName);
                    writer.write(" = ");
                    writer.writeNodeStatement(
                        this.csharp.instantiateClass({
                            classReference: this.grpcClientInfo.classReference,
                            arguments_: [this.csharp.codeblock("_grpc.Channel")]
                        })
                    );
                }

                const arguments_ = [this.csharp.codeblock("_client")];
                for (const subpackage of this.getSubpackages()) {
                    // skip subpackages that have no endpoints (recursively)
                    if (this.context.subPackageHasEndpoints(subpackage)) {
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
        return this.subpackage.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceFileDirectory(),
            RelativeFilePath.of(this.classReference.name + ".cs")
        );
    }
}
