import { describe, expect, it } from "vitest";
import { extractLanguageFromGeneratorName } from "../autoversion/VersionUtils.js";

describe("extractLanguageFromGeneratorName", () => {
    it("extracts 'typescript' from 'fernenterprise/fern-typescript-node-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-typescript-node-sdk")).toBe("typescript");
    });

    it("extracts 'typescript' from a ts-sdk generator name", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-ts-sdk")).toBe("typescript");
    });

    it("extracts 'typescript' from a node-sdk generator name", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-node-sdk")).toBe("typescript");
    });

    it("extracts 'python' from 'fernenterprise/fern-python-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-python-sdk")).toBe("python");
    });

    it("extracts 'python' from 'fernenterprise/fern-pydantic-model'", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-pydantic-model")).toBe("python");
    });

    it("extracts 'python' from 'fernenterprise/fern-fastapi-server'", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-fastapi-server")).toBe("python");
    });

    it("extracts 'python' from 'fernenterprise/fern-fastapi'", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-fastapi")).toBe("python");
    });

    it("extracts 'java' from 'fernenterprise/fern-java-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-java-sdk")).toBe("java");
    });

    it("extracts 'go' from 'fernenterprise/fern-go-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-go-sdk")).toBe("go");
    });

    it("extracts 'ruby' from 'fernenterprise/fern-ruby-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-ruby-sdk")).toBe("ruby");
    });

    it("extracts 'csharp' from 'fernenterprise/fern-csharp-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-csharp-sdk")).toBe("csharp");
    });

    it("extracts 'csharp' from a dotnet generator name", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-dotnet-sdk")).toBe("csharp");
    });

    it("extracts 'csharp' from a c-sharp generator name", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-c-sharp-sdk")).toBe("csharp");
    });

    it("extracts 'php' from 'fernenterprise/fern-php-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-php-sdk")).toBe("php");
    });

    it("extracts 'swift' from 'fernenterprise/fern-swift-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-swift-sdk")).toBe("swift");
    });

    it("extracts 'rust' from 'fernenterprise/fern-rust-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-rust-sdk")).toBe("rust");
    });

    it("extracts 'kotlin' from 'fernenterprise/fern-kotlin-sdk'", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-kotlin-sdk")).toBe("kotlin");
    });

    it("handles mixed-case generator names", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/Fern-TypeScript-Node-SDK")).toBe("typescript");
        expect(extractLanguageFromGeneratorName("fernenterprise/FERN-PYTHON-SDK")).toBe("python");
        expect(extractLanguageFromGeneratorName("fernenterprise/Fern-Java-SDK")).toBe("java");
    });

    it("returns 'unknown' for unrecognised generator name", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-unknown-sdk")).toBe("unknown");
        expect(extractLanguageFromGeneratorName("some-random-generator")).toBe("unknown");
        expect(extractLanguageFromGeneratorName("")).toBe("unknown");
    });

    it("does not false-positive match 'go' in substrings like 'django' or 'mongo'", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-django-sdk")).toBe("unknown");
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-mongo-connector")).toBe("unknown");
        expect(extractLanguageFromGeneratorName("cargo-generator")).toBe("unknown");
    });

    it("does not false-positive match 'java' in 'javascript'", () => {
        expect(extractLanguageFromGeneratorName("fernenterprise/fern-javascript-sdk")).toBe("unknown");
    });
});
