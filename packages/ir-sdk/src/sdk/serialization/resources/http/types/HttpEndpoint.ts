/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernIr from "../../../../api/index";
import * as core from "../../../../core";
import { EndpointId } from "../../commons/types/EndpointId";
import { EndpointName } from "./EndpointName";
import { HttpMethod } from "./HttpMethod";
import { HttpHeader } from "./HttpHeader";
import { EnvironmentBaseUrlId } from "../../environment/types/EnvironmentBaseUrlId";
import { HttpPath } from "./HttpPath";
import { PathParameter } from "./PathParameter";
import { QueryParameter } from "./QueryParameter";
import { HttpRequestBody } from "./HttpRequestBody";
import { V2HttpRequestBodies } from "./V2HttpRequestBodies";
import { SdkRequest } from "./SdkRequest";
import { HttpResponse } from "./HttpResponse";
import { V2HttpResponses } from "./V2HttpResponses";
import { ResponseErrors } from "./ResponseErrors";
import { Pagination } from "./Pagination";
import { UserSpecifiedEndpointExample } from "./UserSpecifiedEndpointExample";
import { AutogeneratedEndpointExample } from "./AutogeneratedEndpointExample";
import { V2HttpEndpointExamples } from "../../examples/types/V2HttpEndpointExamples";
import { Transport } from "./Transport";
import { HttpEndpointSource } from "./HttpEndpointSource";
import { AudienceReference } from "../../audience/types/AudienceReference";
import { Declaration } from "../../commons/types/Declaration";
import { ResponseError } from "./ResponseError";

export const HttpEndpoint: core.serialization.ObjectSchema<serializers.HttpEndpoint.Raw, FernIr.HttpEndpoint> =
    core.serialization
        .objectWithoutOptionalProperties({
            id: EndpointId,
            name: EndpointName,
            displayName: core.serialization.string().optional(),
            method: HttpMethod,
            headers: core.serialization.list(HttpHeader),
            baseUrl: EnvironmentBaseUrlId.optional(),
            v2BaseUrls: core.serialization.list(EnvironmentBaseUrlId).optional(),
            basePath: HttpPath.optional(),
            path: HttpPath,
            fullPath: HttpPath,
            pathParameters: core.serialization.list(PathParameter),
            allPathParameters: core.serialization.list(PathParameter),
            queryParameters: core.serialization.list(QueryParameter),
            requestBody: HttpRequestBody.optional(),
            v2RequestBodies: V2HttpRequestBodies.optional(),
            sdkRequest: SdkRequest.optional(),
            response: HttpResponse.optional(),
            v2Responses: V2HttpResponses.optional(),
            errors: ResponseErrors,
            auth: core.serialization.boolean(),
            idempotent: core.serialization.boolean(),
            pagination: Pagination.optional(),
            userSpecifiedExamples: core.serialization.list(UserSpecifiedEndpointExample),
            autogeneratedExamples: core.serialization.list(AutogeneratedEndpointExample),
            v2Examples: V2HttpEndpointExamples.optional(),
            transport: Transport.optional(),
            source: HttpEndpointSource.optional(),
            audiences: core.serialization.list(AudienceReference).optional(),
        })
        .extend(Declaration);

export declare namespace HttpEndpoint {
    export interface Raw extends Declaration.Raw {
        id: EndpointId.Raw;
        name: EndpointName.Raw;
        displayName?: string | null;
        method: HttpMethod.Raw;
        headers: HttpHeader.Raw[];
        baseUrl?: EnvironmentBaseUrlId.Raw | null;
        v2BaseUrls?: EnvironmentBaseUrlId.Raw[] | null;
        basePath?: HttpPath.Raw | null;
        path: HttpPath.Raw;
        fullPath: HttpPath.Raw;
        pathParameters: PathParameter.Raw[];
        allPathParameters: PathParameter.Raw[];
        queryParameters: QueryParameter.Raw[];
        requestBody?: HttpRequestBody.Raw | null;
        v2RequestBodies?: V2HttpRequestBodies.Raw | null;
        sdkRequest?: SdkRequest.Raw | null;
        response?: HttpResponse.Raw | null;
        v2Responses?: V2HttpResponses.Raw | null;
        errors: ResponseErrors.Raw;
        auth: boolean;
        idempotent: boolean;
        pagination?: Pagination.Raw | null;
        userSpecifiedExamples: UserSpecifiedEndpointExample.Raw[];
        autogeneratedExamples: AutogeneratedEndpointExample.Raw[];
        v2Examples?: V2HttpEndpointExamples.Raw | null;
        transport?: Transport.Raw | null;
        source?: HttpEndpointSource.Raw | null;
        audiences?: AudienceReference.Raw[] | null;
    }
}
