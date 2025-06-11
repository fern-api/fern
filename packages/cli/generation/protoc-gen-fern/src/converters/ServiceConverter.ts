import { DescriptorProto, ServiceDescriptorProto } from "@bufbuild/protobuf/wkt";

import * as FernIr from "@fern-api/ir-sdk";
import { Converters } from "@fern-api/v2-importer-commons";

import { ProtobufConverterContext } from "../ProtobufConverterContext";
import { MethodConverter } from "./MethodConverter";

export declare namespace ServiceConverter {
    export interface Args {
        context: ProtobufConverterContext;
        service: ServiceDescriptorProto;
        breadcrumbs: string[];
    }

    export interface Output {
        endpoints: MethodConverter.Output[];
        inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema>;
    }
}

export class ServiceConverter {
    private context: ProtobufConverterContext;
    private readonly service: ServiceDescriptorProto;
    private readonly breadcrumbs: string[];

    constructor(args: ServiceConverter.Args) {
        this.context = args.context;
        this.service = args.service;
        this.breadcrumbs = args.breadcrumbs;
    }

    public convert(): ServiceConverter.Output {
        // TODO: convert service by using MethodConverter to convert contained methods
        return {
            endpoints: [],
            inlinedTypes: {}
        };
    }
}
