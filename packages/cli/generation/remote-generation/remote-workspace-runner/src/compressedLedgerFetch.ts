import type { TaskContext } from "@fern-api/task-context";
import { promisify } from "util";
import { gzip } from "zlib";

const gzipAsync = promisify(gzip);

/**
 * POST a JSON body to a docs-ledger endpoint with gzip compression.
 *
 * The FDR server registers `@fastify/compress` which transparently
 * decompresses incoming `Content-Encoding: gzip` request bodies. Compressing
 * the publish payloads on the wire can significantly reduce transfer time for
 * large multi-locale deployments where the JSON body contains many page refs,
 * nav trees, and config objects.
 */
export async function compressedLedgerPost<T>({
    url,
    body,
    token,
    headers,
    context
}: {
    url: string;
    body: unknown;
    token: string;
    headers?: Record<string, string>;
    context: TaskContext;
}): Promise<T> {
    const jsonBytes = Buffer.from(JSON.stringify(body), "utf-8");
    const compressed = await gzipAsync(jsonBytes);

    const ratio = ((1 - compressed.length / jsonBytes.byteLength) * 100).toFixed(1);
    context.logger.debug(
        `[ledger] Compressed request from ${jsonBytes.byteLength} to ${compressed.length} bytes (${ratio}% reduction)`
    );

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Encoding": "gzip",
            Authorization: `Bearer ${token}`,
            ...headers
        },
        body: compressed
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`[ledger] POST ${url} failed: ${response.status} ${text}`);
    }

    return (await response.json()) as T;
}
