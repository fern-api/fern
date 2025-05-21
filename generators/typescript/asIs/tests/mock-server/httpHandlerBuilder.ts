// requestBuilder.ts
import { HttpHandler, HttpResponse, HttpResponseResolver, JsonBodyType, http } from "msw";

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
interface HeaderStage extends BodyStage, ResponseStage {
    header(name: string, value: string): HeaderStage;
    headers(headers: Record<string, string>): BodyStage;
}

// Stage 3: Body configuration or skip to response
interface BodyStage extends ResponseStage {
    requestJsonBody(body: unknown): ResponseStage;
}

// Stage 4: Response configuration
interface ResponseStage {
    respondWithJsonBody(body: unknown): BuildStage;
    respondWith(resolver: HttpResponseResolver): BuildStage;
}

// Stage 5: Final configuration
interface BuildStage {
    build(): HttpHandler;
}

export interface HttpHandlerBuilderOptions {
    onBuild?: (handler: HttpHandler) => void;
    once?: boolean;
}

// Internal implementation class that implements all stages
class HttpHandlerBuilder implements MethodStage, HeaderStage, BodyStage, ResponseStage, BuildStage {
    private method: HttpMethod = "get";
    #baseUrl: string = "";
    private path: string = "/";
    private readonly predicates: ((resolver: HttpResponseResolver) => HttpResponseResolver)[] = [];
    private responseResolver: HttpResponseResolver | undefined = undefined;
    private readonly handlerOptions?: HttpHandlerBuilderOptions;

    constructor(options?: HttpHandlerBuilderOptions) {
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

    header(name: string, value: string): HeaderStage {
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

    respondWith(resolver: HttpResponseResolver): BuildStage {
        this.responseResolver = resolver;
        return this;
    }

    respondWithJsonBody(body: JsonBodyType): BuildStage {
        return this.respondWith(() => HttpResponse.json(body));
    }

    public build(): HttpHandler {
        if (!this.responseResolver) {
            throw new Error("Response resolver is not defined. Please call respondWith or respondWithJsonBody.");
        }
        const finalResolver = this.predicates.reduceRight((acc, predicate) => predicate(acc), this.responseResolver);
        // Create the handler using the final resolver
        const handler = http[this.method](this.buildPath(), finalResolver, this.handlerOptions);
        this.handlerOptions?.onBuild?.(handler);
        return handler;
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
export function httpHandlerBuilder(options?: HttpHandlerBuilderOptions): MethodStage {
    return new HttpHandlerBuilder(options);
}
