/**
 * Returns a `fetch` function that gzip-compresses request bodies using the
 * Web Streams `CompressionStream` API.
 *
 * Designed to be captured by oRPC's `LinkFetchClient` at construction time
 * so all subsequent requests through the client are transparently compressed.
 *
 * The FDR server registers `@fastify/compress` which transparently
 * decompresses incoming `Content-Encoding: gzip` request bodies.
 */
export function createGzipFetch(): typeof globalThis.fetch {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        if (input instanceof Request && input.body != null) {
            const headers = new Headers(input.headers);
            headers.set("Content-Encoding", "gzip");
            headers.delete("Content-Length");

            const compressedBody = input.body.pipeThrough(new CompressionStream("gzip"));

            const compressedRequest = new Request(input.url, {
                method: input.method,
                headers,
                body: compressedBody,
                // @ts-expect-error duplex required for streaming request bodies in Node.js
                duplex: "half"
            });
            return globalThis.fetch(compressedRequest, init);
        }

        return globalThis.fetch(input, init);
    };
}

/**
 * Gzip-compresses a JSON body and returns a `RequestInit` suitable for
 * `fetch()`, with the correct `Content-Encoding` and `Content-Type` headers.
 */
export async function gzipJsonBody(body: unknown): Promise<{ body: ReadableStream; headers: Record<string, string> }> {
    const json = JSON.stringify(body);
    const stream = new Blob([json]).stream().pipeThrough(new CompressionStream("gzip"));
    return {
        body: stream,
        headers: {
            "Content-Encoding": "gzip",
            "Content-Type": "application/json"
        }
    };
}
