import fetchMock from "fetch-mock-jest";
import fs from "fs";
import { Fetcher, fetcherImpl } from "../../../src/core/fetcher/Fetcher";
import { join } from "path";

describe("Test fetcherImpl", () => {
    it("should handle successful request", async () => {
        const mockArgs: Fetcher.Args = {
            url: "https://httpbin.org/post",
            method: "POST",
            headers: { "X-Test": "x-test-header" },
            body: { data: "test" },
            contentType: "application/json",
            requestType: "json",
        };

        fetchMock.mock("https://httpbin.org/post", 200, {
            response: JSON.stringify({ data: "test" }),
        });

        const result = await fetcherImpl(mockArgs);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.body).toEqual({ data: "test" });
        }
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
            body: fs.createReadStream(join(__dirname, "test-file.txt")),
        };

        fetchMock.mock("https://httpbin.org/post/file", 200, {
            response: JSON.stringify({ data: "test" }),
        });

        const result = await fetcherImpl(mockArgs);

        expect(fetchMock).toHaveFetched(url, {
            method: "POST",
            body: fs.createReadStream(join(__dirname, "test-file.txt")).read(),
        });
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.body).toEqual({ data: "test" });
        }
    });
});
