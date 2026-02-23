import stripAnsi from "strip-ansi";
import { describe, expect, it } from "vitest";

import { buildSlugCollisionViolations } from "../build-violations.js";

// ---------------------------------------------------------------------------
// Helpers – build mock NodeCollector-like objects for testing
// ---------------------------------------------------------------------------

interface MockNode {
    title: string;
    slug: string;
}

/**
 * Create a mock NodeCollector that returns the specified orphaned pages and slug map.
 * This avoids importing FernNavigation (which has deep transitive deps that break in vitest).
 */
function mockCollector({
    slugMap,
    orphanedPages
}: {
    slugMap: Map<string, MockNode>;
    orphanedPages: MockNode[];
}) {
    return {
        slugMap,
        getOrphanedPages: () => orphanedPages
    } as any;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("buildSlugCollisionViolations", () => {
    it("should return no violations when there are no orphaned pages", () => {
        const collector = mockCollector({
            slugMap: new Map([
                ["docs/getting-started", { title: "Getting Started", slug: "docs/getting-started" }],
                ["docs/api-reference", { title: "API Reference", slug: "docs/api-reference" }]
            ]),
            orphanedPages: []
        });

        const violations = buildSlugCollisionViolations(collector);
        expect(violations).toHaveLength(0);
    });

    it("should detect a slug collision between two pages", () => {
        const collector = mockCollector({
            slugMap: new Map([
                ["docs/conversations", { title: "Conversations Overview", slug: "docs/conversations" }]
            ]),
            orphanedPages: [{ title: "Conversations API", slug: "docs/conversations" }]
        });

        const violations = buildSlugCollisionViolations(collector);

        expect(violations).toHaveLength(1);
        const msg = stripAnsi(violations[0]!.message);
        expect(msg).toContain("Conversations API");
        expect(msg).toContain("shadowed by another page with the same slug");
        expect(msg).toContain("/docs/conversations");
    });

    it("should report all violations as warnings", () => {
        const collector = mockCollector({
            slugMap: new Map([["docs/same-slug", { title: "Page A", slug: "docs/same-slug" }]]),
            orphanedPages: [{ title: "Page B", slug: "docs/same-slug" }]
        });

        const violations = buildSlugCollisionViolations(collector);

        for (const v of violations) {
            expect(v.severity).toBe("warning");
        }
    });

    it("should mention the winning page title in the violation message", () => {
        const collector = mockCollector({
            slugMap: new Map([["docs/collision", { title: "Winner Page", slug: "docs/collision" }]]),
            orphanedPages: [{ title: "Loser Page", slug: "docs/collision" }]
        });

        const violations = buildSlugCollisionViolations(collector);

        expect(violations).toHaveLength(1);
        const msg = stripAnsi(violations[0]!.message);
        expect(msg).toContain("Loser Page");
        expect(msg).toContain("(kept:");
        expect(msg).toContain("Winner Page");
    });

    it("should suggest adding a custom slug to fix the collision", () => {
        const collector = mockCollector({
            slugMap: new Map([["docs/dupe", { title: "Page X", slug: "docs/dupe" }]]),
            orphanedPages: [{ title: "Page Y", slug: "docs/dupe" }]
        });

        const violations = buildSlugCollisionViolations(collector);

        expect(violations).toHaveLength(1);
        const msg = stripAnsi(violations[0]!.message);
        expect(msg).toContain("Add a custom slug");
        expect(msg).toContain("docs.yml");
    });

    it("should handle multiple distinct collisions", () => {
        const collector = mockCollector({
            slugMap: new Map([
                ["docs/auth", { title: "Auth Overview", slug: "docs/auth" }],
                ["docs/users", { title: "Users Overview", slug: "docs/users" }]
            ]),
            orphanedPages: [
                { title: "Auth API", slug: "docs/auth" },
                { title: "Users API", slug: "docs/users" }
            ]
        });

        const violations = buildSlugCollisionViolations(collector);

        expect(violations).toHaveLength(2);
        const messages = violations.map((v) => stripAnsi(v.message));
        expect(messages.some((msg) => msg.includes("/docs/auth") && msg.includes("Auth API"))).toBe(true);
        expect(messages.some((msg) => msg.includes("/docs/users") && msg.includes("Users API"))).toBe(true);
    });

    it("should handle empty slug map and no orphaned pages", () => {
        const collector = mockCollector({
            slugMap: new Map(),
            orphanedPages: []
        });

        const violations = buildSlugCollisionViolations(collector);
        expect(violations).toHaveLength(0);
    });

    it("should handle orphaned page whose slug is not in the slug map (no winner)", () => {
        // Edge case: orphaned page has a slug that is no longer in slugMap
        const collector = mockCollector({
            slugMap: new Map(),
            orphanedPages: [{ title: "Orphan", slug: "docs/orphan" }]
        });

        const violations = buildSlugCollisionViolations(collector);

        expect(violations).toHaveLength(1);
        const msg = stripAnsi(violations[0]!.message);
        expect(msg).toContain("Orphan");
        expect(msg).toContain("/docs/orphan");
        // Should NOT contain "(kept: ...)" since there's no winner
        expect(msg).not.toContain("(kept:");
    });

    it("should produce one violation per orphaned page", () => {
        // Three pages collide on the same slug — two are orphaned
        const collector = mockCollector({
            slugMap: new Map([["docs/api", { title: "API v3", slug: "docs/api" }]]),
            orphanedPages: [
                { title: "API v1", slug: "docs/api" },
                { title: "API v2", slug: "docs/api" }
            ]
        });

        const violations = buildSlugCollisionViolations(collector);

        expect(violations).toHaveLength(2);
        const messages = violations.map((v) => stripAnsi(v.message));
        expect(messages.some((msg) => msg.includes("API v1"))).toBe(true);
        expect(messages.some((msg) => msg.includes("API v2"))).toBe(true);
        // Both should reference the winner
        for (const msg of messages) {
            expect(msg).toContain("(kept:");
            expect(msg).toContain("API v3");
        }
    });
});
