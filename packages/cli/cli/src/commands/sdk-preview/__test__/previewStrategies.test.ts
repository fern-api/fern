import { describe, expect, it } from "vitest";
import { getPreviewLanguage, npmPreviewStrategy, pypiPreviewStrategy } from "../previewStrategies.js";

describe("getPreviewLanguage", () => {
    it("recognizes known TypeScript SDK generators as npm", () => {
        expect(getPreviewLanguage("fernapi/fern-typescript-node-sdk")).toBe("npm");
        expect(getPreviewLanguage("fernapi/fern-typescript-browser-sdk")).toBe("npm");
        expect(getPreviewLanguage("fernapi/fern-typescript-sdk")).toBe("npm");
    });

    it("recognizes Python SDK as pypi", () => {
        expect(getPreviewLanguage("fernapi/fern-python-sdk")).toBe("pypi");
    });

    it("returns undefined for unknown TypeScript generators", () => {
        expect(getPreviewLanguage("custom/my-typescript-generator")).toBeUndefined();
    });

    it("returns undefined for Java generators", () => {
        expect(getPreviewLanguage("fernapi/fern-java-sdk")).toBeUndefined();
    });

    it("returns undefined for Go generators", () => {
        expect(getPreviewLanguage("fernapi/fern-go-sdk")).toBeUndefined();
    });

    it("returns undefined for Ruby generators", () => {
        expect(getPreviewLanguage("fernapi/fern-ruby-sdk")).toBeUndefined();
    });

    it("returns undefined for C# generators", () => {
        expect(getPreviewLanguage("fernapi/fern-csharp-sdk")).toBeUndefined();
    });
});

describe("npmPreviewStrategy.buildOutputMode", () => {
    it("produces publishV2(npmOverride) with the supplied fields", () => {
        const mode = npmPreviewStrategy.buildOutputMode({
            registryUrl: "https://npm.example.com",
            packageName: "@acme-preview/sdk",
            token: "tok-123"
        });
        expect(mode.type).toBe("publishV2");
        let captured: { registryUrl?: string; packageName?: string; token?: string } = {};
        mode._visit<void>({
            publishV2: (v) =>
                v._visit<void>({
                    npmOverride: (n) => {
                        captured = {
                            registryUrl: n?.registryUrl,
                            packageName: n?.packageName,
                            token: n?.token
                        };
                    },
                    pypiOverride: () => expect.fail("expected npmOverride"),
                    mavenOverride: () => expect.fail("expected npmOverride"),
                    nugetOverride: () => expect.fail("expected npmOverride"),
                    rubyGemsOverride: () => expect.fail("expected npmOverride"),
                    cratesOverride: () => expect.fail("expected npmOverride"),
                    postman: () => expect.fail("expected npmOverride"),
                    _other: () => expect.fail("expected npmOverride")
                }),
            downloadFiles: () => expect.fail("expected publishV2"),
            github: () => expect.fail("expected publishV2"),
            githubV2: () => expect.fail("expected publishV2"),
            publish: () => expect.fail("expected publishV2"),
            _other: () => expect.fail("expected publishV2")
        });
        expect(captured).toEqual({
            registryUrl: "https://npm.example.com",
            packageName: "@acme-preview/sdk",
            token: "tok-123"
        });
    });
});

describe("pypiPreviewStrategy.buildOutputMode", () => {
    it("produces publishV2(pypiOverride) with username '__token__'", () => {
        const mode = pypiPreviewStrategy.buildOutputMode({
            registryUrl: "https://pypi.example.com/legacy/",
            packageName: "acme-preview-acme-sdk",
            token: "pypi-pw"
        });
        expect(mode.type).toBe("publishV2");
        let captured: {
            registryUrl?: string;
            coordinate?: string;
            username?: string;
            password?: string;
        } = {};
        mode._visit<void>({
            publishV2: (v) =>
                v._visit<void>({
                    pypiOverride: (p) => {
                        captured = {
                            registryUrl: p?.registryUrl,
                            coordinate: p?.coordinate,
                            username: p?.username,
                            password: p?.password
                        };
                    },
                    npmOverride: () => expect.fail("expected pypiOverride"),
                    mavenOverride: () => expect.fail("expected pypiOverride"),
                    nugetOverride: () => expect.fail("expected pypiOverride"),
                    rubyGemsOverride: () => expect.fail("expected pypiOverride"),
                    cratesOverride: () => expect.fail("expected pypiOverride"),
                    postman: () => expect.fail("expected pypiOverride"),
                    _other: () => expect.fail("expected pypiOverride")
                }),
            downloadFiles: () => expect.fail("expected publishV2"),
            github: () => expect.fail("expected publishV2"),
            githubV2: () => expect.fail("expected publishV2"),
            publish: () => expect.fail("expected publishV2"),
            _other: () => expect.fail("expected publishV2")
        });
        expect(captured).toEqual({
            registryUrl: "https://pypi.example.com/legacy/",
            coordinate: "acme-preview-acme-sdk",
            username: "__token__",
            password: "pypi-pw"
        });
    });
});

describe("sanitizeForVersion", () => {
    it("npm passes through unchanged", () => {
        expect(npmPreviewStrategy.sanitizeForVersion("feat-add-auth")).toBe("feat-add-auth");
    });

    it("pypi collapses to dots and lowercases", () => {
        expect(pypiPreviewStrategy.sanitizeForVersion("Feat-Add_Auth")).toBe("feat.add.auth");
    });

    it("pypi handles empty string", () => {
        expect(pypiPreviewStrategy.sanitizeForVersion("")).toBe("preview");
    });

    it("pypi caps length", () => {
        const long = "a".repeat(80);
        expect(pypiPreviewStrategy.sanitizeForVersion(long).length).toBeLessThanOrEqual(64);
    });

    it("pypi treats unicode as separator", () => {
        expect(pypiPreviewStrategy.sanitizeForVersion("caf\u00e9-feat")).toBe("caf.feat");
    });
});
