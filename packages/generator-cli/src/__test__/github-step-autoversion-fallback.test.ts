import { describe, expect, it } from "vitest";
import { parseCommitMessageForPR } from "../pipeline/github/parseCommitMessage.js";
import {
    appendAutoVersionWarning,
    enrichPrBodyForAutomation,
    resolvePrFields,
    shouldEnableAutomerge
} from "../pipeline/steps/GithubStep.js";
import type { AutoVersionStepResult, GithubStepConfig } from "../pipeline/types.js";

// Regression coverage for FER-10029: GithubStep must read autoVersion results
// from `previousStepResults.autoVersion` as a fallback for PR-body fields that
// consumers like fiddle cannot populate at config-emission time (because those
// fields are pipeline outputs, not inputs).

const baseConfig: GithubStepConfig = {
    enabled: true,
    uri: "owner/repo",
    token: "tkn",
    mode: "pull-request"
};

const autoVersion: AutoVersionStepResult = {
    executed: true,
    success: true,
    version: "2.0.0",
    previousVersion: "1.3.0",
    versionBump: "MAJOR",
    commitMessage: "feat!: drop support for legacy endpoints",
    changelogEntry: "### 2.0.0\n- Removed legacy /v1 endpoints",
    prDescription: "Removed legacy /v1 endpoints.\n\n```diff\n- client.v1.list()\n+ client.v2.list()\n```",
    versionBumpReason: "Removed public methods on the generated client.",
    commitSha: "a".repeat(40)
};

describe("resolvePrFields", () => {
    it("falls back to autoVersion for every PR-body field when config is empty", () => {
        const resolved = resolvePrFields(baseConfig, autoVersion);

        expect(resolved.commitMessage).toBe("feat!: drop support for legacy endpoints");
        expect(resolved.changelogEntry).toBe(autoVersion.changelogEntry);
        expect(resolved.prDescription).toBe(autoVersion.prDescription);
        expect(resolved.versionBumpReason).toBe(autoVersion.versionBumpReason);
        expect(resolved.previousVersion).toBe("1.3.0");
        expect(resolved.newVersion).toBe("2.0.0");
        expect(resolved.versionBump).toBe("MAJOR");
        expect(resolved.hasBreakingChanges).toBe(true);
        expect(resolved.breakingChangesSummary).toBe(autoVersion.prDescription);
    });

    it("explicit config fields win over autoVersion (same policy as skipCommit / replayConflictInfo)", () => {
        const resolved = resolvePrFields(
            {
                ...baseConfig,
                commitMessage: "chore: manual override",
                changelogEntry: "### manual",
                prDescription: "manual description",
                versionBumpReason: "manual reason",
                previousVersion: "9.9.9",
                newVersion: "10.0.0",
                versionBump: "PATCH",
                hasBreakingChanges: false,
                breakingChangesSummary: "manual summary"
            },
            autoVersion
        );

        expect(resolved).toStrictEqual({
            commitMessage: "chore: manual override",
            changelogEntry: "### manual",
            prDescription: "manual description",
            versionBumpReason: "manual reason",
            previousVersion: "9.9.9",
            newVersion: "10.0.0",
            versionBump: "PATCH",
            hasBreakingChanges: false,
            breakingChangesSummary: "manual summary",
            analysisWarning: undefined
        });
    });

    it("defaults commitMessage to 'SDK Generation' when neither config nor autoVersion provides one", () => {
        const resolved = resolvePrFields(baseConfig, undefined);
        expect(resolved.commitMessage).toBe("SDK Generation");
        expect(resolved.hasBreakingChanges).toBe(false);
    });

    it("NO_CHANGE autoVersion does not flip hasBreakingChanges to true", () => {
        const resolved = resolvePrFields(baseConfig, {
            executed: true,
            success: true,
            version: "1.3.0",
            previousVersion: "1.3.0",
            versionBump: "NO_CHANGE"
        });

        expect(resolved.hasBreakingChanges).toBe(false);
        expect(resolved.newVersion).toBe("1.3.0");
        expect(resolved.previousVersion).toBe("1.3.0");
    });
});

