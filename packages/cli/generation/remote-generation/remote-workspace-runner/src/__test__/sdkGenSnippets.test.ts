import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
    downloadSnippetsJson,
    isSdkGenSnippetsEnabled,
    parseSdkSnippetsJson,
    SDK_GEN_SNIPPETS_ENV_VAR
} from "../sdkGenSnippets.js";

vi.mock("axios");

const SNIPPETS_JSON = JSON.stringify({
    endpoints: {
        "/pet": { post: "client.pet.create()", put: "client.pet.update()" },
        "/pet/{petId}": { get: "client.pet.get()" }
    }
});

afterEach(() => {
    delete process.env[SDK_GEN_SNIPPETS_ENV_VAR];
});

describe("isSdkGenSnippetsEnabled", () => {
    it.each([
        ["true", true],
        [" TRUE ", true],
        ["false", false],
        ["1", false],
        ["", false]
    ])("reads %j as %s", (value, expected) => {
        process.env[SDK_GEN_SNIPPETS_ENV_VAR] = value;
        expect(isSdkGenSnippetsEnabled()).toBe(expected);
    });

    it("is off when the variable is unset", () => {
        expect(isSdkGenSnippetsEnabled()).toBe(false);
    });
});

describe("parseSdkSnippetsJson", () => {
    it("reads endpoints, upper-casing the methods", () => {
        expect(parseSdkSnippetsJson(SNIPPETS_JSON)).toEqual([
            { path: "/pet", method: "POST", code: "client.pet.create()" },
            { path: "/pet", method: "PUT", code: "client.pet.update()" },
            { path: "/pet/{petId}", method: "GET", code: "client.pet.get()" }
        ]);
    });

    it("reads endpoints nested under snippets", () => {
        expect(parseSdkSnippetsJson('{"snippets":{"endpoints":{"/a":{"delete":"x"}}}}')).toEqual([
            { path: "/a", method: "DELETE", code: "x" }
        ]);
    });

    it("drops methods the docs cannot use and empty code", () => {
        const text = '{"endpoints":{"/a":{"options":"x","get":"  ","post":"ok","patch":3}}}';
        expect(parseSdkSnippetsJson(text)).toEqual([{ path: "/a", method: "POST", code: "ok" }]);
    });

    it.each(["{}", "[]", "null", '{"endpoints":[]}', '{"endpoints":{"/a":"nope"}}'])("finds nothing in %s", (text) => {
        expect(parseSdkSnippetsJson(text)).toEqual([]);
    });

    it("throws on text that is not JSON", () => {
        expect(() => parseSdkSnippetsJson("not json")).toThrow();
    });
});

describe("downloadSnippetsJson", () => {
    it("returns the text of the file the link points at, unparsed", async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: SNIPPETS_JSON });

        expect(await downloadSnippetsJson("https://example.com/placeholders-snippets.json")).toBe(SNIPPETS_JSON);
        expect(axios.get).toHaveBeenCalledWith(
            "https://example.com/placeholders-snippets.json",
            expect.objectContaining({ responseType: "text" })
        );
    });

    it("rejects when the download fails", async () => {
        vi.mocked(axios.get).mockRejectedValue(new Error("network down"));

        await expect(downloadSnippetsJson("https://example.com/placeholders-snippets.json")).rejects.toThrow(
            "network down"
        );
    });
});
