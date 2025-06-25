import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { AbstractSpecConverter } from "@fern-api/v2-importer-commons";

import { ProtofileConverterContext } from "./ProtofileConverterContext";
import { EnumOrMessageConverter } from "./message/EnumOrMessageConverter";
import { ServiceConverter } from "./service/ServiceConverter";

export declare namespace ProtofileConverter {
    interface Args extends AbstractSpecConverter.Args<ProtofileConverterContext> {}
}

export class ProtofileConverter extends AbstractSpecConverter<ProtofileConverterContext, IntermediateRepresentation> {
    constructor({ breadcrumbs, context, audiences }: ProtofileConverter.Args) {
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
        for (const schema of [...this.context.spec.enumType, ...this.context.spec.messageType]) {
            const enumOrMessageConverter = new EnumOrMessageConverter({
                context: this.context,
                breadcrumbs: [...this.breadcrumbs, this.context.spec.package],
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

    private convertServices() {
        for (const service of this.context.spec.service) {
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
                    this.addEndpointToIr({
                        endpoint: endpoint.endpoint,
                        audiences: []
                    });
                }
            }
        }
    }

    private addToPackage() {
        // TODO: add to correct (sub)package
    }
}
