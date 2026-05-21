/**
 * Returns a `fetch` function that gzip-compresses request bodies using the
 * Web Streams `CompressionStream` API. Designed to be passed as the `fetch`
 * option to {@link createDocsLedgerClient} so all ledger requests are
 * transparently compressed while retaining full oRPC SDK typing.
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
