/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernDefinition from "../../../../api/index";
import * as core from "../../../../core";
import { ExampleSseEventSchema } from "./ExampleSseEventSchema";

export const ExampleSseResponseSchema: core.serialization.ObjectSchema<
    serializers.ExampleSseResponseSchema.Raw,
    FernDefinition.ExampleSseResponseSchema
> = core.serialization.object({
    stream: core.serialization.list(ExampleSseEventSchema),
});

export declare namespace ExampleSseResponseSchema {
    export interface Raw {
        stream: ExampleSseEventSchema.Raw[];
    }
}
