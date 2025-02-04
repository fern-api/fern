import fs from "fs";
import { join } from "path";

import { Fetcher, fetcherImpl } from "../Fetcher";
import { chooseStreamWrapper } from "../stream-wrappers/chooseStreamWrapper";

describe("Test fetcherImpl", () => {
    it("should handle successful request", async () => {
        const mockArgs: Fetcher.Args = {
            url: "https://httpbin.org/post",
            method: "POST",
            headers: { "X-Test": "x-test-header" },
            body: { data: "test" },
            contentType: "application/json",
            requestType: "json"
        };

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            text: () => Promise.resolve(JSON.stringify({ data: "test" })),
            json: () => ({ data: "test" })
        });

        const result = await fetcherImpl(mockArgs);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.body).toEqual({ data: "test" });
        }

        expect(global.fetch).toHaveBeenCalledWith(
            "https://httpbin.org/post",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({ "X-Test": "x-test-header" }),
                body: JSON.stringify({ data: "test" })
            })
        );
    });

    it("should send octet stream", async () => {
        const url = "https://httpbin.org/post/file";
        const mockArgs: Fetcher.Args = {
            url,
            method: "POST",
            headers: { "X-Test": "x-test-header" },
            contentType: "application/octet-stream",
            requestType: "bytes",
            duplex: "half",
            body: fs.createReadStream(join(__dirname, "test-file.txt"))
        };

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            text: () => Promise.resolve(JSON.stringify({ data: "test" })),
            json: () => Promise.resolve({ data: "test" })
        });

        const result = await fetcherImpl(mockArgs);

        expect(global.fetch).toHaveBeenCalledWith(
            url,
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({ "X-Test": "x-test-header" }),
                body: expect.any(fs.ReadStream)
            })
        );
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.body).toEqual({ data: "test" });
        }
    });

    it("should handle file download as blob", async () => {
        const url = "https://httpbin.org/image/png";
        const mockArgs: Fetcher.Args = {
            url,
            method: "GET",
            responseType: "file"
        };

        const mockBlob = new Blob(["mock image content"], { type: "image/png" });

        global.fetch = jest.fn().mockResolvedValue(new Response(mockBlob));

        const result = await fetcherImpl<Fetcher.FileResponseBody>(mockArgs);
        expect(result.ok).toBe(true);
        if (result.ok) {
            const blob = await result.body.blob();
            expect(blob).toBeInstanceOf(Blob);
            expect(result.body.bodyUsed).toBe(true);
        }
    });

    it("should handle file download as arraybuffer", async () => {
        const url = "https://httpbin.org/image/png";
        const mockArgs: Fetcher.Args = {
            url,
            method: "GET",
            responseType: "file"
        };

        const mockBlob = new Blob(["mock image content"], { type: "image/png" });

        global.fetch = jest.fn().mockResolvedValue(new Response(mockBlob));

        const result = await fetcherImpl<Fetcher.FileResponseBody>(mockArgs);
        expect(result.ok).toBe(true);
        if (result.ok) {
            const arrayBuffer = await result.body.arrayBuffer();
            expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
            expect(result.body.bodyUsed).toBe(true);
        }
    });

    it("should handle file download as bytes", async () => {
        const url = "https://httpbin.org/image/png";
        const mockArgs: Fetcher.Args = {
            url,
            method: "GET",
            responseType: "file"
        };

        const mockBlob = new Blob(["mock image content"], { type: "image/png" });

        global.fetch = jest.fn().mockResolvedValue(new Response(mockBlob));

        const result = await fetcherImpl<Fetcher.FileResponseBody>(mockArgs);
        expect(result.ok).toBe(true);
        if (result.ok) {
            const bytes = await result.body.bytes();
            expect(bytes).toBeInstanceOf(Uint8Array);
            expect(result.body.bodyUsed).toBe(true);
        }
    });

    it("should handle file download as stream", async () => {
        const url = "https://httpbin.org/image/png";
        const mockArgs: Fetcher.Args = {
            url,
            method: "GET",
            responseType: "file"
        };

        const mockBlob = new Blob(["mock image content"], { type: "image/png" });

        global.fetch = jest.fn().mockResolvedValue(new Response(mockBlob));

        const result = await fetcherImpl<Fetcher.FileResponseBody>(mockArgs);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.body.body).toBeInstanceOf(ReadableStream);
        }
    });
});
