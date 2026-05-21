import type { TaskContext } from "@fern-api/task-context";
import { promisify } from "util";
import { gzip } from "zlib";

const gzipAsync = promisify(gzip);

/**
 * Returns a `fetch` function that gzip-compresses JSON request bodies before
 * sending. Designed to be passed as the `fetch` option to
 * {@link createDocsLedgerClient} so all ledger requests are transparently
 * compressed while retaining full oRPC SDK typing.
 *
 * The FDR server registers `@fastify/compress` which transparently
 * decompresses incoming `Content-Encoding: gzip` request bodies.
 */
export function createGzipFetch(context: TaskContext): typeof globalThis.fetch {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        // The oRPC `LinkFetchClient` calls fetch with a fully-formed Request
        // object as the first argument. The body is baked into the Request.
        if (input instanceof Request && init?.body == null) {
            const body = await input.clone().text();
            if (body.length > 0) {
                const jsonBytes = Buffer.from(body, "utf-8");
                const compressed = await gzipAsync(jsonBytes);

                const ratio = ((1 - compressed.length / jsonBytes.byteLength) * 100).toFixed(1);
                context.logger.debug(
                    `[ledger] Compressed request from ${jsonBytes.byteLength} to ${compressed.length} bytes (${ratio}% reduction)`
                );

                const headers = new Headers(input.headers);
                headers.set("Content-Encoding", "gzip");

                const compressedRequest = new Request(input.url, {
                    method: input.method,
                    headers,
                    body: compressed,
                    signal: input.signal
                });
                return globalThis.fetch(compressedRequest, init);
            }
        }

        // Fallback: plain string body in init (non-oRPC callers).
        if (init?.body != null && typeof init.body === "string") {
            const jsonBytes = Buffer.from(init.body, "utf-8");
            const compressed = await gzipAsync(jsonBytes);

            const ratio = ((1 - compressed.length / jsonBytes.byteLength) * 100).toFixed(1);
            context.logger.debug(
                `[ledger] Compressed request from ${jsonBytes.byteLength} to ${compressed.length} bytes (${ratio}% reduction)`
            );

            const headers = new Headers(init.headers);
            headers.set("Content-Encoding", "gzip");

            return globalThis.fetch(input, {
                ...init,
                headers,
                body: compressed
            });
        }

        return globalThis.fetch(input, init);
    };
}
