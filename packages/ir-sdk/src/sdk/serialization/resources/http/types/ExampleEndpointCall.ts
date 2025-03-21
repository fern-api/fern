/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernIr from "../../../../api/index";
import * as core from "../../../../core";
import { Name } from "../../commons/types/Name";
import { ExamplePathParameter } from "./ExamplePathParameter";
import { ExampleHeader } from "./ExampleHeader";
import { ExampleQueryParameter } from "./ExampleQueryParameter";
import { ExampleRequestBody } from "./ExampleRequestBody";
import { ExampleResponse } from "./ExampleResponse";
import { WithDocs } from "../../commons/types/WithDocs";

export const ExampleEndpointCall: core.serialization.ObjectSchema<
    serializers.ExampleEndpointCall.Raw,
    FernIr.ExampleEndpointCall
> = core.serialization
    .objectWithoutOptionalProperties({
        id: core.serialization.string().optional(),
        name: Name.optional(),
        url: core.serialization.string(),
        rootPathParameters: core.serialization.list(ExamplePathParameter),
        servicePathParameters: core.serialization.list(ExamplePathParameter),
        endpointPathParameters: core.serialization.list(ExamplePathParameter),
        serviceHeaders: core.serialization.list(ExampleHeader),
        endpointHeaders: core.serialization.list(ExampleHeader),
        queryParameters: core.serialization.list(ExampleQueryParameter),
        request: ExampleRequestBody.optional(),
        response: ExampleResponse,
    })
    .extend(WithDocs);

export declare namespace ExampleEndpointCall {
    export interface Raw extends WithDocs.Raw {
        id?: string | null;
        name?: Name.Raw | null;
        url: string;
        rootPathParameters: ExamplePathParameter.Raw[];
        servicePathParameters: ExamplePathParameter.Raw[];
        endpointPathParameters: ExamplePathParameter.Raw[];
        serviceHeaders: ExampleHeader.Raw[];
        endpointHeaders: ExampleHeader.Raw[];
        queryParameters: ExampleQueryParameter.Raw[];
        request?: ExampleRequestBody.Raw | null;
        response: ExampleResponse.Raw;
    }
}
