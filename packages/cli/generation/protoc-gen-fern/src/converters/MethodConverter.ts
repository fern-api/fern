import { MethodDescriptorProto } from "@bufbuild/protobuf/wkt";

import { HttpEndpoint } from "@fern-api/ir-sdk";
import { AbstractConverter } from "@fern-api/v2-importer-commons";

import { ProtobufConverterContext } from "../ProtobufConverterContext";

export type gRPCMethodType = "UNARY" | "CLIENT_STREAM" | "SERVER_STREAM" | "BIDI_STREAM";

export declare namespace MethodConverter {
    export interface Args extends AbstractConverter.Args<ProtobufConverterContext> {
        operation: MethodDescriptorProto;
        method: gRPCMethodType;
    }

    export interface Output {
        endpoint: HttpEndpoint;
    }
}

export class MethodConverter extends AbstractConverter<ProtobufConverterContext, MethodConverter.Output> {
    private readonly operation: MethodDescriptorProto;
    private readonly method: gRPCMethodType;

    constructor({ context, breadcrumbs, operation, method }: MethodConverter.Args) {
        super({ context, breadcrumbs });
        this.operation = operation;
        this.method = method;
    }

    public convert(): MethodConverter.Output | undefined {
        // TODO: convert method by parsing name, request type, and response type

        // return {
        //     endpoint: {}
        // };
        return undefined;
    }
}
