import { DescriptorProto } from "@bufbuild/protobuf/wkt";

import * as FernIr from "@fern-api/ir-sdk";
import { AbstractConverter, AbstractConverterContext, Converters } from "@fern-api/v2-importer-commons";

import { ProtobufConverterContext } from "../ProtobufConverterContext";

export declare namespace MessageConverter {
    export interface Args extends AbstractConverter.Args<ProtobufConverterContext> {
        message: DescriptorProto;
    }

    export interface Output {
        convertedMessage: Converters.SchemaConverters.SchemaConverter.ConvertedSchema;
        inlinedTypes: Record<FernIr.TypeId, Converters.SchemaConverters.SchemaConverter.ConvertedSchema>;
    }
}

export class MessageConverter extends AbstractConverter<ProtobufConverterContext, MessageConverter.Output> {
    private readonly message: DescriptorProto;

    constructor({ context, breadcrumbs, message }: MessageConverter.Args) {
        super({ context, breadcrumbs });
        this.message = message;
    }

    public convert(): MessageConverter.Output | undefined {
        // TODO: convert message (i.e. convert schema)
        // return {
        //     convertedMessage: {},
        //     inlinedTypes: {}
        // };
        return undefined;
    }
}
