import { MethodDescriptorProto } from "@bufbuild/protobuf/wkt";
import { HttpEndpoint } from "@fern-api/ir-sdk";
import { MethodConverterContext } from "../MethodConverterContext";

export type gRPCMethodType = 'UNARY' | 'CLIENT_STREAM' | 'SERVER_STREAM' | 'BIDI_STREAM';

export declare namespace MethodConverter {
    export interface Args {
        context: MethodConverterContext;
        operation: MethodDescriptorProto;
        method: gRPCMethodType;
    }

    export interface Output {
        endpoint: HttpEndpoint;
    }
}

export class MethodConverter {
    private readonly context: MethodConverterContext;
    private readonly operation: MethodDescriptorProto;
    private readonly method: gRPCMethodType;

    constructor(args: MethodConverter.Args) {
        this.context = args.context;
        this.operation = args.operation;
        this.method = args.method; 
    }

    public convert(): MethodConverter.Output {
        // TODO: convert method by parsing name, request type, and response type
        
        return {
            endpoint: {}
        }
    }
}