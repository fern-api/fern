import {
    HttpEndpoint,
    HttpHeader,
    HttpMethod,
    HttpPath,
    HttpService,
    IntermediateRepresentation,
    TypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { FernPostman } from "@fern-fern/postman-sdk";

import { getReferenceToVariable, ORIGIN_VARIABLE_NAME } from "../utils";
import { GeneratedRequest } from "./GeneratedRequest";

export declare namespace AbstractGeneratedRequest {
    export interface Init {
        ir: IntermediateRepresentation;
        authHeaders: FernPostman.PostmanHeader[];
        httpService: HttpService;
        httpEndpoint: HttpEndpoint;
        allTypes: TypeDeclaration[];
    }
}

export abstract class AbstractGeneratedRequest implements GeneratedRequest {
    protected ir: IntermediateRepresentation;
    protected authHeaders: FernPostman.PostmanHeader[];
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

    public get(): FernPostman.PostmanRequest {
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
                          mode: FernPostman.PostmanRequestBodyMode.Raw,
                          raw: JSON.stringify(requestBody, undefined, 4),
                          options: {
                              raw: {
                                  language: FernPostman.PostmanRawRequestBodyLanguage.Json
                              }
                          }
                      }
        };
    }

    protected convertHeader({ header, value }: { header: HttpHeader; value?: unknown }): FernPostman.PostmanHeader {
        const valueOrDefault = value ?? `YOUR_${header.name.name.screamingSnakeCase.unsafeName}`;
        return {
            key: header.name.wireValue,
            description: header.docs ?? undefined,
            type: "text",
            value: valueOrDefault != null ? JSON.stringify(valueOrDefault) : ""
        };
    }

    private convertHttpMethod(httpMethod: HttpMethod): FernPostman.PostmanMethod {
        return HttpMethod._visit<FernPostman.PostmanMethod>(httpMethod, {
            get: () => FernPostman.PostmanMethod.Get,
            post: () => FernPostman.PostmanMethod.Post,
            put: () => FernPostman.PostmanMethod.Put,
            patch: () => FernPostman.PostmanMethod.Patch,
            delete: () => FernPostman.PostmanMethod.Delete,
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

    protected abstract getQueryParams(): FernPostman.PostmanUrlVariable[];
    protected abstract getPathParams(): FernPostman.PostmanUrlVariable[];
    protected abstract getHeaders(): FernPostman.PostmanHeader[];
    protected abstract getRequestBody(): unknown;
}
