import { describe, expect, it } from "vitest";
import {
    extractLanguageFromGeneratorName,
    incrementVersion,
    isPlaceholderVersion,
    VersionBump
} from "../autoversion/VersionUtils.js";

describe("isPlaceholderVersion", () => {
    it("recognizes the canonical placeholder and its language-mapped variants", () => {
        expect(isPlaceholderVersion("0.0.0-fern-placeholder")).toBe(true);
        expect(isPlaceholderVersion("v0.0.0-fern-placeholder")).toBe(true);
        expect(isPlaceholderVersion("0.0.0.dev0")).toBe(true);
    });

    it("recognizes a placeholder that a previous run already advanced", () => {
        expect(isPlaceholderVersion("0.0.0-fern-placeholder.0")).toBe(true);
        expect(isPlaceholderVersion("0.0.0-fern-placeholder.1")).toBe(true);
    });

    it("does not match real versions, including pre-releases", () => {
        expect(isPlaceholderVersion("1.2.3")).toBe(false);
        expect(isPlaceholderVersion("v1.2.3")).toBe(false);
        expect(isPlaceholderVersion("4.0.0-rc.2")).toBe(false);
        expect(isPlaceholderVersion("0.0.0")).toBe(false);
    });
});

describe("incrementVersion", () => {
    it("refuses to advance the placeholder's pre-release counter", () => {
        expect(() => incrementVersion("0.0.0-fern-placeholder", VersionBump.PATCH)).toThrow(/placeholder version/);
        expect(() => incrementVersion("v0.0.0-fern-placeholder", VersionBump.MINOR)).toThrow(/placeholder version/);
    });

    it("still advances real pre-release lines", () => {
        expect(incrementVersion("4.0.0-rc.2", VersionBump.MINOR)).toBe("4.0.0-rc.3");
        expect(incrementVersion("1.2.3", VersionBump.MINOR)).toBe("1.3.0");
    });
});

describe("extractLanguageFromGeneratorName", () => {
    it("extracts 'typescript' from 'fernapi/fern-typescript-node-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-typescript-node-sdk")).toBe("typescript");
    });

    it("extracts 'typescript' from a ts-sdk generator name", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-ts-sdk")).toBe("typescript");
    });

    it("extracts 'typescript' from a node-sdk generator name", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-node-sdk")).toBe("typescript");
    });

    it("extracts 'python' from 'fernapi/fern-python-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-python-sdk")).toBe("python");
    });

    it("extracts 'python' from 'fernapi/fern-pydantic-model'", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-pydantic-model")).toBe("python");
    });

    it("extracts 'python' from 'fernapi/fern-fastapi-server'", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-fastapi-server")).toBe("python");
    });

    it("extracts 'python' from 'fernapi/fern-fastapi'", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-fastapi")).toBe("python");
    });

    it("extracts 'java' from 'fernapi/fern-java-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-java-sdk")).toBe("java");
    });

    it("extracts 'go' from 'fernapi/fern-go-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-go-sdk")).toBe("go");
    });

    it("extracts 'ruby' from 'fernapi/fern-ruby-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-ruby-sdk")).toBe("ruby");
    });

    it("extracts 'csharp' from 'fernapi/fern-csharp-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-csharp-sdk")).toBe("csharp");
    });

    it("extracts 'csharp' from a dotnet generator name", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-dotnet-sdk")).toBe("csharp");
    });

    it("extracts 'csharp' from a c-sharp generator name", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-c-sharp-sdk")).toBe("csharp");
    });

    it("extracts 'php' from 'fernapi/fern-php-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-php-sdk")).toBe("php");
    });

    it("extracts 'swift' from 'fernapi/fern-swift-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-swift-sdk")).toBe("swift");
    });

    it("extracts 'rust' from 'fernapi/fern-rust-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-rust-sdk")).toBe("rust");
    });

    it("extracts 'kotlin' from 'fernapi/fern-kotlin-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-kotlin-sdk")).toBe("kotlin");
    });

    it("handles mixed-case generator names", () => {
        expect(extractLanguageFromGeneratorName("fernapi/Fern-TypeScript-Node-SDK")).toBe("typescript");
        expect(extractLanguageFromGeneratorName("fernapi/FERN-PYTHON-SDK")).toBe("python");
        expect(extractLanguageFromGeneratorName("fernapi/Fern-Java-SDK")).toBe("java");
    });

    it("returns 'unknown' for unrecognised generator name", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-unknown-sdk")).toBe("unknown");
        expect(extractLanguageFromGeneratorName("some-random-generator")).toBe("unknown");
        expect(extractLanguageFromGeneratorName("")).toBe("unknown");
    });

    it("does not false-positive match 'go' in substrings like 'django' or 'mongo'", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-django-sdk")).toBe("unknown");
        expect(extractLanguageFromGeneratorName("fernapi/fern-mongo-connector")).toBe("unknown");
        expect(extractLanguageFromGeneratorName("cargo-generator")).toBe("unknown");
    });

    it("does not false-positive match 'java' in 'javascript'", () => {
        expect(extractLanguageFromGeneratorName("fernapi/fern-javascript-sdk")).toBe("unknown");
    });
});
