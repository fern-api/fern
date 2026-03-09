import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";
import {
    formatLastUpdatedDate,
    hasLastUpdated,
    injectLastUpdatedDates,
    injectLastUpdatedIntoMarkdown
} from "../injectLastUpdated.js";

describe("formatLastUpdatedDate", () => {
    it("formats an ISO date as 'Month Day, Year'", () => {
        expect(formatLastUpdatedDate("2026-03-09T10:30:00Z")).toBe("March 9, 2026");
    });

    it("handles single-digit days without zero-padding", () => {
        expect(formatLastUpdatedDate("2024-01-05T00:00:00Z")).toBe("January 5, 2024");
    });

    it("handles end-of-year dates", () => {
        expect(formatLastUpdatedDate("2023-12-31T23:59:59Z")).toBe("December 31, 2023");
    });
});

describe("hasLastUpdated", () => {
    it("returns false for markdown with no frontmatter", () => {
        expect(hasLastUpdated("# Hello\n\nContent here.")).toBe(false);
    });

    it("returns false for markdown with frontmatter but no last-updated", () => {
        expect(hasLastUpdated("---\ntitle: My Page\n---\n\n# Hello")).toBe(false);
    });

    it("returns true for markdown with last-updated in frontmatter", () => {
        expect(hasLastUpdated("---\ntitle: My Page\nlast-updated: March 9, 2026\n---\n\n# Hello")).toBe(true);
    });

    it("returns true when last-updated is the only frontmatter field", () => {
        expect(hasLastUpdated("---\nlast-updated: January 1, 2024\n---\n\nContent")).toBe(true);
    });
});

describe("injectLastUpdatedIntoMarkdown", () => {
    const DATE = "March 9, 2026";

    it("does not modify markdown that already has last-updated", () => {
        const markdown = "---\ntitle: My Page\nlast-updated: January 1, 2024\n---\n\nContent";
        expect(injectLastUpdatedIntoMarkdown(markdown, DATE)).toBe(markdown);
    });

    it("adds last-updated to existing frontmatter", () => {
        const markdown = "---\ntitle: My Page\n---\n\nContent";
        const result = injectLastUpdatedIntoMarkdown(markdown, DATE);
        expect(result).toBe("---\ntitle: My Page\nlast-updated: March 9, 2026\n---\n\nContent");
    });

    it("creates frontmatter when none exists", () => {
        const markdown = "# Hello\n\nContent here.";
        const result = injectLastUpdatedIntoMarkdown(markdown, DATE);
        expect(result).toBe("---\nlast-updated: March 9, 2026\n---\n# Hello\n\nContent here.");
    });

    it("handles empty frontmatter block", () => {
        const markdown = "---\n---\n\nContent";
        const result = injectLastUpdatedIntoMarkdown(markdown, DATE);
        expect(result).toBe("---\nlast-updated: March 9, 2026\n---\n\nContent");
    });

    it("preserves all other frontmatter fields", () => {
        const markdown = "---\ntitle: Foo\ndescription: Bar\n---\n\n## Section\n\nParagraph.";
        const result = injectLastUpdatedIntoMarkdown(markdown, DATE);
        expect(result).toBe(
            "---\ntitle: Foo\ndescription: Bar\nlast-updated: March 9, 2026\n---\n\n## Section\n\nParagraph."
        );
    });

    it("handles markdown with no trailing newline after frontmatter close", () => {
        const markdown = "---\ntitle: Foo\n---";
        const result = injectLastUpdatedIntoMarkdown(markdown, DATE);
        expect(result).toBe("---\ntitle: Foo\nlast-updated: March 9, 2026\n---");
    });
});

describe("injectLastUpdatedDates", () => {
    it("preserves pages that already have last-updated", async () => {
        const original = "---\nlast-updated: January 1, 2024\n---\n\nContent";
        const pages: Record<RelativeFilePath, string> = {
            [RelativeFilePath.of("page.mdx")]: original
        };

        const result = await injectLastUpdatedDates(pages, AbsoluteFilePath.of("/some/nonexistent/path"));

        // File doesn't exist in git (nonexistent path) → page is preserved unchanged
        expect(result[RelativeFilePath.of("page.mdx")]).toBe(original);
    });

    it("leaves pages unchanged when git returns no history (untracked / non-git path)", async () => {
        const original = "# No Frontmatter\n\nContent.";
        const pages: Record<RelativeFilePath, string> = {
            [RelativeFilePath.of("untracked.md")]: original
        };

        // /tmp/nonexistent is not inside a git repo, so git log returns empty → no injection
        const result = await injectLastUpdatedDates(pages, AbsoluteFilePath.of("/tmp/nonexistent-fern-test"));

        expect(result[RelativeFilePath.of("untracked.md")]).toBe(original);
    });

    it("returns all pages even if some have last-updated and others do not", async () => {
        const pageWithDate = "---\nlast-updated: March 9, 2026\n---\n\nAlready set.";
        const pageWithoutDate = "---\ntitle: No Date\n---\n\nContent.";
        const pages: Record<RelativeFilePath, string> = {
            [RelativeFilePath.of("with-date.mdx")]: pageWithDate,
            [RelativeFilePath.of("without-date.mdx")]: pageWithoutDate
        };

        const result = await injectLastUpdatedDates(pages, AbsoluteFilePath.of("/tmp/nonexistent-fern-test"));

        // Page with existing last-updated is unchanged
        expect(result[RelativeFilePath.of("with-date.mdx")]).toBe(pageWithDate);
        // Page without last-updated stays unchanged since git returns no date for non-git path
        expect(result[RelativeFilePath.of("without-date.mdx")]).toBe(pageWithoutDate);
    });
});
