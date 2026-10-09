import { describe, expect, it } from "vitest";

import { validateSkillsPageAction } from "../valid-skills-page-action.js";

describe("validateSkillsPageAction", () => {
    it("returns no violations when the skills config is absent", () => {
        expect(validateSkillsPageAction(undefined)).toEqual([]);
    });

    it("returns no violations for an empty config (enables the action with all defaults)", () => {
        expect(validateSkillsPageAction({})).toEqual([]);
    });

    it("returns no violations for a full valid config", () => {
        expect(
            validateSkillsPageAction({
                title: "Install agent skills",
                description: "Skills for authoring Fern docs.",
                learnMoreUrl: "https://buildwithfern.com/learn/docs/ai/agent-skills",
                repository: "https://github.com/fern-api/skills",
                installCommand: "npx skills add fern-api/skills --skill fern-docs",
                skills: [
                    {
                        name: "fern-docs",
                        description: "Author and edit Fern documentation",
                        url: "https://github.com/fern-api/skills/tree/main/skills/fern-docs"
                    }
                ]
            })
        ).toEqual([]);
    });

    it("accepts a multi-line install command list", () => {
        expect(
            validateSkillsPageAction({
                installCommand: ["git clone https://github.com/fern-api/skills", "cp -r skills ~/.claude/skills"]
            })
        ).toEqual([]);
    });

    it("rejects an empty install command", () => {
        const violations = validateSkillsPageAction({ installCommand: "   " });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("error");
        expect(violations[0]?.message).toContain("install-command[0] must not be empty");
    });

    it("rejects an empty install command list", () => {
        const violations = validateSkillsPageAction({ installCommand: [] });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("must not be an empty list");
    });

    it("rejects an empty entry within an install command list", () => {
        const violations = validateSkillsPageAction({ installCommand: ["npx skills add fern-api/skills", ""] });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("install-command[1] must not be empty");
    });

    it("rejects a skill with an empty name", () => {
        const violations = validateSkillsPageAction({ skills: [{ name: "" }] });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("error");
        expect(violations[0]?.message).toContain("skills[0].name must not be empty");
    });

    it("warns on invalid URLs", () => {
        const violations = validateSkillsPageAction({
            learnMoreUrl: "not a url",
            repository: "also not a url",
            skills: [{ name: "fern-docs", url: "/relative/path" }]
        });
        expect(violations).toHaveLength(3);
        expect(violations.every((violation) => violation.severity === "warning")).toBe(true);
        expect(violations.map((violation) => violation.message).join("\n")).toContain("learn-more-url");
    });
});
