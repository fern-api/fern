// requestBuilder.ts
import {
    HandleRequestOptions,
    http,
    HttpHandler,
    HttpResponse,
    HttpResponseResolver,
    JsonBodyType,
    passthrough,
    RequestHandlerOptions,
} from "msw";
import { withHeaders } from "./withHeaders";
import { withJson } from "./withJson";

type HttpMethod = "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

// Stage 1: Method selection
interface MethodStage {
    baseUrl(baseUrl: string): MethodStage;
    all(path: string): HeaderStage;
    get(path: string): HeaderStage;
    post(path: string): HeaderStage;
    put(path: string): HeaderStage;
    delete(path: string): HeaderStage;
    patch(path: string): HeaderStage;
    options(path: string): HeaderStage;
    head(path: string): HeaderStage;
}

// Stage 2: Headers configuration
interface HeaderStage {
    header(name: string, value: string): BodyStage;
    headers(headers: Record<string, string>): BodyStage;
    respondWith(resolver: HttpResponseResolver): HttpHandler;
}

// Stage 3: Body configuration or skip to response
interface BodyStage {
    requestJsonBody(body: unknown): ResponseStage;
    respondWith(resolver: HttpResponseResolver): HttpHandler;
}

// Stage 4: Final response configuration
interface ResponseStage {
    respondWithJsonBody(body: unknown): HttpHandler;
    respondWith(resolver: HttpResponseResolver): HttpHandler;
}

// Internal implementation class that implements all stages
class HttpHandlerBuilder implements MethodStage, HeaderStage, BodyStage, ResponseStage {
    private method: HttpMethod = "get";
    #baseUrl: string = "";
    private path: string = "/";
    private predicates: ((resolver: HttpResponseResolver) => HttpResponseResolver)[] = [];
    private readonly handlerOptions?: RequestHandlerOptions;

    constructor(options?: RequestHandlerOptions) {
        this.handlerOptions = options;
    }

    baseUrl(baseUrl: string): MethodStage {
        this.#baseUrl = baseUrl;
        return this;
    }

    all(path: string): HeaderStage {
        this.method = "all";
        this.path = path;
        return this;
    }

    get(path: string): HeaderStage {
        this.method = "get";
        this.path = path;
        return this;
    }

    post(path: string): HeaderStage {
        this.method = "post";
        this.path = path;
        return this;
    }

    put(path: string): HeaderStage {
        this.method = "put";
        this.path = path;
        return this;
    }

    delete(path: string): HeaderStage {
        this.method = "delete";
        this.path = path;
        return this;
    }

    patch(path: string): HeaderStage {
        this.method = "patch";
        this.path = path;
        return this;
    }

    options(path: string): HeaderStage {
        this.method = "options";
        this.path = path;
        return this;
    }

    head(path: string): HeaderStage {
        this.method = "head";
        this.path = path;
        return this;
    }
    
    header(name: string, value: string): BodyStage {
        this.predicates.push((resolver) => withHeaders({ [name]: value }, resolver));
        return this;
    }

    headers(headers: Record<string, string>): BodyStage {
        this.predicates.push((resolver) => withHeaders(headers, resolver));
        return this;
    }

    requestJsonBody(body: unknown): ResponseStage {
        this.predicates.push((resolver) => withJson(body, resolver));
        return this;
    }

    respondWith(resolver: HttpResponseResolver): HttpHandler {
        // this.predicates.push(() => resolver);
        // Apply all predicates by composing them in reverse order
        const finalResolver = this.predicates.reduceRight((acc, predicate) => predicate(acc), resolver);
        // Create the handler using the final resolver
        const handler = http[this.method](this.buildPath(), finalResolver, this.handlerOptions);
        return handler;
    }

    respondWithJsonBody(body: JsonBodyType): HttpHandler {
        return this.respondWith(() => HttpResponse.json(body));
    }

    private buildPath(): string {
        if (this.#baseUrl.endsWith("/") && this.path.startsWith("/")) {
            return this.#baseUrl + this.path.slice(1);
        }
        if (!this.#baseUrl.endsWith("/") && !this.path.startsWith("/")) {
            return this.#baseUrl + "/" + this.path;
        }
        return this.#baseUrl + this.path;
    }
}

/**
 * Create a new request builder instance
 */
export function requestBuilder(options?: RequestHandlerOptions): MethodStage {
    return new HttpHandlerBuilder(options);
}
