import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { AbstractSpecConverter } from "@fern-api/v2-importer-commons";

import { ProtobufConverterContext } from "../ProtobufConverterContext";
import { MessageConverter } from "./MessageConverter";
import { ServiceConverter } from "./ServiceConverter";

export declare namespace ProtobufConverter {
    type Args = AbstractSpecConverter.Args<ProtobufConverterContext>;
}

export class ProtobufConverter extends AbstractSpecConverter<ProtobufConverterContext, IntermediateRepresentation> {
    constructor({ breadcrumbs, context, audiences }: AbstractSpecConverter.Args<ProtobufConverterContext>) {
        super({ breadcrumbs, context, audiences });
    }

    public convert() {
        return undefined;
    }

    // public convert(): IntermediateRepresentation {
    //     this.convertOptions();
    //     this.convertEnums();
    //     this.convertMessages();
    //     this.convertServices();
    //     this.addToPackage();
    //     return this.finalizeIr();
    // }

    // private convertOptions() {
    //     // TODO: convert options
    // }

    // private convertEnums() {
    //     // TODO: convert enums
    //     // TODO: add to IR as type/schema
    // }

    // private convertMessages() {
    //     for (const protoFile of this.context.spec?.protoFile ?? []) {
    //         for (const message of protoFile.messageType) {
    //             // TODO: use MessageConverter to convert message
    //             // TODO: add to IR as type/schema
    //             const messageConverter = new MessageConverter({
    //                 context: this.context,
    //                 breadcrumbs: this.breadcrumbs,
    //                 message
    //             });
    //             const convertedMessage = messageConverter.convert();
    //             if (convertedMessage != null) {
    //                 this.addTypesToIr({
    //                     ...convertedMessage.inlinedTypes,
    //                     [message.name]: convertedMessage.convertedMessage
    //                 });
    //             }
    //         }
    //     }
    // }

    // private convertServices() {
    //     for (const protoFile of this.context.spec?.protoFile ?? []) {
    //         for (const service of protoFile.service) {
    //             // TODO: use ServiceConverter to convert service
    //             // TODO: add to IR similar to path
    //             const serviceConverter = new ServiceConverter({
    //                 context: this.context,
    //                 breadcrumbs: this.breadcrumbs,
    //                 service
    //             });
    //             const convertedService = serviceConverter.convert();
    //             if (convertedService != null) {
    //                 for (const endpoint of convertedService.endpoints) {
    //                     // this.addEndpointToIr({
    //                     //     endpoint,
    //                     //     audiences: this.audiences
    //                     // });
    //                 }
    //             }
    //         }
    //     }
    // }

    // private addToPackage() {
    //     // TODO: add to correct (sub)package
    // }
}