describe("PR body composition with autoVersion fallback", () => {
    it("renders a breaking-change version header from autoVersion context alone", () => {
        const resolved = resolvePrFields(baseConfig, autoVersion);
        const { prTitle, prBody } = parseCommitMessageForPR(
            resolved.commitMessage,
            resolved.changelogEntry,
            resolved.prDescription,
            resolved.versionBumpReason,
            resolved.previousVersion,
            resolved.newVersion,
            resolved.versionBump
        );

        expect(prTitle).toBe("feat!: drop support for legacy endpoints");
        expect(prBody).toContain("## \u26A0\uFE0F 1.3.0 \u2192 2.0.0");
        expect(prBody).toContain("**Breaking:** Removed public methods on the generated client.");
        expect(prBody).toContain("Removed legacy /v1 endpoints.");
    });

    it("automationMode breaking-changes section is populated from autoVersion.prDescription", () => {
        const resolved = resolvePrFields({ ...baseConfig, automationMode: true }, autoVersion);
        const enriched = enrichPrBodyForAutomation(
            "body",
            { ...baseConfig, automationMode: true },
            { hasBreakingChanges: resolved.hasBreakingChanges, breakingChangesSummary: resolved.breakingChangesSummary }
        );

        expect(enriched).toContain("## \u26A0\uFE0F Breaking Changes");
        expect(enriched).toContain("Removed legacy /v1 endpoints.");
    });

    it("autoVersion MAJOR bump blocks automerge even when config.hasBreakingChanges is unset", () => {
        const resolved = resolvePrFields({ ...baseConfig, automationMode: true, autoMerge: true }, autoVersion);

        expect(
            shouldEnableAutomerge(
                { ...baseConfig, automationMode: true, autoMerge: true },
                { hasBreakingChanges: resolved.hasBreakingChanges }
            )
        ).toBe(false);
    });

    it("non-MAJOR autoVersion bump allows automerge in automation mode", () => {
        const minorAutoVersion: AutoVersionStepResult = {
            executed: true,
            success: true,
            version: "1.4.0",
            previousVersion: "1.3.0",
            versionBump: "MINOR"
        };
        const resolved = resolvePrFields({ ...baseConfig, automationMode: true, autoMerge: true }, minorAutoVersion);

        expect(
            shouldEnableAutomerge(
                { ...baseConfig, automationMode: true, autoMerge: true },
                { hasBreakingChanges: resolved.hasBreakingChanges }
            )
        ).toBe(true);
    });
});

describe("autoVersion analysisWarning (FAI unavailable, PATCH fallback)", () => {
    const fallbackAutoVersion: AutoVersionStepResult = {
        executed: true,
        success: true,
        version: "8.0.1",
        previousVersion: "8.0.0",
        versionBump: "PATCH",
        commitMessage: "SDK regeneration",
        analysisWarning: "FAI analysis failed (Error: FAI analyze-commit-diff failed with status 502)"
    };

    it("resolvePrFields carries analysisWarning through from the autoVersion result", () => {
        expect(resolvePrFields(baseConfig, fallbackAutoVersion).analysisWarning).toBe(
            fallbackAutoVersion.analysisWarning
        );
        expect(resolvePrFields(baseConfig, undefined).analysisWarning).toBeUndefined();
    });

    it("appendAutoVersionWarning adds a visible notice with the reason", () => {
        const body = appendAutoVersionWarning("## SDK regeneration", fallbackAutoVersion.analysisWarning);
        expect(body).toContain("## SDK regeneration");
        expect(body).toContain("Version bump not verified");
        expect(body).toContain("Automatic version analysis was unavailable or incomplete");
        expect(body).toContain("status 502");
    });

    it("appendAutoVersionWarning neutralizes backticks and newlines in the reason", () => {
        const body = appendAutoVersionWarning("body", "line one\n```injected``` line two");
        expect(body).toContain("Reason: `line one injected line two`");
        expect(body).not.toContain("```");
        expect(body.match(/`/g)?.length).toBe(2);
    });

    it("appendAutoVersionWarning leaves the body untouched without a warning", () => {
        expect(appendAutoVersionWarning("body", undefined)).toBe("body");
        expect(appendAutoVersionWarning("body", "  ")).toBe("body");
    });

    it("analysisWarning blocks automerge even for a non-breaking bump", () => {
        const config = { ...baseConfig, automationMode: true, autoMerge: true };
        const resolved = resolvePrFields(config, fallbackAutoVersion);
        expect(shouldEnableAutomerge(config, resolved)).toBe(false);
        expect(shouldEnableAutomerge(config, { hasBreakingChanges: false })).toBe(true);
    });
});
