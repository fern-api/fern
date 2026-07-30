import { describe, expect, it } from "vitest";
import { AutoVersioningException } from "../autoversion/AutoVersioningService.js";
import {
    applyPrereleaseIdentifier,
    extractLanguageFromGeneratorName,
    incrementVersion,
    isValidPrereleaseIdentifier,
    VersionBump
} from "../autoversion/VersionUtils.js";

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

describe("incrementVersion", () => {
    it("applies the bump to the release core when no prerelease is requested", () => {
        expect(incrementVersion("1.5.5", VersionBump.PATCH)).toBe("1.5.6");
        expect(incrementVersion("1.5.5", VersionBump.MINOR)).toBe("1.6.0");
        expect(incrementVersion("1.5.5", VersionBump.MAJOR)).toBe("2.0.0");
    });

    it("advances the prerelease counter without a requested identifier", () => {
        expect(incrementVersion("4.0.0-rc.1", VersionBump.MAJOR)).toBe("4.0.0-rc.2");
        expect(incrementVersion("1.2.3-beta", VersionBump.PATCH)).toBe("1.2.3-beta.0");
    });

    it("returns the version unchanged on NO_CHANGE", () => {
        expect(incrementVersion("1.5.5", VersionBump.NO_CHANGE)).toBe("1.5.5");
        expect(incrementVersion("1.5.5", VersionBump.NO_CHANGE, { prerelease: "rc" })).toBe("1.5.5");
    });
});

describe("incrementVersion with a prerelease identifier", () => {
    it("bumps the release core and starts the counter at zero from a stable version", () => {
        expect(incrementVersion("1.5.5", VersionBump.PATCH, { prerelease: "rc" })).toBe("1.5.6-rc.0");
        expect(incrementVersion("1.5.5", VersionBump.MINOR, { prerelease: "rc" })).toBe("1.6.0-rc.0");
        expect(incrementVersion("1.5.5", VersionBump.MAJOR, { prerelease: "rc" })).toBe("2.0.0-rc.0");
    });

    it("advances the counter while the pending core already covers the bump", () => {
        expect(incrementVersion("1.5.6-rc.0", VersionBump.PATCH, { prerelease: "rc" })).toBe("1.5.6-rc.1");
        expect(incrementVersion("1.6.0-rc.1", VersionBump.MINOR, { prerelease: "rc" })).toBe("1.6.0-rc.2");
        expect(incrementVersion("1.6.0-rc.1", VersionBump.PATCH, { prerelease: "rc" })).toBe("1.6.0-rc.2");
        expect(incrementVersion("2.0.0-rc.3", VersionBump.MAJOR, { prerelease: "rc" })).toBe("2.0.0-rc.4");
    });

    it("re-anchors the core and resets the counter when the bump outranks the pending core", () => {
        expect(incrementVersion("1.5.6-rc.1", VersionBump.MINOR, { prerelease: "rc" })).toBe("1.6.0-rc.0");
        expect(incrementVersion("1.5.6-rc.1", VersionBump.MAJOR, { prerelease: "rc" })).toBe("2.0.0-rc.0");
        expect(incrementVersion("1.6.0-rc.2", VersionBump.MAJOR, { prerelease: "rc" })).toBe("2.0.0-rc.0");
    });

    it("switches identifiers while keeping the pending core", () => {
        expect(incrementVersion("1.6.0-beta.3", VersionBump.PATCH, { prerelease: "rc" })).toBe("1.6.0-rc.0");
        expect(incrementVersion("1.6.0-0", VersionBump.PATCH, { prerelease: "rc" })).toBe("1.6.0-rc.0");
    });

    it("preserves a 'v' prefix", () => {
        expect(incrementVersion("v1.5.5", VersionBump.MINOR, { prerelease: "rc" })).toBe("v1.6.0-rc.0");
        expect(incrementVersion("v1.6.0-rc.0", VersionBump.PATCH, { prerelease: "rc" })).toBe("v1.6.0-rc.1");
    });

    it("drops build metadata when advancing the counter", () => {
        expect(incrementVersion("1.6.0-rc.2+build.5", VersionBump.PATCH, { prerelease: "rc" })).toBe("1.6.0-rc.3");
    });

    it("rejects an invalid identifier", () => {
        expect(() => incrementVersion("1.5.5", VersionBump.PATCH, { prerelease: "0rc" })).toThrow(
            AutoVersioningException
        );
        expect(() => incrementVersion("1.5.5", VersionBump.PATCH, { prerelease: "rc.1" })).toThrow(
            AutoVersioningException
        );
        expect(() => incrementVersion("1.5.5", VersionBump.PATCH, { prerelease: "" })).toThrow(AutoVersioningException);
    });

    it("rejects an invalid version", () => {
        expect(() => incrementVersion("not-a-version", VersionBump.PATCH, { prerelease: "rc" })).toThrow(
            AutoVersioningException
        );
    });
});

describe("applyPrereleaseIdentifier", () => {
    it("attaches the identifier with a zero counter to a stable version", () => {
        expect(applyPrereleaseIdentifier("0.0.1", "rc")).toBe("0.0.1-rc.0");
        expect(applyPrereleaseIdentifier("v0.0.1", "rc")).toBe("v0.0.1-rc.0");
    });

    it("leaves versions already on a prerelease line untouched", () => {
        expect(applyPrereleaseIdentifier("0.0.1-beta.2", "rc")).toBe("0.0.1-beta.2");
    });

    it("rejects invalid input", () => {
        expect(() => applyPrereleaseIdentifier("0.0.1", "1rc")).toThrow(AutoVersioningException);
        expect(() => applyPrereleaseIdentifier("nope", "rc")).toThrow(AutoVersioningException);
    });
});

describe("isValidPrereleaseIdentifier", () => {
    it("accepts alphanumeric identifiers starting with a letter", () => {
        expect(isValidPrereleaseIdentifier("rc")).toBe(true);
        expect(isValidPrereleaseIdentifier("beta")).toBe(true);
        expect(isValidPrereleaseIdentifier("next-1")).toBe(true);
    });

    it("rejects empty, numeric-leading and dotted identifiers", () => {
        expect(isValidPrereleaseIdentifier("")).toBe(false);
        expect(isValidPrereleaseIdentifier("0rc")).toBe(false);
        expect(isValidPrereleaseIdentifier("rc.0")).toBe(false);
        expect(isValidPrereleaseIdentifier("rc 0")).toBe(false);
    });
});
