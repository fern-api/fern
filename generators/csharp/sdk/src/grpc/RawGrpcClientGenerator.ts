import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ProtobufService } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace RawGrpcClientGenerator {
    interface Args {
        context: SdkGeneratorContext;
    }

    interface GrpcClient {
        classReference: csharp.ClassReference;
        fieldName: string;
    }
}

export class RawGrpcClientGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    constructor({ context }: RawGrpcClientGenerator.Args) {
        super(context);
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            name: this.context.getRawGrpcClientClassName(),
            namespace: this.context.getNamespace(),
            access: "internal",
            summary: "Utility class for making gRPC requests to the API."
        });

        const grpcClientClasses = this.getGrpcClientClasses();
        for (const grpcClientClass of grpcClientClasses) {
            class_.addField(
                csharp.field({
                    access: "public",
                    name: grpcClientClass.fieldName,
                    type: csharp.Type.reference(grpcClientClass.classReference)
                })
            );
        }

        const clientOptionsType = csharp.Type.reference(this.context.getClientOptionsClassReference());
        class_.addField(
            csharp.field({
                access: "private",
                name: "_clientOptions",
                type: clientOptionsType,
                skipDefaultInitializer: true
            })
        );

        const headersType = csharp.Type.map(csharp.Type.string(), csharp.Type.string());
        class_.addField(
            csharp.field({
                access: "private",
                name: "_headers",
                type: headersType,
                skipDefaultInitializer: true
            })
        );

        const headerSuppliersType = csharp.Type.map(
            csharp.Types.string(),
            csharp.Types.reference(
                csharp.classReference({
                    name: "Func",
                    namespace: "System",
                    generics: [csharp.Types.string()]
                })
            )
        );
        class_.addField(
            csharp.field({
                access: "private",
                name: "_headerSuppliers",
                type: headerSuppliersType,
                skipDefaultInitializer: true
            })
        );
        class_.addConstructor(
            this.getConstructorMethod({
                headersType,
                headerSuppliersType,
                clientOptionsType,
                grpcClientClasses
            })
        );

        class_.addMethod(
            this.getCreateCallOptionsMethod({
                grpcMetadataClassReference: csharp.classReference({
                    name: "Metadata",
                    namespace: "Grpc.Core"
                }),
                grpcCallOptionsClassReference: csharp.classReference({
                    name: "CallOptions",
                    namespace: "Grpc.Core"
                })
            })
        );

        class_.addMethod(this.getPrepareGrpcChannelOptionsMethod());

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getCoreDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private getConstructorMethod({
        headersType,
        headerSuppliersType,
        clientOptionsType,
        grpcClientClasses
    }: {
        headersType: csharp.Type;
        headerSuppliersType: csharp.Type;
        clientOptionsType: csharp.Type;
        grpcClientClasses: RawGrpcClientGenerator.GrpcClient[];
    }): csharp.Class.Constructor {
        return {
            access: "public",
            parameters: [
                csharp.parameter({
                    name: "headers",
                    type: headersType
                }),
                csharp.parameter({
                    name: "headerSuppliers",
                    type: headerSuppliersType
                }),
                csharp.parameter({
                    name: "clientOptions",
                    type: clientOptionsType
                })
            ],
            body: csharp.codeblock((writer) => {
                const headerDictionary = csharp.dictionary({
                    keyType: csharp.Types.string(),
                    valueType: csharp.Types.string(),
                    values: {
                        type: "argument",
                        argument: csharp.codeblock("headers")
                    }
                });
                const headerSupplierDictionary = csharp.dictionary({
                    keyType: csharp.Types.string(),
                    valueType: csharp.Types.reference(
                        csharp.classReference({
                            name: "Func",
                            namespace: "System",
                            generics: [csharp.Types.string()]
                        })
                    ),
                    values: {
                        type: "argument",
                        argument: csharp.codeblock("headerSuppliers")
                    }
                });
                const grpcChannelClassReference = csharp.classReference({
                    name: "GrpcChannel",
                    namespace: "Grpc.Core"
                });

                writer.writeLine("_clientOptions = clientOptions;");
                writer.write("_headers = ");
                writer.writeNodeStatement(headerDictionary);
                writer.write("_headerSuppliers = ");
                writer.writeNodeStatement(headerSupplierDictionary);
                writer.writeLine();

                writer.write("var grpcOptions = ");
                writer.writeNodeStatement(
                    csharp.invokeMethod({
                        method: "PrepareGrpcChannelOptions",
                        arguments_: []
                    })
                );

                writer.writeLine("var channel = ");
                writer.writeNodeStatement(
                    csharp.ternary({
                        condition: csharp.codeblock("grpcOptions != null"),
                        trueStatement: csharp.invokeMethod({
                            method: "ForAddress",
                            on: grpcChannelClassReference,
                            arguments_: [csharp.codeblock("_clientOptions.BaseUrl"), csharp.codeblock("grpcOptions")]
                        }),
                        falseStatement: csharp.invokeMethod({
                            method: "ForAddress",
                            on: grpcChannelClassReference,
                            arguments_: [csharp.codeblock("_clientOptions.BaseUrl")]
                        })
                    })
                );

                for (const grpcClientClass of grpcClientClasses) {
                    writer.write(`${grpcClientClass.fieldName} = `);
                    writer.writeNodeStatement(
                        csharp.instantiateClass({
                            classReference: grpcClientClass.classReference,
                            arguments_: [csharp.codeblock("channel")]
                        })
                    );
                }
            })
        };
    }

    private getCreateCallOptionsMethod({
        grpcMetadataClassReference,
        grpcCallOptionsClassReference
    }: {
        grpcMetadataClassReference: csharp.ClassReference;
        grpcCallOptionsClassReference: csharp.ClassReference;
    }): csharp.Method {
        return csharp.method({
            name: this.context.getGrpcCreateCallOptionsMethodName(),
            access: "public",
            return_: csharp.Type.reference(grpcCallOptionsClassReference),
            parameters: [
                csharp.parameter({
                    name: "options",
                    type: csharp.Type.reference(this.context.getGrpcRequestOptionsClassReference())
                })
            ],
            isAsync: false,
            summary: `Prepares the gRPC metadata associated with the given request.
The provided request headers take precedence over the headers
associated with this client (which are sent on _every_ request).`,
            body: csharp.codeblock((writer) => {
                writer.write("var metadata = ");
                writer.writeNodeStatement(
                    csharp.instantiateClass({
                        classReference: grpcMetadataClassReference,
                        arguments_: []
                    })
                );

                writer.controlFlow("foreach", csharp.codeblock("var header in _headers"));
                writer.writeNodeStatement(
                    csharp.invokeMethod({
                        method: "Add",
                        on: csharp.codeblock("metadata"),
                        arguments_: [csharp.codeblock("header.Key"), csharp.codeblock("header.Value")]
                    })
                );
                writer.endControlFlow();

                writer.controlFlow("foreach", csharp.codeblock("var header in _headerSuppliers"));
                writer.writeNodeStatement(
                    csharp.invokeMethod({
                        method: "Add",
                        on: csharp.codeblock("metadata"),
                        arguments_: [csharp.codeblock("header.Key"), csharp.codeblock("header.Value.Invoke()")]
                    })
                );
                writer.endControlFlow();

                writer.controlFlow("foreach", csharp.codeblock("var header in options.Headers"));
                writer.writeNodeStatement(
                    csharp.invokeMethod({
                        method: "Add",
                        on: csharp.codeblock("metadata"),
                        arguments_: [csharp.codeblock("header.Key"), csharp.codeblock("header.Value")]
                    })
                );
                writer.endControlFlow();

                writer.writeLine("var timeout = options.Timeout ?? _clientOptions.Timeout;");
                writer.write("var deadline = ");
                writer.writeNodeStatement(
                    csharp.invokeMethod({
                        method: "UtcNow.Add",
                        on: csharp.Type.dateTime(),
                        arguments_: [csharp.codeblock("timeout")]
                    })
                );

                writer.write("return ");
                writer.writeNodeStatement(
                    csharp.instantiateClass({
                        classReference: grpcCallOptionsClassReference,
                        arguments_: [
                            csharp.codeblock("metadata"),
                            csharp.codeblock("deadline"),
                            csharp.codeblock("options.CancellationToken"),
                            csharp.codeblock("options.WriteOptions"),
                            csharp.codeblock("null"),
                            csharp.codeblock("options.CallCredentials")
                        ]
                    })
                );
            })
        });
    }

    private getPrepareGrpcChannelOptionsMethod(): csharp.Method {
        return csharp.method({
            name: "PrepareGrpcChannelOptions",
            access: "private",
            return_: csharp.Type.optional(csharp.Type.reference(this.context.getGrpcChannelOptionsClassReference())),
            body: csharp.codeblock((writer) => {
                writer.writeLine(
                    `var grpcChannelOptions = _clientOptions.${this.context.getGrpcChannelOptionsFieldName()};`
                );
                writer.controlFlow("if", csharp.codeblock("grpcChannelOptions == null"));
                writer.writeLine("return null;");
                writer.endControlFlow();
                writer.writeLine("grpcChannelOptions.HttpClient ??= _clientOptions.HttpClient;");
                writer.writeLine("grpcChannelOptions.MaxRetryAttempts ??= _clientOptions.MaxRetries;");
                writer.writeLine("return grpcChannelOptions;");
            }),
            isAsync: false,
            parameters: []
        });
    }

    private getGrpcClientClasses(): RawGrpcClientGenerator.GrpcClient[] {
        const protobufServices: ProtobufService[] = [];
        for (const service of Object.values(this.context.ir.services)) {
            if (service?.transport?.type === "grpc") {
                protobufServices.push(service.transport.service);
            }
        }
        return protobufServices.map((service) => {
            const serviceName = service.name.pascalCase.unsafeName;
            const className = this.context.getGrpcClientClassName(service);
            return {
                classReference: csharp.classReference({
                    name: `${serviceName}.${className}`,
                    namespace: this.context.protobufResolver.getNamespaceFromProtobufFileOrThrow(service.file)
                }),
                fieldName: className
            };
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getCoreFilesDirectory(),
            RelativeFilePath.of(`${this.context.getRawGrpcClientClassName()}.cs`)
        );
    }
}
