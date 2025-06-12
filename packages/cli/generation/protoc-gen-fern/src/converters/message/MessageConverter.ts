import { DescriptorProto, FieldDescriptorProto_Type } from "@bufbuild/protobuf/wkt";

import * as FernIr from "@fern-api/ir-sdk";
import { AbstractConverter, AbstractConverterContext, Converters } from "@fern-api/v2-importer-commons";

import { ProtobufConverterContext } from "../../ProtobufConverterContext";

export declare namespace MessageConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        message: DescriptorProto;
    }

    export interface Output {
        convertedSchema: Converters.SchemaConverters.SchemaConverter.ConvertedSchema;
        inlinedTypes: Record<FernIr.TypeId, Converters.SchemaConverters.SchemaConverter.ConvertedSchema>;
    }
}

export class MessageConverter extends AbstractConverter<AbstractConverterContext<object>, MessageConverter.Output> {
    private readonly message: DescriptorProto;

    constructor({ context, breadcrumbs, message }: MessageConverter.Args) {
        super({ context, breadcrumbs });
        this.message = message;
    }

    public convert(): MessageConverter.Output | undefined {
        // TODO: convert message (i.e. convert schema)

        // Step 1: Convert all fields
        for (const field of this.message.field) {
            this.context.logger.info("Field", field.name);
        }
        // Step 2: Convert all nested messages
        // Step 3: Convert all enums
        // Step 4: Convert all oneofs

        return undefined;
    }

    private convertFields() {
        for (const field of this.message.field) {
            this.context.logger.info("Field", field.name, JSON.stringify(field.type));
        }
    }
}
