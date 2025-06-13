import { ServiceDescriptorProto } from "@bufbuild/protobuf/wkt";

import * as FernIr from "@fern-api/ir-sdk";
import { AbstractConverter, Converters } from "@fern-api/v2-importer-commons";

import { ProtofileConverterContext } from "../ProtofileConverterContext";
import { MethodConverter } from "./MethodConverter";

export declare namespace ServiceConverter {
    export interface Args extends AbstractConverter.Args<ProtofileConverterContext> {
        service: ServiceDescriptorProto;
    }

    export interface Output {
        endpoints: MethodConverter.Output[];
        inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema>;
    }
}

export class ServiceConverter extends AbstractConverter<ProtofileConverterContext, ServiceConverter.Output> {
    private readonly service: ServiceDescriptorProto;
    constructor({ context, breadcrumbs, service }: ServiceConverter.Args) {
        super({ context, breadcrumbs });
        this.service = service;
    }

    public convert(): ServiceConverter.Output | undefined {
        // TODO: convert service by using MethodConverter to convert contained methods
        // return {
        //     endpoints: [],
        //     inlinedTypes: {}
        // };
        return undefined;
    }
}
