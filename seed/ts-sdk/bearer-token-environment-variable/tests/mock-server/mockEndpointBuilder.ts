import { DefaultBodyType, HttpHandler, HttpResponse, HttpResponseResolver, http } from "msw";

import { toJson } from "../../src/core/json";
import { withHeaders } from "./withHeaders";
import { withJson } from "./withJson";

type HttpMethod = "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

interface MethodStage {
    baseUrl(baseUrl: string): MethodStage;
    all(path: string): RequestHeadersStage;
    get(path: string): RequestHeadersStage;
    post(path: string): RequestHeadersStage;
    put(path: string): RequestHeadersStage;
    delete(path: string): RequestHeadersStage;
    patch(path: string): RequestHeadersStage;
    options(path: string): RequestHeadersStage;
    head(path: string): RequestHeadersStage;
}

interface RequestHeadersStage extends RequestBodyStage, ResponseStage {
    header(name: string, value: string): RequestHeadersStage;
    headers(headers: Record<string, string>): RequestBodyStage;
}

interface RequestBodyStage extends ResponseStage {
    jsonBody(body: unknown): ResponseStage;
}

interface ResponseStage {
    respondWith(): ResponseStatusStage;
}
interface ResponseStatusStage {
    statusCode(statusCode: number): ResponseHeaderStage;
}

interface ResponseHeaderStage extends ResponseBodyStage, BuildStage {
    header(name: string, value: string): ResponseHeaderStage;
    headers(headers: Record<string, string>): ResponseHeaderStage;
}

interface ResponseBodyStage {
    jsonBody(body: unknown): BuildStage;
}

interface BuildStage {
    build(): HttpHandler;
}

export interface HttpHandlerBuilderOptions {
    onBuild?: (handler: HttpHandler) => void;
    once?: boolean;
}

class RequestBuilder implements MethodStage, RequestHeadersStage, RequestBodyStage, ResponseStage {
    private method: HttpMethod = "get";
    private _baseUrl: string = "";
    private path: string = "/";
    private readonly predicates: ((resolver: HttpResponseResolver) => HttpResponseResolver)[] = [];
    private readonly handlerOptions?: HttpHandlerBuilderOptions;

    constructor(options?: HttpHandlerBuilderOptions) {
        this.handlerOptions = options;
    }

    baseUrl(baseUrl: string): MethodStage {
        this._baseUrl = baseUrl;
        return this;
    }

    all(path: string): RequestHeadersStage {
        this.method = "all";
        this.path = path;
        return this;
    }

    get(path: string): RequestHeadersStage {
        this.method = "get";
        this.path = path;
        return this;
    }

    post(path: string): RequestHeadersStage {
        this.method = "post";
        this.path = path;
        return this;
    }

    put(path: string): RequestHeadersStage {
        this.method = "put";
        this.path = path;
        return this;
    }

    delete(path: string): RequestHeadersStage {
        this.method = "delete";
        this.path = path;
        return this;
    }

    patch(path: string): RequestHeadersStage {
        this.method = "patch";
        this.path = path;
        return this;
    }

    options(path: string): RequestHeadersStage {
        this.method = "options";
        this.path = path;
        return this;
    }

    head(path: string): RequestHeadersStage {
        this.method = "head";
        this.path = path;
        return this;
    }

    header(name: string, value: string): RequestHeadersStage {
        this.predicates.push((resolver) => withHeaders({ [name]: value }, resolver));
        return this;
    }

    headers(headers: Record<string, string>): RequestBodyStage {
        this.predicates.push((resolver) => withHeaders(headers, resolver));
        return this;
    }

    jsonBody(body: unknown): ResponseStage {
        this.predicates.push((resolver) => withJson(body, resolver));
        return this;
    }

    respondWith(): ResponseStatusStage {
        return new ResponseBuilder(this.method, this.buildPath(), this.predicates, this.handlerOptions);
    }

    private buildPath(): string {
        if (this._baseUrl.endsWith("/") && this.path.startsWith("/")) {
            return this._baseUrl + this.path.slice(1);
        }
        if (!this._baseUrl.endsWith("/") && !this.path.startsWith("/")) {
            return this._baseUrl + "/" + this.path;
        }
        return this._baseUrl + this.path;
    }
}

class ResponseBuilder implements ResponseStatusStage, ResponseHeaderStage, ResponseBodyStage, BuildStage {
    private readonly method: HttpMethod;
    private readonly path: string;
    private readonly requestPredicates: ((resolver: HttpResponseResolver) => HttpResponseResolver)[];
    private readonly handlerOptions?: HttpHandlerBuilderOptions;

    private responseStatusCode: number = 200;
    private responseHeaders: Record<string, string> = {};
    private responseBody: DefaultBodyType = undefined;

    constructor(
        method: HttpMethod,
        path: string,
        requestPredicates: ((resolver: HttpResponseResolver) => HttpResponseResolver)[],
        options?: HttpHandlerBuilderOptions,
    ) {
        this.method = method;
        this.path = path;
        this.requestPredicates = requestPredicates;
        this.handlerOptions = options;
    }

    public statusCode(code: number): ResponseHeaderStage {
        this.responseStatusCode = code;
        return this;
    }

    public header(name: string, value: string): ResponseHeaderStage {
        this.responseHeaders[name] = value;
        return this;
    }

    public headers(headers: Record<string, string>): ResponseHeaderStage {
        this.responseHeaders = { ...this.responseHeaders, ...headers };
        return this;
    }

    public jsonBody(body: unknown): BuildStage {
        this.responseBody = toJson(body);
        return this;
    }

    public build(): HttpHandler {
        const responseResolver: HttpResponseResolver = () => {
            return new HttpResponse(this.responseBody, {
                status: this.responseStatusCode,
                headers: this.responseHeaders,
            });
        };

        const finalResolver = this.requestPredicates.reduceRight((acc, predicate) => predicate(acc), responseResolver);

        const handler = http[this.method](this.path, finalResolver, this.handlerOptions);
        this.handlerOptions?.onBuild?.(handler);
        return handler;
    }
}

export function mockEndpointBuilder(options?: HttpHandlerBuilderOptions): MethodStage {
    return new RequestBuilder(options);
}
