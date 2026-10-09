import { describe, expect, it } from "vitest";
import { changelogContainsVersion, prependChangelogBlock } from "../autoversion/changelogUtils.js";

describe("prependChangelogBlock", () => {
    it("creates a fresh changelog with a title when there is no existing content", () => {
        const result = prependChangelogBlock({
            existingContent: "",
            version: "1.2.0",
            entry: "- Added a new endpoint",
            date: "2026-07-09"
        });
        expect(result).toBe("# Changelog\n\n## [1.2.0] - 2026-07-09\n- Added a new endpoint\n\n");
    });

    it("prepends under an existing # Changelog title, preserving prior entries", () => {
        const existing = "# Changelog\n\n## [1.0.0] - 2024-01-01\n- Initial release\n\n";
        const result = prependChangelogBlock({
            existingContent: existing,
            version: "1.1.0",
            entry: "- Fixed a bug",
            date: "2026-07-09"
        });
        expect(result).toBe(
            "# Changelog\n\n## [1.1.0] - 2026-07-09\n- Fixed a bug\n\n## [1.0.0] - 2024-01-01\n- Initial release\n\n"
        );
    });

    it("prepends before content that has no # Changelog title", () => {
        const existing = "## [1.0.0] - 2024-01-01\n- Initial release\n";
        const result = prependChangelogBlock({
            existingContent: existing,
            version: "1.1.0",
            entry: "- Fixed a bug",
            date: "2026-07-09"
        });
        expect(result.startsWith("## [1.1.0] - 2026-07-09\n- Fixed a bug\n\n")).toBe(true);
        expect(result).toContain("## [1.0.0] - 2024-01-01");
    });

    it("writes a version-only block when the entry is empty", () => {
        const result = prependChangelogBlock({
            existingContent: "",
            version: "0.1.0",
            entry: "",
            date: "2026-07-09"
        });
        expect(result).toBe("# Changelog\n\n## [0.1.0] - 2026-07-09\n\n");
    });

    it("falls back to a date-only header when no version is available", () => {
        const result = prependChangelogBlock({
            existingContent: "",
            version: undefined,
            entry: "- Regenerated SDK",
            date: "2026-07-09"
        });
        expect(result).toBe("# Changelog\n\n## 2026-07-09\n- Regenerated SDK\n\n");
    });
});

describe("changelogContainsVersion", () => {
    it("detects an existing version header", () => {
        const content = "# Changelog\n\n## [1.0.0] - 2024-01-01\n- Initial release\n";
        expect(changelogContainsVersion(content, "1.0.0")).toBe(true);
    });

    it("returns false when the version is not recorded", () => {
        const content = "# Changelog\n\n## [1.0.0] - 2024-01-01\n- Initial release\n";
        expect(changelogContainsVersion(content, "1.1.0")).toBe(false);
    });
});
