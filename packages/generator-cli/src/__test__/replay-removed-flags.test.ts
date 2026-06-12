import { describe, expect, it } from "vitest";
import {
    getRemovedReplayFlagError,
    IMPORT_HISTORY_REMOVED_MESSAGE,
    MIGRATE_FERNIGNORE_REMOVED_MESSAGE
} from "../replay/removed-flags";

describe("getRemovedReplayFlagError", () => {
    it("rejects --import-history with migration guidance", () => {
        const error = getRemovedReplayFlagError({ importHistory: true });
        expect(error).toBe(IMPORT_HISTORY_REMOVED_MESSAGE);
        expect(error).toContain("--import-history has been removed");
        expect(error).toContain("duplicate content");
        // The three-step clean-start migration sequence.
        expect(error).toContain("as-generated");
        expect(error).toContain("bootstrap with no flags");
        expect(error).toContain("single commit");
    });

    it("rejects --fernignore-action migrate with the hands-off guidance", () => {
        const error = getRemovedReplayFlagError({ fernignoreAction: "migrate" });
        expect(error).toBe(MIGRATE_FERNIGNORE_REMOVED_MESSAGE);
        expect(error).toContain("has been removed");
        expect(error).toContain("hands-off");
    });

    it("rejects --import-history even when combined with other options", () => {
        const error = getRemovedReplayFlagError({ importHistory: true, fernignoreAction: "skip" });
        expect(error).toBe(IMPORT_HISTORY_REMOVED_MESSAGE);
    });

    it("accepts explicit --no-import-history (yargs boolean negation parses to false)", () => {
        expect(getRemovedReplayFlagError({ importHistory: false })).toBeUndefined();
    });

    it("accepts the surviving fernignore actions and absent flags", () => {
        expect(getRemovedReplayFlagError({})).toBeUndefined();
        expect(getRemovedReplayFlagError({ fernignoreAction: "skip" })).toBeUndefined();
        // "delete" has always been a no-op engine-side; it stays accepted unchanged.
        expect(getRemovedReplayFlagError({ fernignoreAction: "delete" })).toBeUndefined();
    });
});
