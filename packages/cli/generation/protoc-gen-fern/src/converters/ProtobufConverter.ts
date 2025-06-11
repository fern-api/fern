import { FernIr, IntermediateRepresentation, Package } from "@fern-api/ir-sdk";
import { BaseIntermediateRepresentation } from "@fern-api/v2-importer-commons/lib/AbstractConverter";

import { ProtobufConverterContext } from "../ProtobufConverterContext";
import { MessageConverter } from "./MessageConverter";
import { AbstractSpecConverter } from "@fern-api/v2-importer-commons";

export declare namespace ProtobufConverter {
    export interface Args {
        breadcrumbs: string[];
        context: ProtobufConverterContext;
    }
}

export class ProtobufConverter extends AbstractSpecConverter<ProtobufConverterContext, IntermediateRepresentation> {
    constructor({ breadcrumbs, context, audiences }: AbstractSpecConverter.Args<ProtobufConverterContext>) {
        super({ breadcrumbs, context, audiences });
    }

    public convert(): IntermediateRepresentation {
        this.convertOptions();
        this.convertEnums();
        this.convertMessages();
        this.convertServices();
        this.addToPackage();
        return this.finalizeIr();
    }

    private convertOptions() {
        // TODO: convert options
    }

    private convertEnums() {
        // TODO: convert enums
        // TODO: add to IR as type/schema
    }

    private convertMessages() {
        for (const protoFile of this.context.spec.protoFile) {
            for (const message of protoFile.messageType) {
                // TODO: use MessageConverter to convert message
                // TODO: add to IR as type/schema
            }
        }
    }

    private convertServices() {
        for (const protoFile of this.context.spec.protoFile) {
            for (const service of protoFile.service) {
                // TODO: use ServiceConverter to convert service
                // TODO: add to IR similar to path
            }
        }
    }

    private addToPackage() {
        // TODO: add to correct (sub)package
    }
}
