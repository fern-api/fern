import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

const FAKE_FERN_DIR = "/fern" as AbsoluteFilePath;
const FAKE_CONFIG_PATH = "/fern/docs.yml" as AbsoluteFilePath;

const SHA256 = "sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=";
const SHA384 = "sha384-OLBgp1GsljhM2TJ+sbHjaiH9txEUvgdDTAzHv2P24donTt6/529l+9Ua0vFImLlb";
const SHA512 = "sha512-z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg/SpIdNs6c5H0NE8XYXysP+DGNKHfuwvY7kxvUdBeoGlODJ6+SfaPg==";

async function parseRawDocsYml(rawDocsYml: unknown): Promise<docsYml.ParsedDocsConfiguration> {
    const rawDocsConfiguration = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(rawDocsYml);
    return await parseDocsConfiguration({
        rawDocsConfiguration,
        absolutePathToFernFolder: FAKE_FERN_DIR,
        absoluteFilepathToDocsConfig: FAKE_CONFIG_PATH,
        context: createMockTaskContext()
    });
}

function withCsp(contentSecurityPolicy: unknown): unknown {
    return { instances: [], navigation: [], settings: { "content-security-policy": contentSecurityPolicy } };
}

describe("parseDocsConfiguration — settings.content-security-policy", () => {
    it("is undefined when the key is omitted", async () => {
        const parsed = await parseRawDocsYml({ instances: [], navigation: [] });
        expect(parsed.settings?.contentSecurityPolicy).toBeUndefined();
    });

    it("passes style-hashes and allow-eval through", async () => {
        const parsed = await parseRawDocsYml(
            withCsp({ "style-hashes": [SHA256, SHA384, SHA512], "allow-eval": false })
        );
        expect(parsed.settings?.contentSecurityPolicy).toEqual({
            styleHashes: [SHA256, SHA384, SHA512],
            allowEval: false
        });
    });

    it("keeps an empty style-hashes list, which opts into strict style-src", async () => {
        const parsed = await parseRawDocsYml(withCsp({ "style-hashes": [] }));
        expect(parsed.settings?.contentSecurityPolicy?.styleHashes).toEqual([]);
    });

    it.each([
        ["a quoted hash", `'${SHA256}'`],
        ["surrounding whitespace", ` ${SHA256}`],
        ["an unsupported algorithm", "sha1-2jmj7l5rSw0yVb/vlWAYkK/YBwk="],
        ["a truncated digest", SHA256.slice(0, -2)],
        ["a digest of the wrong algorithm", `sha384-${SHA256.slice("sha256-".length)}`],
        ["an injected directive", `${SHA256}; script-src 'unsafe-inline'`],
        ["an injected source", `${SHA256} 'unsafe-inline'`],
        ["a keyword", "'unsafe-inline'"],
        ["a scheme", "https:"],
        ["an empty string", ""]
    ])("fails parsing on %s", async (_, hash) => {
        await expect(parseRawDocsYml(withCsp({ "style-hashes": [hash] }))).rejects.toThrow();
    });

    it("fails parsing on more than 16 hashes", async () => {
        await expect(
            parseRawDocsYml(withCsp({ "style-hashes": Array.from({ length: 17 }, () => SHA256) }))
        ).rejects.toThrow();
    });

    it("rejects a non-boolean allow-eval", () => {
        expect(() =>
            docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(withCsp({ "allow-eval": "false" }))
        ).toThrow();
    });
});

describe("validateCspStyleHash", () => {
    it("accepts correctly sized sha256, sha384 and sha512 digests", () => {
        expect(docsYml.validateCspStyleHash(SHA256)).toBeUndefined();
        expect(docsYml.validateCspStyleHash(SHA384)).toBeUndefined();
        expect(docsYml.validateCspStyleHash(SHA512)).toBeUndefined();
    });

    it("tells the user to drop quotes", () => {
        expect(docsYml.validateCspStyleHash(`'${SHA256}'`)).toContain("must not be quoted");
        expect(docsYml.validateCspStyleHash(`"${SHA256}"`)).toContain("must not be quoted");
    });
});
