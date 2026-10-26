import { describe, expect, it, vi } from "vitest";

import { findSdkGenSnippetsUrls } from "../findSdkGenSnippets.js";

const query = {
    origin: "https://sdk-gen.example",
    token: "secret-token",
    organization: "acme",
    sdkName: "api",
    version: "1.2.3",
    languages: ["typescript", "python"]
};

const page = (data: Array<{ language: string; snippetsUrl?: string }>, pages = 1) => ({
    data: { data, count: data.length, pages }
});

describe("findSdkGenSnippetsUrls", () => {
    it("asks the sdk-gen-api for the successfully built SDKs of the name, version and languages", async () => {
        const get = vi.fn(async (_url: string, _options: object) => page([]));

        await findSdkGenSnippetsUrls(query, get);

        expect(get).toHaveBeenCalledTimes(1);
        const [url, options] = get.mock.calls[0] ?? [];
        const parsed = new URL(String(url));
        expect(`${parsed.origin}${parsed.pathname}`).toBe("https://sdk-gen.example/v1/fern/artifacts");
        expect(parsed.searchParams.get("sdkName")).toBe("api");
        expect(parsed.searchParams.get("version")).toBe("1.2.3");
        expect(parsed.searchParams.get("status")).toBe("SUCCESS");
        expect(parsed.searchParams.getAll("language")).toEqual(["typescript", "python"]);
        expect(parsed.searchParams.get("limit")).toBe("50");
        expect(parsed.searchParams.get("offset")).toBe("0");
        expect(options).toMatchObject({
            headers: { Authorization: "Bearer secret-token", "X-Fern-Organization-Id": "acme" }
        });
    });

    it("takes the link of the newest SDK of each language", async () => {
        const get = vi.fn(async (_url: string, _options: object) =>
            page([
                { language: "typescript", snippetsUrl: "https://s3/new-ts" },
                { language: "python", snippetsUrl: "https://s3/new-py" },
                { language: "typescript", snippetsUrl: "https://s3/old-ts" }
            ])
        );

        expect([...(await findSdkGenSnippetsUrls(query, get))]).toEqual([
            ["typescript", "https://s3/new-ts"],
            ["python", "https://s3/new-py"]
        ]);
    });

    it("skips a newer SDK that saved no snippets file and takes an older one's", async () => {
        const get = vi.fn(async (_url: string, _options: object) =>
            page([{ language: "typescript" }, { language: "typescript", snippetsUrl: "https://s3/older-ts" }])
        );

        const urls = await findSdkGenSnippetsUrls({ ...query, languages: ["typescript"] }, get);

        expect([...urls]).toEqual([["typescript", "https://s3/older-ts"]]);
    });

    it("reads the next page until every language has a link", async () => {
        const get = vi
            .fn<(url: string, options: object) => Promise<{ data: unknown }>>()
            .mockResolvedValueOnce(page([{ language: "typescript", snippetsUrl: "https://s3/ts" }], 3))
            .mockResolvedValueOnce(page([{ language: "python", snippetsUrl: "https://s3/py" }], 3));

        const urls = await findSdkGenSnippetsUrls(query, get);

        expect(get).toHaveBeenCalledTimes(2);
        expect(new URL(String(get.mock.calls[1]?.[0])).searchParams.get("offset")).toBe("50");
        expect([...urls.keys()]).toEqual(["typescript", "python"]);
    });

    it("stops at the last page, and returns the languages it found", async () => {
        const get = vi.fn(async (_url: string, _options: object) =>
            page([{ language: "typescript", snippetsUrl: "https://s3/ts" }], 1)
        );

        const urls = await findSdkGenSnippetsUrls(query, get);

        expect(get).toHaveBeenCalledTimes(1);
        expect([...urls.keys()]).toEqual(["typescript"]);
    });

    it("gives up after four pages", async () => {
        const get = vi.fn(async (_url: string, _options: object) => page([], 100));

        await findSdkGenSnippetsUrls(query, get);

        expect(get).toHaveBeenCalledTimes(4);
    });

    it("fails on a response that is not an artifact list", async () => {
        const get = vi.fn(async (_url: string, _options: object) => ({ data: { unexpected: true } }));

        await expect(findSdkGenSnippetsUrls(query, get)).rejects.toThrow("unexpected artifact list");
    });
});
