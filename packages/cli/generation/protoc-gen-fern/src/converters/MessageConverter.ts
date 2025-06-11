import { DescriptorProto } from "@bufbuild/protobuf/wkt";

import * as FernIr from "@fern-api/ir-sdk";
import { Converters } from "@fern-api/v2-importer-commons";

import { ProtobufConverterContext } from "../ProtobufConverterContext";

export declare namespace MessageConverter {
    export interface Args {
        id: string;
        message: DescriptorProto;
        breadcrumbs: string[];
        context: ProtobufConverterContext;
    }

    export interface Output {
        convertedMessage: Converters.SchemaConverters.SchemaConverter.ConvertedSchema;
        inlinedTypes: Record<FernIr.TypeId, Converters.SchemaConverters.SchemaConverter.ConvertedSchema>;
    }
}

export class MessageConverter {
    private context: ProtobufConverterContext;
    private readonly message: DescriptorProto;
    private readonly breadcrumbs: string[];

    constructor(args: MessageConverter.Args) {
        this.context = args.context;
        this.message = args.message;
        this.breadcrumbs = args.breadcrumbs;
    }

    public convert(): MessageConverter.Output {
        // TODO: convert message
        return {
            convertedMessage: {},
            inlinedTypes: {}
        };
    }
}
