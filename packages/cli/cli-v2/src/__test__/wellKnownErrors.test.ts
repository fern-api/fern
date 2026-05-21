import { CliError } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { FernCliErrors } from "../errors/wellKnown/CliErrors.js";

describe("FernCliErrors", () => {
    describe("AuthRequired", () => {
        it("uses the default message when no override is supplied", () => {
            const err = FernCliErrors.AuthRequired();
            expect(err).toBeInstanceOf(CliError);
            expect(err.code).toBe(CliError.Code.AuthError);
            expect(err.message).toBe("Authentication required.");
            expect(err.hint).toContain("fern auth login");
            expect(err.docsLink).toBe("https://buildwithfern.com/learn/cli/auth");
        });

        it("respects a caller-supplied message but keeps the shared hint and docs link", () => {
            const err = FernCliErrors.AuthRequired({ message: "You are not logged in to Fern." });
            expect(err.message).toBe("You are not logged in to Fern.");
            expect(err.hint).toContain("fern auth login");
            expect(err.docsLink).toBe("https://buildwithfern.com/learn/cli/auth");
        });
    });

    it("Unauthorized maps to AUTH_ERROR with a refresh hint", () => {
        const err = FernCliErrors.Unauthorized();
        expect(err.code).toBe(CliError.Code.AuthError);
        expect(err.message).toMatch(/rejected/i);
        expect(err.hint).toContain("fern auth login");
    });

    it("FernYmlNotFound includes the cwd in the message and points at `fern init`", () => {
        const err = FernCliErrors.FernYmlNotFound({ cwd: "/tmp/proj" });
        expect(err.code).toBe(CliError.Code.ConfigError);
        expect(err.message).toContain("/tmp/proj");
        expect(err.hint).toContain("fern init");
    });

    it("FlagsMutex names both flags symmetrically", () => {
        const err = FernCliErrors.FlagsMutex({ a: "--group", b: "--target" });
        expect(err.code).toBe(CliError.Code.ConfigError);
        expect(err.message).toContain("--group");
        expect(err.message).toContain("--target");
        expect(err.hint).toContain("--group");
        expect(err.hint).toContain("--target");
    });

    it("FlagRequires names both the dependent and required flag", () => {
        const err = FernCliErrors.FlagRequires({ flag: "--container-engine", requires: "--local" });
        expect(err.code).toBe(CliError.Code.ConfigError);
        expect(err.message).toContain("--container-engine");
        expect(err.message).toContain("--local");
        expect(err.hint).toContain("--local");
    });

    it("MissingRequiredFlags renders the flags as an indented bullet list", () => {
        const err = FernCliErrors.MissingRequiredFlags({
            missing: ["--target <language>", "--org <name>"]
        });
        expect(err.code).toBe(CliError.Code.ConfigError);
        expect(err.message).toContain("  --target <language>");
        expect(err.message).toContain("  --org <name>");
        expect(err.hint).toContain("--help");
    });

    it("FileNotFound surfaces the path the user passed", () => {
        const err = FernCliErrors.FileNotFound({ path: "./openapi.yml" });
        expect(err.code).toBe(CliError.Code.ConfigError);
        expect(err.message).toContain("./openapi.yml");
    });

    it("UnsupportedValue lists the supported set in the hint", () => {
        const err = FernCliErrors.UnsupportedValue({
            what: "language",
            value: "cobol",
            supported: ["typescript", "python", "go"]
        });
        expect(err.code).toBe(CliError.Code.ConfigError);
        expect(err.message).toContain("cobol");
        expect(err.hint).toContain("typescript");
        expect(err.hint).toContain("python");
        expect(err.hint).toContain("go");
    });

    it("HttpFetchFailed includes URL, status code, and status text", () => {
        const err = FernCliErrors.HttpFetchFailed({
            url: "https://example.com/spec",
            status: 503,
            statusText: "Service Unavailable"
        });
        expect(err.code).toBe(CliError.Code.NetworkError);
        expect(err.message).toContain("https://example.com/spec");
        expect(err.message).toContain("503");
        expect(err.message).toContain("Service Unavailable");
    });

    it("EmptyStdin points the user at piping", () => {
        const err = FernCliErrors.EmptyStdin();
        expect(err.code).toBe(CliError.Code.ConfigError);
        expect(err.message).toMatch(/stdin/i);
        expect(err.hint).toContain("|");
    });

    it("ValidationFailed has no message (caller has already printed violations) but carries a hint", () => {
        const err = FernCliErrors.ValidationFailed();
        expect(err.code).toBe(CliError.Code.ValidationError);
        expect(err.message).toBe("");
        expect(err.hint).toBeDefined();
    });

    it("InternalError links to the bug-report flow", () => {
        const err = FernCliErrors.InternalError({ details: "task 'foo' not found" });
        expect(err.code).toBe(CliError.Code.InternalError);
        expect(err.message).toContain("task 'foo' not found");
        expect(err.docsLink).toBe("https://github.com/fern-api/fern/issues/new");
    });

    it("every entry returns a CliError with a non-empty hint or docsLink", () => {
        // Smoke test: every template must give the user *something* to act on
        // (or, for ValidationFailed, an empty message but still a hint).
        const samples: CliError[] = [
            FernCliErrors.AuthRequired(),
            FernCliErrors.Unauthorized(),
            FernCliErrors.FernYmlNotFound({ cwd: "/" }),
            FernCliErrors.FlagsMutex({ a: "--a", b: "--b" }),
            FernCliErrors.FlagRequires({ flag: "--a", requires: "--b" }),
            FernCliErrors.MissingRequiredFlags({ missing: ["x"] }),
            FernCliErrors.FileNotFound({ path: "x" }),
            FernCliErrors.UnsupportedValue({ what: "x", value: "y", supported: ["z"] }),
            FernCliErrors.HttpFetchFailed({ url: "x", status: 500, statusText: "" }),
            FernCliErrors.EmptyStdin(),
            FernCliErrors.ValidationFailed(),
            FernCliErrors.InternalError({ details: "x" })
        ];
        for (const err of samples) {
            expect(err).toBeInstanceOf(CliError);
            expect(err.hint != null || err.docsLink != null).toBe(true);
        }
    });
});
