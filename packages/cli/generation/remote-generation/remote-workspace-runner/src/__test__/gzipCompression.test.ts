import { promisify } from "util";
import { describe, expect, it } from "vitest";
import { gunzip, gunzipSync, gzip, gzipSync } from "zlib";

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

describe("gzip compression for IR upload", () => {
    it("should compress JSON string and produce valid gzip output", () => {
        const irJson = JSON.stringify({ types: {}, services: {}, apiName: "test-api" });
        const irBytes = new TextEncoder().encode(irJson);
        const compressed = gzipSync(irBytes);

        // Verify gzip magic bytes
        expect(compressed[0]).toBe(0x1f);
        expect(compressed[1]).toBe(0x8b);

        // Verify output is valid gzip (can be decompressed)
        const decompressed = gunzipSync(new Uint8Array(compressed));
        expect(decompressed.toString("utf-8")).toBe(irJson);
    });

    it("should roundtrip: compress then decompress produces original JSON", () => {
        const irJson = JSON.stringify({
            types: { User: { name: "User", properties: [{ name: "id", type: "string" }] } },
            services: { UserService: { endpoints: [{ path: "/users", method: "GET" }] } },
            apiName: "my-api"
        });
        const irBytes = new TextEncoder().encode(irJson);
        const compressed = gzipSync(irBytes);
        const decompressed = gunzipSync(new Uint8Array(compressed));

        expect(decompressed.toString("utf-8")).toBe(irJson);
    });

    it("should achieve significant compression on repetitive IR-like JSON", () => {
        // Simulate a realistic IR with many repeated keys (like a real Fern IR)
        const types: Record<string, unknown> = {};
        for (let i = 0; i < 1000; i++) {
            types[`type_${i}`] = {
                name: {
                    originalName: `Type${i}`,
                    camelCase: { unsafeName: `type${i}`, safeName: `type${i}` }
                },
                shape: {
                    type: "object",
                    properties: [
                        { name: "id", type: "string" },
                        { name: "name", type: "string" }
                    ]
                }
            };
        }
        const irJson = JSON.stringify({ types, services: {}, apiName: "large-api" });
        const irBytes = new TextEncoder().encode(irJson);
        const compressed = gzipSync(irBytes);

        const reductionPercent = (1 - compressed.length / irBytes.byteLength) * 100;

        // Should achieve at least 70% compression on repetitive JSON
        expect(reductionPercent).toBeGreaterThan(70);
    });

    it("should produce a Buffer that can be passed directly to formData.append", () => {
        const irJson = JSON.stringify({ apiName: "test" });
        const irBytes = new TextEncoder().encode(irJson);
        const compressed = gzipSync(irBytes);

        // gzipSync returns a Buffer (which is a Uint8Array subclass)
        expect(Buffer.isBuffer(compressed)).toBe(true);
        // .length is available on Buffer
        expect(typeof compressed.length).toBe("number");
        expect(compressed.length).toBeGreaterThan(0);
    });

    it("should handle empty JSON object", () => {
        const irJson = "{}";
        const irBytes = new TextEncoder().encode(irJson);
        const compressed = gzipSync(irBytes);

        // Should still produce valid gzip
        expect(compressed[0]).toBe(0x1f);
        expect(compressed[1]).toBe(0x8b);

        const decompressed = gunzipSync(new Uint8Array(compressed));
        expect(decompressed.toString("utf-8")).toBe(irJson);
    });

    it("should handle unicode characters in IR JSON", () => {
        const irJson = JSON.stringify({ apiName: "test-api", description: "API für Benutzer — 日本語テスト" });
        const irBytes = new TextEncoder().encode(irJson);
        const compressed = gzipSync(irBytes);
        const decompressed = gunzipSync(new Uint8Array(compressed));

        expect(decompressed.toString("utf-8")).toBe(irJson);
    });

    it("should correctly report compression stats on realistic payload", () => {
        // Use a payload large enough that gzip compression is effective
        // (small payloads may be larger after gzip due to header overhead)
        const types: Record<string, unknown> = {};
        for (let i = 0; i < 100; i++) {
            types[`type_${i}`] = { name: `Type${i}`, shape: "object" };
        }
        const irJson = JSON.stringify({ types, services: {}, apiName: "stats-test" });
        const irBytes = new TextEncoder().encode(irJson);
        const compressed = gzipSync(irBytes);

        const originalSize = irBytes.byteLength;
        const compressedSize = compressed.length;
        const reductionPercent = ((1 - compressedSize / originalSize) * 100).toFixed(1);

        expect(originalSize).toBeGreaterThan(0);
        expect(compressedSize).toBeGreaterThan(0);
        expect(compressedSize).toBeLessThan(originalSize);
        expect(Number.parseFloat(reductionPercent)).toBeGreaterThan(0);
    });

    it("TextEncoder.encode produces Uint8Array compatible with gzipSync", () => {
        const text = "Hello, gzip!";
        const encoded = new TextEncoder().encode(text);

        // TextEncoder produces Uint8Array
        expect(encoded).toBeInstanceOf(Uint8Array);

        // gzipSync accepts it without error
        const compressed = gzipSync(encoded);
        expect(compressed.length).toBeGreaterThan(0);

        // Roundtrip works
        const decompressed = gunzipSync(new Uint8Array(compressed));
        expect(decompressed.toString("utf-8")).toBe(text);
    });

    it("async gzip produces identical output to gzipSync", async () => {
        const irJson = JSON.stringify({ types: {}, services: {}, apiName: "async-test" });
        const irBytes = new TextEncoder().encode(irJson);

        const syncResult = gzipSync(irBytes);
        const asyncResult = await gzipAsync(irBytes);

        // Both should decompress to the same original content
        const syncDecompressed = gunzipSync(new Uint8Array(syncResult));
        const asyncDecompressed = await gunzipAsync(new Uint8Array(asyncResult));
        expect(syncDecompressed.toString("utf-8")).toBe(irJson);
        expect(asyncDecompressed.toString("utf-8")).toBe(irJson);

        // Both should have gzip magic bytes
        expect(asyncResult[0]).toBe(0x1f);
        expect(asyncResult[1]).toBe(0x8b);
    });
});
