/**
 * Describes an HTTP request flowing through the interceptor pipeline.
 */
export interface InterceptedRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: BodyInit;
}

/**
 * Describes an HTTP response returned from the interceptor pipeline.
 */
export interface InterceptedResponse {
    status: number;
    headers: Headers;
    body?: ReadableStream<Uint8Array> | null;
    rawResponse: Response;
}

/**
 * A function that sends a request and returns a response.
 * Used as the `next` parameter in interceptors.
 */
export type SendRequest = (request: InterceptedRequest) => Promise<InterceptedResponse>;

/**
 * An interceptor that can observe or modify requests and responses
 * as they flow through the HTTP pipeline.
 *
 * Interceptors follow the middleware pattern: each interceptor receives
 * the request and a `next` function to call the next interceptor in
 * the chain (or the actual HTTP call if it's the last one).
 *
 * @example
 * ```typescript
 * const loggingInterceptor: Interceptor = {
 *     name: "logging",
 *     async sendRequest(request, next) {
 *         console.log(`→ ${request.method} ${request.url}`);
 *         const response = await next(request);
 *         console.log(`← ${response.status}`);
 *         return response;
 *     }
 * };
 * ```
 *
 * @example
 * ```typescript
 * import { context, propagation, trace } from "@opentelemetry/api";
 *
 * const tracingInterceptor: Interceptor = {
 *     name: "otel-tracing",
 *     async sendRequest(request, next) {
 *         const tracer = trace.getTracer("my-sdk");
 *         return tracer.startActiveSpan(`HTTP ${request.method}`, async (span) => {
 *             propagation.inject(context.active(), request.headers);
 *             try {
 *                 const response = await next(request);
 *                 span.setAttribute("http.status_code", response.status);
 *                 return response;
 *             } catch (error) {
 *                 span.recordException(error as Error);
 *                 throw error;
 *             } finally {
 *                 span.end();
 *             }
 *         });
 *     }
 * };
 * ```
 */
export interface Interceptor {
    /** A name for the interceptor, useful for debugging and identification. */
    name: string;

    /**
     * Intercept the request. Call `next` to continue the pipeline.
     *
     * @param request - The outgoing request. You may modify it before calling `next`.
     * @param next - Call this to continue the pipeline. You must call it exactly once.
     * @returns The response from the server (or from downstream interceptors).
     */
    sendRequest(request: InterceptedRequest, next: SendRequest): Promise<InterceptedResponse>;
}

/**
 * Builds a composed `SendRequest` function from an array of interceptors
 * and a final handler. Interceptors are applied in order: the first interceptor
 * in the array is the outermost (first to see the request, last to see the response).
 */
export function buildInterceptorChain(interceptors: Interceptor[], finalHandler: SendRequest): SendRequest {
    let handler = finalHandler;
    for (let i = interceptors.length - 1; i >= 0; i--) {
        const interceptor = interceptors[i]!;
        const next = handler;
        handler = (request) => interceptor.sendRequest(request, next);
    }
    return handler;
}
