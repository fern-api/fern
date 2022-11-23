import { RawSchemas } from "@fern-api/yaml-schema";
import { AbstractConvertedSchema } from "./abstractConvertedSchema";
import { AbstractConvertedType } from "./abstractConvertedType";
import { ConvertedHeader } from "./convertedHeader";
import { ConvertedPathParam } from "./convertedPathParam";
import { ConvertedQueryParam } from "./convertedQueryParam";

export class ConvertedEndpoint implements AbstractConvertedType<RawSchemas.HttpEndpointSchema> {
    public readonly path: string;
    public readonly method: RawSchemas.HttpMethodSchema;
    public readonly headers: ConvertedHeader[];
    public readonly queryParameters: ConvertedQueryParam[];
    public readonly pathParameters: ConvertedPathParam[];
    public readonly request: ConvertedRequest | undefined;

    public constructor({
        path,
        method,
        headers,
        queryParameters,
        pathParameters,
        request,
    }: {
        path?: string;
        method: RawSchemas.HttpMethodSchema;
        headers?: ConvertedHeader[];
        queryParameters?: ConvertedQueryParam[];
        pathParameters?: ConvertedPathParam[];
        request: ConvertedRequest | undefined;
    }) {
        this.path = path ?? "";
        this.method = method;
        this.headers = headers ?? [];
        this.queryParameters = queryParameters ?? [];
        this.pathParameters = pathParameters ?? [];
        this.request = request;
    }

    public toRawSchema(): RawSchemas.HttpEndpointSchema {
        // header map
        const rawHeaders: Record<string, RawSchemas.HttpHeaderSchema> = {};
        this.headers.forEach((header) => {
            rawHeaders[header.headerName] = header.toRawSchema();
        });
        // query param map
        const rawQueryParams: Record<string, RawSchemas.HttpQueryParameterSchema> = {};
        this.queryParameters.forEach((queryParameter) => {
            rawHeaders[queryParameter.paramName] = queryParameter.toRawSchema();
        });
        // path param map
        const rawPathParams: Record<string, RawSchemas.HttpPathParameterSchema> = {};
        this.pathParameters.forEach((pathParam) => {
            rawHeaders[pathParam.paramName] = pathParam.toRawSchema();
        });
        return {
            path: this.path,
            method: this.method,
            headers: rawHeaders,
            "query-parameters": rawQueryParams,
            "path-parameters": rawPathParams,
        };
    }
}

export class ConvertedRequest implements AbstractConvertedType<RawSchemas.HttpRequestSchema> {
    public readonly docs: string | undefined;
    public readonly schema: AbstractConvertedSchema;

    constructor({ docs, schema }: { docs: string; schema: AbstractConvertedSchema }) {
        this.docs = docs;
        this.schema = schema;
    }

    public toRawSchema(): RawSchemas.HttpRequestSchema {
        if (this.docs == null) {
            return this.schema.id;
        }
        return {
            docs: this.docs,
            type: this.schema.id,
        };
    }
}
