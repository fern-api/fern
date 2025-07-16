import {
    HttpEndpoint,
    HttpHeader,
    HttpMethod,
    HttpPath,
    HttpService,
    IntermediateRepresentation,
    TypeDeclaration
} from "@fern-fern/ir-sdk/api";
import {
    PostmanHeader,
    PostmanMethod,
    PostmanRawRequestBodyLanguage,
    PostmanRequest,
    PostmanRequestBodyMode,
    PostmanUrlVariable
} from "@fern-fern/postman-sdk/api";

import { ORIGIN_VARIABLE_NAME, getReferenceToVariable } from "../utils";
import { GeneratedRequest } from "./GeneratedRequest";

export declare namespace AbstractGeneratedRequest {
    export interface Init {
        ir: IntermediateRepresentation;
        authHeaders: PostmanHeader[];
        httpService: HttpService;
        httpEndpoint: HttpEndpoint;
        allTypes: TypeDeclaration[];
    }
}

export abstract class AbstractGeneratedRequest implements GeneratedRequest {
    protected ir: IntermediateRepresentation;
    protected authHeaders: PostmanHeader[];
    protected httpService: HttpService;
    protected httpEndpoint: HttpEndpoint;
    protected allTypes: TypeDeclaration[];

    constructor({ authHeaders, httpEndpoint, httpService, allTypes, ir }: AbstractGeneratedRequest.Init) {
        this.ir = ir;
        this.authHeaders = authHeaders;
        this.httpService = httpService;
        this.httpEndpoint = httpEndpoint;
        this.allTypes = allTypes;
    }

    public get(): PostmanRequest {
        const hostArr = [getReferenceToVariable(ORIGIN_VARIABLE_NAME)];
        const pathArr = [
            ...(this.ir.basePath != null ? this.getPathArray(this.ir.basePath) : []),
            ...this.getPathArray(this.httpService.basePath),
            ...this.getPathArray(this.httpEndpoint.path)
        ];
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
                variable: this.getPathParams()
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
                                  language: PostmanRawRequestBodyLanguage.Json
                              }
                          }
                      }
        };
    }

    protected convertHeader({ header, value }: { header: HttpHeader; value?: unknown }): PostmanHeader {
        const valueOrDefault = value ?? `YOUR_${header.name.name.screamingSnakeCase.unsafeName}`;
        return {
            key: header.name.wireValue,
            description: header.docs ?? undefined,
            type: "text",
            value: valueOrDefault != null ? JSON.stringify(valueOrDefault) : ""
        };
    }

    private convertHttpMethod(httpMethod: HttpMethod): PostmanMethod {
        return HttpMethod._visit<PostmanMethod>(httpMethod, {
            get: () => PostmanMethod.Get,
            post: () => PostmanMethod.Post,
            put: () => PostmanMethod.Put,
            patch: () => PostmanMethod.Patch,
            delete: () => PostmanMethod.Delete,
            _other: () => {
                throw new Error("Unexpected httpMethod: " + httpMethod);
            }
        });
    }

    private getPathArray(path: HttpPath): string[] {
        const urlParts: string[] = [];
        if (path.head !== "/") {
            this.splitPathString(path.head).forEach((splitPart) => urlParts.push(splitPart));
        }
        path.parts.forEach((part) => {
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
