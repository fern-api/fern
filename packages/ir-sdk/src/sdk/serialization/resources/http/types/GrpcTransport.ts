/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernIr from "../../../../api/index";
import * as core from "../../../../core";
import { ProtobufService } from "../../proto/types/ProtobufService";

export const GrpcTransport: core.serialization.ObjectSchema<serializers.GrpcTransport.Raw, FernIr.GrpcTransport> =
    core.serialization.objectWithoutOptionalProperties({
        service: ProtobufService,
    });

export declare namespace GrpcTransport {
    export interface Raw {
        service: ProtobufService.Raw;
    }
}
