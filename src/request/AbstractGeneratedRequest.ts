import { HttpEndpoint, HttpHeader, HttpMethod, HttpPath, HttpService } from "@fern-fern/ir-v4-model/services/http";
import { TypeDeclaration } from "@fern-fern/ir-v4-model/types";
import {
    PostmanHeader,
    PostmanMethod,
    PostmanRawRequestBodyLanguage,
    PostmanRequest,
    PostmanRequestBodyMode,
    PostmanUrlVariable,
} from "@fern-fern/postman-sdk/resources";
import { getMockBodyFromTypeReference } from "../getMockBody";
import { getReferenceToVariable, ORIGIN_VARIABLE_NAME } from "../utils";
import { GeneratedRequest } from "./GeneratedRequest";

export declare namespace AbstractGeneratedRequest {
    export interface Init {
        authHeaders: PostmanHeader[];
        httpService: HttpService;
        httpEndpoint: HttpEndpoint;
        allTypes: TypeDeclaration[];
    }
}

export abstract class AbstractGeneratedRequest implements GeneratedRequest {
    protected authHeaders: PostmanHeader[];
    protected httpService: HttpService;
    protected httpEndpoint: HttpEndpoint;
    protected allTypes: TypeDeclaration[];

    constructor({ authHeaders, httpEndpoint, httpService, allTypes }: AbstractGeneratedRequest.Init) {
        this.authHeaders = authHeaders;
        this.httpService = httpService;
        this.httpEndpoint = httpEndpoint;
        this.allTypes = allTypes;
    }

    public get(): PostmanRequest {
        const hostArr = [getReferenceToVariable(ORIGIN_VARIABLE_NAME)];
        const pathArr = this.getPathArray({
            basePath: this.httpService.basePath,
            endpointPath: this.httpEndpoint.path,
        });
        const queryParams = this.getQueryParams();

        let rawUrl = [...hostArr, ...pathArr].join("/");
        if (queryParams.length > 0) {
            rawUrl += "?" + new URLSearchParams(queryParams.map((param) => [param.key, param.value])).toString();
        }

        const requestBody = this.getRequestBody();

        return {
            description: this.httpEndpoint.docs ?? undefined,
            url: {
                raw: rawUrl,
                host: hostArr,
                path: pathArr,
                query: queryParams,
                variable: this.getPathParams(),
            },
            header: [...this.authHeaders, ...this.getHeaders()],
            method: this.convertHttpMethod(this.httpEndpoint.method),
            auth: undefined, // inherit
            body:
                requestBody == null
                    ? undefined
                    : {
                          mode: PostmanRequestBodyMode.Raw,
                          raw: JSON.stringify(requestBody, undefined, 4),
                          options: {
                              raw: {
                                  language: PostmanRawRequestBodyLanguage.Json,
                              },
                          },
                      },
        };
    }

    protected convertHeader({ header, value }: { header: HttpHeader; value?: unknown }): PostmanHeader {
        const valueOrDefault =
            value ?? getMockBodyFromTypeReference({ typeReference: header.valueType, allTypes: this.allTypes });
        return {
            key: header.name.wireValue,
            description: header.docs ?? undefined,
            type: "text",
            value: valueOrDefault != null ? JSON.stringify(valueOrDefault) : "",
        };
    }

    private convertHttpMethod(httpMethod: HttpMethod): PostmanMethod {
        return HttpMethod._visit<PostmanMethod>(httpMethod, {
            get: () => PostmanMethod.Get,
            post: () => PostmanMethod.Post,
            put: () => PostmanMethod.Put,
            patch: () => PostmanMethod.Patch,
            delete: () => PostmanMethod.Delete,
            _unknown: () => {
                throw new Error("Unexpected httpMethod: " + httpMethod);
            },
        });
    }

    private getPathArray({
        basePath,
        endpointPath,
    }: {
        basePath: string | undefined | null;
        endpointPath: HttpPath;
    }): string[] {
        const urlParts: string[] = [];
        if (basePath != null) {
            this.splitPathString(basePath).forEach((splitPart) => urlParts.push(splitPart));
        }
        if (endpointPath.head !== "/") {
            this.splitPathString(endpointPath.head).forEach((splitPart) => urlParts.push(splitPart));
        }
        endpointPath.parts.forEach((part) => {
            urlParts.push(`:${part.pathParameter}`);
            this.splitPathString(part.tail).forEach((splitPart) => urlParts.push(splitPart));
        });
        return urlParts;
    }

    private splitPathString(path: string): string[] {
        return path.split("/").filter((val) => val.length > 0 && val !== "/");
    }

    protected abstract getQueryParams(): PostmanUrlVariable[];
    protected abstract getPathParams(): PostmanUrlVariable[];
    protected abstract getHeaders(): PostmanHeader[];
    protected abstract getRequestBody(): unknown;
}
