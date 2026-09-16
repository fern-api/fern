import { describe, expect, it } from "vitest";
import { resolveChangelogEntryFallback } from "../pipeline/steps/AutoVersionStep";

const TRAILER = "\n\n🌿 Generated with Fern";

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
