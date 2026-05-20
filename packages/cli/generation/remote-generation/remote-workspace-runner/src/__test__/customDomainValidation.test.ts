import { CliError, TaskContext } from "@fern-api/task-context";
import { describe, expect, it, vi } from "vitest";

import { getBasepath, stripCustomDomainProtocol, validateBasepathAlignment } from "../customDomainValidation.js";

interface FakeContext {
    context: TaskContext;
    failAndThrow: ReturnType<typeof vi.fn>;
}

function createFakeContext(): FakeContext {
    const failAndThrow = vi.fn((message?: string) => {
        throw new Error(message ?? "failAndThrow");
    });
    // Test helper: TaskContext has a wide surface; this validation only touches `failAndThrow`.
    // The cast is the CLAUDE.md-documented test mock exception.
    const context = {
        failAndThrow
    } as unknown as TaskContext;
    return { context, failAndThrow };
}

describe("stripCustomDomainProtocol", () => {
    it("strips https:// prefix", () => {
        expect(stripCustomDomainProtocol("https://docs.example.com")).toBe("docs.example.com");
    });

    it("strips http:// prefix", () => {
        expect(stripCustomDomainProtocol("http://docs.example.com/path")).toBe("docs.example.com/path");
    });

    it("leaves bare hostnames untouched", () => {
        expect(stripCustomDomainProtocol("docs.example.com")).toBe("docs.example.com");
    });

    it("does not strip protocol-like substrings that are not prefixes", () => {
        expect(stripCustomDomainProtocol("docs.example.com/https://x")).toBe("docs.example.com/https://x");
    });
});

describe("getBasepath", () => {
    it("returns / for a bare hostname", () => {
        expect(getBasepath("docs.example.com")).toBe("/");
    });

    it("returns the basepath for a hostname with a path", () => {
        expect(getBasepath("docs.example.com/docs")).toBe("/docs");
    });

    it("normalizes trailing slashes", () => {
        expect(getBasepath("docs.example.com/docs/")).toBe("/docs");
    });

    it("preserves the root basepath as /", () => {
        expect(getBasepath("docs.example.com/")).toBe("/");
    });

    it("handles inputs that already include a protocol", () => {
        expect(getBasepath("https://docs.example.com/api")).toBe("/api");
    });

    it("falls back to / for unparseable inputs", () => {
        expect(getBasepath("")).toBe("/");
    });
});

describe("validateBasepathAlignment", () => {
    it("passes when the instance url and custom domains share a root basepath", () => {
        const { context, failAndThrow } = createFakeContext();
        validateBasepathAlignment("acme.docs.buildwithfern.com", ["docs.acme.com"], context);
        expect(failAndThrow).not.toHaveBeenCalled();
    });

    it("passes when the instance url and custom domains share a non-root basepath", () => {
        const { context, failAndThrow } = createFakeContext();
        validateBasepathAlignment("acme.docs.buildwithfern.com/docs", ["docs.acme.com/docs", "acme.com/docs"], context);
        expect(failAndThrow).not.toHaveBeenCalled();
    });

    it("fails when the Fern url has a basepath but the custom domain is at the root", () => {
        const { context, failAndThrow } = createFakeContext();
        expect(() =>
            validateBasepathAlignment("acme.docs.buildwithfern.com/docs", ["docs.acme.com"], context)
        ).toThrow();
        expect(failAndThrow).toHaveBeenCalledTimes(1);
        const [message, , options] = failAndThrow.mock.calls[0] ?? [];
        expect(message).toContain("DNS cutover");
        expect(message).toContain("'/docs'");
        expect(message).toContain("'/'");
        expect(options).toEqual({ code: CliError.Code.ConfigError });
    });

    it("fails when the custom domain has a basepath but the Fern url is at the root", () => {
        const { context, failAndThrow } = createFakeContext();
        expect(() =>
            validateBasepathAlignment("acme.docs.buildwithfern.com", ["docs.acme.com/docs"], context)
        ).toThrow();
        expect(failAndThrow).toHaveBeenCalledTimes(1);
    });

    it("fails when the basepaths differ", () => {
        const { context, failAndThrow } = createFakeContext();
        expect(() =>
            validateBasepathAlignment("acme.docs.buildwithfern.com/docs", ["docs.acme.com/api"], context)
        ).toThrow();
        expect(failAndThrow).toHaveBeenCalledTimes(1);
    });

    it("treats trailing-slash differences as equivalent", () => {
        const { context, failAndThrow } = createFakeContext();
        validateBasepathAlignment("acme.docs.buildwithfern.com/docs/", ["docs.acme.com/docs"], context);
        expect(failAndThrow).not.toHaveBeenCalled();
    });
});
