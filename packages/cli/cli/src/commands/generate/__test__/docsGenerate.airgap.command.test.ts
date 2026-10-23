import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTestCliContext, createTestProject, FAKE_FDR_ORIGIN, type TestProject } from "./commandHarness.js";
import { DocsFdr, FAKE_TIMEOUTS, ONE_PAGE, settleWithFakeTimers } from "./docsGenerateHarness.js";

// `fern generate --docs`: the check for a machine with no network, which the command makes once and remembers for as
// long as the process runs. Each test starts a fresh copy of the command, so none of them inherits the answer.

describe("fern generate --docs: the air-gap check", { timeout: 120_000 }, () => {
    let fdr: DocsFdr;
    let testProject: TestProject | undefined;

    beforeEach(() => {
        vi.stubEnv("FERN_FDR_ORIGIN", FAKE_FDR_ORIGIN);
        vi.stubEnv("FERN_TOKEN", "token");
        vi.stubEnv("FERN_DOCS_DEPLOY_MODE", undefined as never);
        fdr = new DocsFdr();
        fdr.install();
    });

    afterEach(async () => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        await testProject?.cleanup();
        testProject = undefined;
    });

    /** Runs the command in a copy of the code that has not made the check yet. */
    async function runFresh() {
        vi.resetModules();
        const { generateDocsWorkspace } = await import("../generateDocsWorkspace.js");
        testProject = await createTestProject(ONE_PAGE);
        const cli = createTestCliContext();
        const promise = generateDocsWorkspace({
            project: testProject.project,
            cliContext: cli.cliContext,
            instance: undefined,
            preview: false,
            previewId: undefined,
            force: true,
            brokenLinks: false,
            strictBrokenLinks: false,
            disableTemplates: undefined,
            noPrompt: true,
            skipUpload: false
        }).then(
            () => undefined,
            (error: unknown) => error
        );
        return { cli, promise };
    }

    const healthChecks = (): number => fdr.to("GET /health").length;

    it("asks FDR's /health once, and carries on when it answers", async () => {
        const { cli, promise } = await runFresh();

        expect(await promise).toBeUndefined();

        expect(healthChecks()).toBe(1);
        expect(cli.logged("Detecting air-gapped mode by checking connectivity to http://fdr.test/health")).toBe(true);
        expect(cli.logged("Network check succeeded - not in air-gapped mode")).toBe(true);
        expect(cli.logged("air-gapped environment")).toBe(false);
    });

    it("does not mind what FDR answers, as long as it answers", async () => {
        fdr.reply("GET /health", { status: 503, body: {} });
        const { cli, promise } = await runFresh();

        expect(await promise).toBeUndefined();

        expect(healthChecks()).toBe(1);
        expect(cli.logged("Network check succeeded")).toBe(true);
    });

    it("makes the check only once for the whole process", async () => {
        const first = await runFresh();
        await first.promise;
        const { generateDocsWorkspace } = await import("../generateDocsWorkspace.js");
        const second = createTestCliContext();

        await generateDocsWorkspace({
            project: (testProject as TestProject).project,
            cliContext: second.cliContext,
            instance: undefined,
            preview: false,
            previewId: undefined,
            force: true,
            brokenLinks: false,
            strictBrokenLinks: false,
            disableTemplates: undefined,
            noPrompt: true,
            skipUpload: false
        });

        expect(healthChecks()).toBe(1);
    });

    it("makes the check for a preview too", async () => {
        vi.resetModules();
        const { generateDocsWorkspace } = await import("../generateDocsWorkspace.js");
        testProject = await createTestProject(ONE_PAGE);
        const cli = createTestCliContext();

        await generateDocsWorkspace({
            project: testProject.project,
            cliContext: cli.cliContext,
            instance: undefined,
            preview: true,
            previewId: undefined,
            force: true,
            brokenLinks: false,
            strictBrokenLinks: false,
            disableTemplates: undefined,
            noPrompt: true,
            skipUpload: false
        });

        expect(healthChecks()).toBe(1);
    });

    describe("when FDR cannot be reached", () => {
        it("tries three times, waiting half a second and then a second, then says it is air-gapped", async () => {
            vi.useFakeTimers({ toFake: FAKE_TIMEOUTS });
            fdr.reply("GET /health", "network-failure");
            const { cli, promise } = await runFresh();

            expect(await settleWithFakeTimers(promise, 500)).toBeUndefined();

            expect(healthChecks()).toBe(3);
            expect(cli.logs.filter((line) => line.includes("Network check attempt"))).toEqual([
                "debug: Network check attempt 1/3 failed: fetch failed — retrying in 500ms",
                "debug: Network check attempt 2/3 failed: fetch failed — retrying in 1000ms"
            ]);
            expect(cli.logged("Network check failed after 3 attempts - entering air-gapped mode: fetch failed")).toBe(
                true
            );
            expect(cli.logged("Detected air-gapped environment - skipping external FDR service calls")).toBe(true);
        });

        // NOTE: the only thing the docs publish does with the result is to log it. It still sends every request.
        it("still publishes, and calls FDR for everything else, as if it had a network", async () => {
            vi.useFakeTimers({ toFake: FAKE_TIMEOUTS });
            fdr.replyTimes("GET /health", 3, "network-failure");
            const { promise } = await runFresh();

            expect(await settleWithFakeTimers(promise, 500)).toBeUndefined();

            expect(fdr.to("POST /slugs/markdowns")).toHaveLength(1);
            expect(fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
        });

        it("says it is online when the second try works", async () => {
            vi.useFakeTimers({ toFake: FAKE_TIMEOUTS });
            fdr.replyTimes("GET /health", 1, "network-failure");
            const { cli, promise } = await runFresh();

            expect(await settleWithFakeTimers(promise, 500)).toBeUndefined();

            expect(healthChecks()).toBe(2);
            expect(cli.logged("Network check succeeded - not in air-gapped mode")).toBe(true);
            expect(cli.logged("air-gapped environment")).toBe(false);
        });

        it("does not try again for a failure that is not a network failure", async () => {
            let attempts = 0;
            fdr.reply("GET /health", () => {
                attempts += 1;
                throw new Error("certificate has expired");
            });
            const { cli, promise } = await runFresh();

            await promise;

            expect(attempts).toBe(1);
            expect(cli.logged("Network check attempt")).toBe(false);
            expect(cli.logged("air-gapped environment")).toBe(false);
        });
    });
});
