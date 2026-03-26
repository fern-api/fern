import { CSharpFile, FileGenerator, GrpcClientInfo } from "@fern-api/csharp-base";
import { ast, Writer } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

type HttpEndpoint = FernIr.HttpEndpoint;
type HttpService = FernIr.HttpService;
type ServiceId = FernIr.ServiceId;

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

/**
 * Generates a gRPC service stub class that extends the protobuf-generated ServiceBase.
 * Each RPC method gets a fluent `.OnMethodName(handler)` configuration method
 * and captures received requests in a `List<TRequest>` per method.
 */
export class GrpcStubGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private readonly service: HttpService;
    private readonly grpcClientInfo: GrpcClientInfo;
    private readonly stubClassName: string;
    private readonly grpcServiceName: string;
    private readonly grpcNamespace: string;

    constructor(
        context: SdkGeneratorContext,
        private readonly serviceId: ServiceId
    ) {
        super(context);
        const service = context.getHttpService(serviceId);
        if (service == null) {
            throw new Error(`Service with id ${serviceId} not found`);
        }
        this.service = service;

        const grpcClientInfo = context.getGrpcClientInfoForServiceId(serviceId);
        if (grpcClientInfo == null) {
            throw new Error(`No gRPC client info for service ${serviceId}`);
        }
        this.grpcClientInfo = grpcClientInfo;

        const protobufService = grpcClientInfo.protobufService;
        this.grpcServiceName = protobufService.name.originalName;
        this.grpcNamespace = context.protobufResolver.getNamespaceFromProtobufFile(protobufService.file);
        this.stubClassName = `${this.grpcServiceName}Stub`;
    }

    public getStubClassName(): string {
        return this.stubClassName;
    }

    public getServiceBaseClassName(): string {
        return `${this.grpcNamespace}.${this.grpcServiceName}.${this.grpcServiceName}Base`;
    }

    protected doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.csharp.classReference({
                name: this.stubClassName,
                namespace: this.namespaces.mockServerTest,
                origin: this.model.explicit(this.grpcClientInfo.protobufService, `Stub${this.grpcServiceName}`)
            }),
            partial: false,
            access: ast.Access.Public,
            parentClassReference: this.csharp.classReference({
                name: `${this.grpcServiceName}.${this.grpcServiceName}Base`,
                namespace: this.grpcNamespace,
                fullyQualified: true,
                global: true
            })
        });

        // Get only the gRPC endpoints (those that use gRPC transport)
        const grpcEndpoints = this.service.endpoints.filter((endpoint) => !this.isHttpTransportEndpoint(endpoint));

        // Generate all stub members as raw body content
        class_.addRawBodyContent(
            this.csharp.codeblock((writer: Writer) => {
                for (const endpoint of grpcEndpoints) {
                    this.writeHandlerFieldAndFluentMethod(writer, endpoint);
                    this.writeOverrideMethod(writer, endpoint);
                }
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

    private isHttpTransportEndpoint(endpoint: HttpEndpoint): boolean {
        return endpoint.transport?.type === "http";
    }

    private writeHandlerFieldAndFluentMethod(writer: Writer, endpoint: HttpEndpoint): void {
        const methodName = endpoint.name.pascalCase.safeName;
        const handlerFieldName = `_${endpoint.name.camelCase.safeName}Handler`;
        const { protoRequestType, protoResponseType } = this.getProtoTypes(endpoint);

        // Private handler field
        writer.writeLine(`private Func<${protoRequestType}, ${protoResponseType}>? ${handlerFieldName};`);
        writer.newLine();

        // Public requests list property
        writer.writeLine(`public List<${protoRequestType}> ${methodName}Requests { get; } = new();`);
        writer.newLine();

        // Fluent configuration method
        writer.writeLine(
            `public ${this.stubClassName} On${methodName}(Func<${protoRequestType}, ${protoResponseType}> handler)`
        );
        writer.pushScope();
        writer.writeLine(`${handlerFieldName} = handler;`);
        writer.writeLine("return this;");
        writer.popScope();
        writer.newLine();
    }

    private writeOverrideMethod(writer: Writer, endpoint: HttpEndpoint): void {
        const methodName = endpoint.name.pascalCase.safeName;
        const handlerFieldName = `_${endpoint.name.camelCase.safeName}Handler`;
        const { protoRequestType, protoResponseType } = this.getProtoTypes(endpoint);

        writer.writeLine(
            `public override Task<${protoResponseType}> ${methodName}(${protoRequestType} request, Grpc.Core.ServerCallContext context)`
        );
        writer.pushScope();
        writer.writeLine(`${methodName}Requests.Add(request);`);
        writer.writeLine(`if (${handlerFieldName} != null)`);
        writer.pushScope();
        writer.writeLine(`return Task.FromResult(${handlerFieldName}(request));`);
        writer.popScope();
        writer.writeLine(
            'throw new Grpc.Core.RpcException(new Grpc.Core.Status(Grpc.Core.StatusCode.Unimplemented, "Method not configured"));'
        );
        writer.popScope();
        writer.newLine();
    }

    /**
     * Resolves the proto request and response types for a given endpoint.
     *
     * For gRPC endpoints, the proto request type is derived from:
     * 1. Referenced request bodies: resolve directly via TypeReference -> proto source
     * 2. Inlined request bodies: use the SDK wrapper request type name, which matches
     *    the proto message name (e.g., SDK's UploadRequest.ToProto() returns Proto.UploadRequest)
     * 3. No request body: defaults to google.protobuf.Empty
     */
    private getProtoTypes(endpoint: HttpEndpoint): { protoRequestType: string; protoResponseType: string } {
        let protoRequestType = "Google.Protobuf.WellKnownTypes.Empty";
        let protoResponseType = "Google.Protobuf.WellKnownTypes.Empty";

        // Determine proto request type from endpoint request body
        if (endpoint.requestBody != null) {
            if (endpoint.requestBody.type === "reference") {
                const protoRef = this.resolveProtoType(endpoint.requestBody.requestBodyType);
                if (protoRef != null) {
                    protoRequestType = protoRef;
                }
            } else if (endpoint.requestBody.type === "inlinedRequestBody") {
                // Inlined request bodies for gRPC endpoints are SDK wrapper types whose
                // properties mirror the proto message fields. The SDK generates a
                // ToProto() method on the wrapper that returns the corresponding proto
                // message type with the same name in the proto namespace.
                //
                // First try to resolve via `extends` (if the wrapper extends a named type
                // with proto source). If `extends` is empty (the common case for gRPC
                // inlined request bodies), derive the proto type from the wrapper's own
                // name in the proto namespace.
                const extendsTypes = endpoint.requestBody.extends;
                let resolved = false;
                for (const ext of extendsTypes) {
                    const protoRef = this.resolveProtoTypeById(ext.typeId);
                    if (protoRef != null) {
                        protoRequestType = protoRef;
                        resolved = true;
                        break;
                    }
                }
                if (!resolved) {
                    // Use the inlined request body's name, which matches the proto message name
                    const requestName = endpoint.requestBody.name.originalName;
                    protoRequestType = `${this.grpcNamespace}.${requestName}`;
                }
            }
        }

        // Determine proto response type from endpoint response
        if (endpoint.response?.body != null) {
            if (endpoint.response.body.type === "json") {
                const jsonResponse = endpoint.response.body.value;
                if (jsonResponse.type === "response") {
                    const protoRef = this.resolveProtoType(jsonResponse.responseBodyType);
                    if (protoRef != null) {
                        protoResponseType = protoRef;
                    }
                }
            }
        }

        return { protoRequestType, protoResponseType };
    }

    /**
     * Resolves a TypeReference to its fully-qualified proto class name.
     */
    private resolveProtoType(typeRef: FernIr.TypeReference): string | undefined {
        if (typeRef.type === "named") {
            return this.resolveProtoTypeById(typeRef.typeId);
        }
        return undefined;
    }

    /**
     * Resolves a TypeId to its fully-qualified proto class name.
     */
    private resolveProtoTypeById(typeId: FernIr.TypeId): string | undefined {
        try {
            const classRef = this.context.protobufResolver.getProtobufClassReference(typeId);
            return `${classRef.namespace}.${classRef.name}`;
        } catch {
            // Type does not have a protobuf source; fall back to undefined
            return undefined;
        }
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.constants.folders.testFiles,
            this.constants.folders.mockServerTests,
            RelativeFilePath.of(`${this.stubClassName}.cs`)
        );
    }
}
