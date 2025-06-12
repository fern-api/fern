import { Type } from "@fern-api/ir-sdk";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { AbstractSpecConverter } from "@fern-api/v2-importer-commons";

import { ProtobufConverterContext } from "../ProtobufConverterContext";
import { EnumConverter } from "./message/EnumConverter";
import { EnumOrMessageConverter } from "./message/EnumOrMessageConverter";
import { MessageConverter } from "./message/MessageConverter";
import { ServiceConverter } from "./service/ServiceConverter";

export declare namespace ProtobufConverter {
    type Args = AbstractSpecConverter.Args<ProtobufConverterContext>;
}

export class ProtobufConverter extends AbstractSpecConverter<ProtobufConverterContext, IntermediateRepresentation> {
    constructor({ breadcrumbs, context, audiences }: ProtobufConverter.Args) {
        super({ breadcrumbs, context, audiences });
    }

    public convert(): IntermediateRepresentation | undefined {
        this.convertOptions();
        this.convertEnumsAndMessages();
        this.convertServices();
        this.addToPackage();
        return this.finalizeIr();
    }

    private convertOptions() {
        // TODO: convert options
    }

    private convertEnumsAndMessages() {
        for (const protoFile of this.context.spec.protoFile) {
            for (const schema of [...protoFile.enumType, ...protoFile.messageType]) {
                const enumOrMessageConverter = new EnumOrMessageConverter({
                    context: this.context,
                    breadcrumbs: this.breadcrumbs,
                    schema
                });
                const convertedEnum = enumOrMessageConverter.convert();
                if (convertedEnum != null) {
                    this.addTypesToIr({
                        ...convertedEnum.inlinedTypes,
                        [schema.name]: convertedEnum.convertedSchema
                    });
                }
            }
        }
    }

    private convertServices() {
        for (const protoFile of this.context.spec?.protoFile ?? []) {
            for (const service of protoFile.service) {
                // TODO: use ServiceConverter to convert service
                // TODO: add to IR similar to path
                const serviceConverter = new ServiceConverter({
                    context: this.context,
                    breadcrumbs: this.breadcrumbs,
                    service
                });
                const convertedService = serviceConverter.convert();
                if (convertedService != null) {
                    for (const endpoint of convertedService.endpoints) {
                        // this.addEndpointToIr({
                        //     endpoint,
                        //     audiences: this.audiences
                        // });
                    }
                }
            }
        }
    }

    private addToPackage() {
        // TODO: add to correct (sub)package
    }
}
