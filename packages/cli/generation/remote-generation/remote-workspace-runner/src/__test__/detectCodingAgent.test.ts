import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectCodingAgent } from "../detectCodingAgent.js";

const AGENT_ENV_VARS = [
    "CLAUDECODE",
    "CLAUDE_CODE_ENTRYPOINT",
    "CURSOR_AGENT",
    "CURSOR_TRACE_ID",
    "CODEX_SANDBOX",
    "CODEX_THREAD_ID",
    "DEVIN_SESSION_ID",
    "GEMINI_CLI"
];

describe("detectCodingAgent", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
        for (const name of AGENT_ENV_VARS) {
            delete process.env[name];
        }
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("returns undefined when no agent env vars are set", () => {
        expect(detectCodingAgent()).toBeUndefined();
    });

    it("detects Claude Code via CLAUDECODE=1", () => {
        process.env.CLAUDECODE = "1";
        expect(detectCodingAgent()).toBe("claude-code");
    });

    it("detects Claude Code via CLAUDE_CODE_ENTRYPOINT", () => {
        process.env.CLAUDE_CODE_ENTRYPOINT = "cli";
        expect(detectCodingAgent()).toBe("claude-code");
    });

    it("detects Cursor", () => {
        process.env.CURSOR_AGENT = "1";
        expect(detectCodingAgent()).toBe("cursor");
    });

    it("detects Codex", () => {
        process.env.CODEX_SANDBOX = "seatbelt";
        expect(detectCodingAgent()).toBe("codex");
    });

    it("detects Devin", () => {
        process.env.DEVIN_SESSION_ID = "abc";
        expect(detectCodingAgent()).toBe("devin");
    });

    it("detects Gemini CLI", () => {
        process.env.GEMINI_CLI = "1";
        expect(detectCodingAgent()).toBe("gemini-cli");
    });
});
