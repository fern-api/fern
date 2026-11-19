import { afterEach, describe, expect, it, vi } from "vitest";
import type { Detection, PublishResult, SetupStep, WizardFlags } from "../types";
import { printNextSteps } from "../ui";
import {
    guestModeError,
    guestStep,
    parseClaimUrl,
    parseGuestBuildUrl,
    parseGuestSessionExpiry,
    recordGuestOutcome
} from "../wizard";

const CLAIM_URL = "https://dashboard.buildwithfern.com/claim/gs_4ef36e0dd88a?from=sdk#wBBhvB8acw6rXBTCXmk";
const BUILD_URL = "https://dashboard.buildwithfern.com/sdk/622a81f9-c0c8-403d-a47a-42965375d848#wBBhvB8acw6rXBTCXmk";

const GUEST_OUTPUT = [
    "Started guest session gs_4ef36e0dd88a as organization guest-9d8897414195 (expires 11/18/2026, 5:10:12 AM).",
    `Claim it to keep this work: ${CLAIM_URL}`,
    "After the claim the SDK appears on the organization's SDKs page in the Fern Dashboard.",
    "[api]: Downloaded to /tmp/project/sdks/typescript",
    `Build 622a81f9-c0c8-403d-a47a-42965375d848 is kept for 7 days: ${BUILD_URL} (claiming the session moves it into your organization)`
].join("\n");

const detection: Detection = {
    dir: "/tmp/project",
    fernProject: { exists: false },
    apiSpecs: [{ path: "openapi.yaml", format: "openapi" }],
    frameworks: [],
    docsTools: [],
    agents: [],
    packageManager: "npm",
    hasPackageJson: true,
    pnpmWorkspaceRoot: false,
    fernCliVersion: "5.218.1",
    docsSkillInstalled: false
};

const flags: WizardFlags = { dir: "/tmp/project", yes: false, dryRun: false, skipInstall: true, guest: true };

afterEach(() => {
    delete process.env.FERN_TOKEN;
    vi.restoreAllMocks();
});

describe("what a guest run prints", () => {
    it("reads the claim link, the session expiry and the build page", () => {
        expect(parseClaimUrl(GUEST_OUTPUT)).toBe(CLAIM_URL);
        expect(parseGuestSessionExpiry(GUEST_OUTPUT)).toBe("11/18/2026, 5:10:12 AM");
        expect(parseGuestBuildUrl(GUEST_OUTPUT)).toBe(BUILD_URL);
    });

    it("finds nothing in a signed-in run", () => {
        const output = "Published docs to https://acme.docs.buildwithfern.com (https://acme.docs.buildwithfern.com)";
        expect(parseClaimUrl(output)).toBeUndefined();
        expect(parseGuestSessionExpiry(output)).toBeUndefined();
        expect(parseGuestBuildUrl(output)).toBeUndefined();
    });

    it("keeps an earlier run's claim link when a later run prints none", () => {
        const published: PublishResult = {};
        recordGuestOutcome(GUEST_OUTPUT, published);
        recordGuestOutcome("Published docs to https://drop-abc.docs.buildwithfern.com", published);
        expect(published).toEqual({
            claimUrl: CLAIM_URL,
            claimExpires: "11/18/2026, 5:10:12 AM",
            buildPageUrl: BUILD_URL
        });
    });
});

describe("guest steps", () => {
    const publish: SetupStep = {
        id: "publish",
        title: "Preview and publish your docs",
        question: "Create a preview link for your docs?",
        actions: [
            {
                id: "publish-docs",
                title: "Create a preview link, then choose whether to publish",
                description: "…",
                commands: ["fern generate --docs --preview", "fern generate --docs"],
                files: [],
                selectedByDefault: true
            }
        ]
    };
    const generate: SetupStep = {
        id: "generate",
        title: "Generate your SDKs",
        question: "Generate SDKs now?",
        actions: [
            {
                id: "generate-sdks",
                title: "Pick your SDK languages, then generate your SDKs",
                description: "…",
                commands: ["fern generate"],
                files: ["sdks/"],
                selectedByDefault: true
            }
        ]
    };

    it("publishes a temporary site instead of a preview, with --guest", () => {
        const step = guestStep(publish, detection, flags);
        expect(step.title).toBe("Publish your docs as a guest");
        expect(step.question).toContain("temporary site");
        expect(step.actions[0]?.commands).toEqual(["fern generate --docs --guest"]);
        expect(step.actions[0]?.title).toContain("claim");
    });

    it("generates with --guest and leaves the other steps alone", () => {
        expect(guestStep(generate, detection, flags).actions[0]?.commands).toEqual(["fern generate --guest"]);
        const setup: SetupStep = { id: "cli-setup", title: "Set up Fern", actions: [] };
        expect(guestStep(setup, detection, flags)).toBe(setup);
    });
});

describe("--guest next to a login", () => {
    it("refuses FERN_TOKEN", async () => {
        process.env.FERN_TOKEN = "fern_abc";
        expect(await guestModeError()).toContain("FERN_TOKEN");
    });

    it("is fine without one", async () => {
        process.env.FERN_TOKEN = "";
        // ~/.fern/token may exist on a developer's machine; the message then names the saved login.
        const error = await guestModeError();
        expect(error === undefined || error.includes("fern logout")).toBe(true);
    });
});

describe("next steps for a guest", () => {
    it("shows the temporary site, the build page and the claim link, and keeps --guest on the commands", () => {
        const lines: string[] = [];
        vi.spyOn(console, "log").mockImplementation((line: string) => {
            lines.push(line);
        });
        printNextSteps(["sdks", "docs"], {
            guest: true,
            guestSiteUrl: "https://drop-abc.docs.buildwithfern.com",
            buildPageUrl: BUILD_URL,
            claimUrl: CLAIM_URL,
            claimExpires: "11/18/2026, 5:10:12 AM",
            generated: [{ label: "TypeScript SDK", path: "sdks/typescript" }]
        });
        const text = lines.join("\n");
        expect(text).toContain("https://drop-abc.docs.buildwithfern.com");
        expect(text).toContain(BUILD_URL);
        expect(text).toContain(CLAIM_URL);
        expect(text).toContain("expires 11/18/2026, 5:10:12 AM");
        expect(text).toContain("fern claim --org <organization>");
        expect(text).toContain("Regenerate SDKs: fern generate --guest");
        expect(text).not.toContain("Publish to");
        expect(text).not.toContain("Dashboard:");
    });

    it("tells a guest who published nothing how the claim works", () => {
        const lines: string[] = [];
        vi.spyOn(console, "log").mockImplementation((line: string) => {
            lines.push(line);
        });
        printNextSteps(["docs"], { guest: true });
        const text = lines.join("\n");
        expect(text).toContain("Publish: fern generate --docs --guest");
        expect(text).toContain("claim link");
        expect(text).not.toContain("Dashboard:");
    });
});
