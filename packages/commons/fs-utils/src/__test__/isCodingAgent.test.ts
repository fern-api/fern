import { afterEach, describe, expect, it, vi } from "vitest";

import { isCodingAgent } from "../isCodingAgent.js";

const AGENT_ENV_VARS = [
    "AI_AGENT",
    "CLAUDECODE",
    "CLAUDE_CODE",
    "CURSOR_AGENT",
    "CODEX_SANDBOX",
    "CODEX_THREAD_ID",
    "GEMINI_CLI",
    "OPENCODE",
    "AUGMENT_AGENT",
    "GOOSE_PROVIDER",
    "EDITOR"
];

describe("isCodingAgent", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    function stubCleanEnv(env: Record<string, string>): void {
        for (const name of AGENT_ENV_VARS) {
            vi.stubEnv(name, "");
        }
        for (const [name, value] of Object.entries(env)) {
            vi.stubEnv(name, value);
        }
    }

    it("returns false when no agent variables are set", () => {
        stubCleanEnv({ EDITOR: "vim" });
        expect(isCodingAgent()).toBe(false);
    });

    it.each(AGENT_ENV_VARS.filter((name) => name !== "EDITOR"))("returns true when %s is set", (name) => {
        stubCleanEnv({ [name]: "1" });
        expect(isCodingAgent()).toBe(true);
    });

    it("ignores agent variables set to whitespace", () => {
        stubCleanEnv({ CLAUDECODE: "  " });
        expect(isCodingAgent()).toBe(false);
    });

    it("detects Devin from its EDITOR", () => {
        stubCleanEnv({ EDITOR: "/opt/.devin/package/custom_binaries/devin_editor" });
        expect(isCodingAgent()).toBe(true);
    });
});
