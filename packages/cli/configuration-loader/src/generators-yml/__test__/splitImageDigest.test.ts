import type { TaskContext } from "@fern-api/task-context";
import { describe, expect, it, vi } from "vitest";

import { splitImageDigest } from "../convertGeneratorsConfiguration.js";

const VALID_DIGEST = `sha256:${"a".repeat(64)}`;

function taskContext(): TaskContext {
    return {
        failAndThrow: vi.fn((message?: string) => {
            throw new Error(message);
        }),
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn() }
        // biome-ignore lint/suspicious/noExplicitAny: only the members under test are stubbed
    } as any;
}

describe("splitImageDigest", () => {
    it("returns the name untouched when no digest is present", () => {
        expect(splitImageDigest("fern-python-sdk", taskContext())).toEqual({
            name: "fern-python-sdk",
            digest: undefined
        });
    });

    it("separates a digest from the image name", () => {
        expect(splitImageDigest(`fern-python-sdk@${VALID_DIGEST}`, taskContext())).toEqual({
            name: "fern-python-sdk",
            digest: VALID_DIGEST
        });
    });

    // The name is what IR version resolution is keyed on, so it must survive the split unchanged
    // even when the image is pinned.
    it("leaves an org-qualified name intact", () => {
        expect(splitImageDigest(`fernapi/fern-python-sdk@${VALID_DIGEST}`, taskContext()).name).toBe(
            "fernapi/fern-python-sdk"
        );
    });

    it.each([
        ["a truncated digest", "sha256:abc123"],
        ["uppercase hex", `sha256:${"A".repeat(64)}`],
        ["a missing algorithm prefix", "a".repeat(64)],
        ["an unsupported algorithm", `sha512:${"a".repeat(64)}`],
        ["an empty digest", ""]
    ])("rejects %s with an error naming generators.yml", (_label, digest) => {
        expect(() => splitImageDigest(`fern-python-sdk@${digest}`, taskContext())).toThrowError(/generators\.yml/);
    });
});
