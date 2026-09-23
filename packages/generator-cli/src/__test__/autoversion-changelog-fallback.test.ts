import { describe, expect, it } from "vitest";
import { aggregateChunkAnalyses, resolveChangelogEntryFallback } from "../pipeline/steps/AutoVersionStep";

const TRAILER = "\n\n🌿 Generated with Fern";

describe("aggregateChunkAnalyses", () => {
    it("keeps entries as-is when the winning bump's chunk has an entry", () => {
        const result = aggregateChunkAnalyses([
            { versionBump: "MINOR", message: "feat: add listWidgets", changelogEntry: "### Added\n- listWidgets" },
            {
                versionBump: "MAJOR",
                message: "feat!: remove getWidget",
                changelogEntry: "### Removed\n- getWidget",
                versionBumpReason: "Removed getWidget"
            }
        ]);
        expect(result.bestBump).toBe("MAJOR");
        expect(result.bestMessage).toBe("feat!: remove getWidget");
        expect(result.changelogEntries).toEqual(["### Added\n- listWidgets", "### Removed\n- getWidget"]);
        expect(result.usedBumpReasonAsEntry).toBe(false);
    });

    it("prepends the bump reason when only lower-severity chunks produced entries", () => {
        const result = aggregateChunkAnalyses([
            { versionBump: "MINOR", message: "feat: add listWidgets", changelogEntry: "### Added\n- listWidgets" },
            {
                versionBump: "MAJOR",
                message: "feat!: remove getWidget",
                changelogEntry: "",
                versionBumpReason: "Removed getWidget"
            }
        ]);
        expect(result.bestBump).toBe("MAJOR");
        expect(result.changelogEntries).toEqual(["Removed getWidget", "### Added\n- listWidgets"]);
        expect(result.usedBumpReasonAsEntry).toBe(true);
    });

    it("does not prepend when another chunk at the same level has an entry", () => {
        const result = aggregateChunkAnalyses([
            { versionBump: "MAJOR", message: "feat!: a", changelogEntry: "", versionBumpReason: "a" },
            { versionBump: "MAJOR", message: "feat!: b", changelogEntry: "### Removed\n- b" }
        ]);
        expect(result.changelogEntries).toEqual(["### Removed\n- b"]);
        expect(result.usedBumpReasonAsEntry).toBe(false);
    });

    it("leaves PATCH bumps and missing reasons alone", () => {
        expect(
            aggregateChunkAnalyses([{ versionBump: "PATCH", message: "fix: x", versionBumpReason: "x" }])
                .changelogEntries
        ).toEqual([]);
        expect(
            aggregateChunkAnalyses([{ versionBump: "MINOR", message: "feat: y", changelogEntry: "  " }])
                .changelogEntries
        ).toEqual([]);
    });
});

describe("resolveChangelogEntryFallback", () => {
    it("returns undefined when FAI already provided a changelog entry", () => {
        expect(
            resolveChangelogEntryFallback({
                versionBump: "MAJOR",
                message: "feat!: remove foo",
                changelogEntry: "### Removed\n- foo",
                prDescription: "Removed foo"
            })
        ).toBeUndefined();
    });

    it("returns undefined for PATCH bumps (patch changes intentionally have no entry)", () => {
        expect(
            resolveChangelogEntryFallback({
                versionBump: "PATCH",
                message: "fix: typo",
                changelogEntry: "",
                prDescription: "Fixed a typo"
            })
        ).toBeUndefined();
    });

    it("falls back to the PR description for a MAJOR bump with an empty entry", () => {
        expect(
            resolveChangelogEntryFallback({
                versionBump: "MAJOR",
                message: "feat!: paginate list_items()",
                changelogEntry: "",
                prDescription: "list_items() now returns a SyncPager.\n",
                versionBumpReason: "Return type changed"
            })
        ).toBe("list_items() now returns a SyncPager.");
    });

    it("falls back to the version bump reason when there is no PR description", () => {
        expect(
            resolveChangelogEntryFallback({
                versionBump: "MINOR",
                message: "feat: add bar",
                changelogEntry: "   ",
                versionBumpReason: "New bar() method added"
            })
        ).toBe("New bar() method added");
    });

    it("falls back to the commit message body, stripping the Fern trailer", () => {
        expect(
            resolveChangelogEntryFallback({
                versionBump: "MINOR",
                message: `feat: add bar\n\nAdds a bar() helper.${TRAILER}`
            })
        ).toBe("Adds a bar() helper.");
    });

    it("returns undefined when nothing usable is available", () => {
        expect(
            resolveChangelogEntryFallback({
                versionBump: "MINOR",
                message: `feat: add bar${TRAILER}`
            })
        ).toBeUndefined();
    });
});
