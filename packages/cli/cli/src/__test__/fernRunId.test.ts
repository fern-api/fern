import { getFernRunId, getOrCreateFernRunId, getRunIdProperties } from "@fern-api/cli-telemetry";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("getOrCreateFernRunId", () => {
    beforeEach(() => {
        delete process.env.FERN_RUN_ID;
    });

    afterEach(() => {
        delete process.env.FERN_RUN_ID;
    });

    it("generates a new UUIDv4 and sets it on process.env when FERN_RUN_ID is not set", () => {
        const runId = getOrCreateFernRunId();

        expect(runId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        expect(process.env.FERN_RUN_ID).toBe(runId);
    });

    it("inherits existing FERN_RUN_ID from environment without generating a new one", () => {
        const existing = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
        process.env.FERN_RUN_ID = existing;

        const runId = getOrCreateFernRunId();

        expect(runId).toBe(existing);
    });

    it("returns a different ID on each call when env is not set", () => {
        const first = getOrCreateFernRunId();
        delete process.env.FERN_RUN_ID;
        const second = getOrCreateFernRunId();

        expect(first).not.toBe(second);
    });
});

describe("getFernRunId", () => {
    afterEach(() => {
        delete process.env.FERN_RUN_ID;
    });

    it("returns undefined when FERN_RUN_ID is not set", () => {
        delete process.env.FERN_RUN_ID;
        expect(getFernRunId()).toBeUndefined();
    });

    it("returns the current FERN_RUN_ID when set", () => {
        process.env.FERN_RUN_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
        expect(getFernRunId()).toBe("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee");
    });
});

describe("getRunIdProperties", () => {
    beforeEach(() => {
        delete process.env.FERN_RUN_ID;
        delete process.env.GITHUB_RUN_ID;
    });

    afterEach(() => {
        delete process.env.FERN_RUN_ID;
        delete process.env.GITHUB_RUN_ID;
    });

    it("returns both fern_run_id and github_run_id when both env vars are set", () => {
        process.env.FERN_RUN_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
        process.env.GITHUB_RUN_ID = "12345678";

        expect(getRunIdProperties()).toEqual({
            fern_run_id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
            github_run_id: "12345678"
        });
    });

    it("omits github_run_id when GITHUB_RUN_ID is not set", () => {
        process.env.FERN_RUN_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

        expect(getRunIdProperties()).toEqual({
            fern_run_id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"
        });
    });

    it("omits fern_run_id when FERN_RUN_ID is not set", () => {
        process.env.GITHUB_RUN_ID = "12345678";

        expect(getRunIdProperties()).toEqual({
            github_run_id: "12345678"
        });
    });

    it("returns an empty object when neither env var is set", () => {
        expect(getRunIdProperties()).toEqual({});
    });

    it("omits github_run_id when GITHUB_RUN_ID is empty", () => {
        process.env.FERN_RUN_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
        process.env.GITHUB_RUN_ID = "";

        expect(getRunIdProperties()).toEqual({
            fern_run_id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"
        });
    });
});
