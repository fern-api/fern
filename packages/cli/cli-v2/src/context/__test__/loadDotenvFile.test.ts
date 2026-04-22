import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadDotenvFile } from "../loadDotenvFile.js";

// Capture stderr writes
const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);

describe("loadDotenvFile", () => {
    let tmpDir: string;
    let originalEnv: NodeJS.ProcessEnv;
    let originalCwd: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "fern-env-test-"));
        originalEnv = { ...process.env };
        originalCwd = process.cwd();
        process.chdir(tmpDir);
        stderrSpy.mockClear();
    });

    afterEach(() => {
        process.chdir(originalCwd);
        // Restore env (remove any vars loaded from .env files during tests)
        for (const key of Object.keys(process.env)) {
            if (!(key in originalEnv)) {
                delete process.env[key];
            }
        }
        Object.assign(process.env, originalEnv);
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    describe("no --env flag", () => {
        it("does nothing when envFilePath is undefined", () => {
            fs.writeFileSync(path.join(tmpDir, ".env"), "MY_SECRET=hello\n");

            loadDotenvFile(undefined);

            // Auto-discovery is intentionally disabled — .env in cwd must NOT be loaded
            expect(process.env.MY_SECRET).toBeUndefined();
            expect(stderrSpy).not.toHaveBeenCalled();
        });
    });

    describe("explicit --env flag", () => {
        it("loads the specified file", () => {
            const envFile = path.join(tmpDir, "custom.env");
            fs.writeFileSync(envFile, "CUSTOM_VAR=world\n");

            loadDotenvFile(envFile);

            expect(process.env.CUSTOM_VAR).toBe("world");
        });

        it("resolves relative paths against cwd", () => {
            fs.writeFileSync(path.join(tmpDir, ".env.local"), "LOCAL_VAR=local\n");

            loadDotenvFile(".env.local");

            expect(process.env.LOCAL_VAR).toBe("local");
        });

        it("warns to stderr when the specified file does not exist", () => {
            loadDotenvFile("/nonexistent/path/.env");

            expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining(".env file not found"));
            expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("/nonexistent/path/.env"));
        });

        it("does not overwrite an existing env var", () => {
            process.env.EXISTING_VAR = "original";
            const envFile = path.join(tmpDir, "custom.env");
            fs.writeFileSync(envFile, "EXISTING_VAR=overwritten\n");

            loadDotenvFile(envFile);

            expect(process.env.EXISTING_VAR).toBe("original");
        });
    });

    describe("debug logging", () => {
        it("calls logDebug with key names and <SET> placeholders, never the actual values", () => {
            const envFile = path.join(tmpDir, "custom.env");
            fs.writeFileSync(envFile, "SECRET_KEY=super-secret\nANOTHER=also-secret\n");
            const logDebug = vi.fn();

            loadDotenvFile(envFile, logDebug);

            const calls = logDebug.mock.calls.map((args) => args[0] as string);
            expect(calls).toContain("Loaded from --env: SECRET_KEY=****");
            expect(calls).toContain("Loaded from --env: ANOTHER=****");
            // Values must never appear
            expect(calls.join("")).not.toContain("super-secret");
            expect(calls.join("")).not.toContain("also-secret");
        });

        it("does not call logDebug when no logDebug is provided", () => {
            const envFile = path.join(tmpDir, "custom.env");
            fs.writeFileSync(envFile, "SECRET_KEY=super-secret\n");

            // Should not throw even without logDebug
            expect(() => loadDotenvFile(envFile, undefined)).not.toThrow();
        });
    });
});
