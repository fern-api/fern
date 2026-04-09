import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockSetTag } = vi.hoisted(() => ({
    mockSetTag: vi.fn()
}));

vi.mock("@sentry/node", () => ({
    setTag: mockSetTag
}));

import { setSentryFernRunIdTag, setSentryGithubRunIdTag, setSentryRunIdTags } from "@fern-api/cli-telemetry";

describe("setSentryFernRunIdTag", () => {
    afterEach(() => {
        delete process.env.FERN_RUN_ID;
        mockSetTag.mockClear();
    });

    it("sets fern_run_id tag when FERN_RUN_ID is present", () => {
        process.env.FERN_RUN_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

        setSentryFernRunIdTag();

        expect(mockSetTag).toHaveBeenCalledWith("fern_run_id", "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee");
    });

    it("does not set fern_run_id tag when FERN_RUN_ID is absent", () => {
        delete process.env.FERN_RUN_ID;

        setSentryFernRunIdTag();

        expect(mockSetTag).not.toHaveBeenCalled();
    });
});

describe("setSentryGithubRunIdTag", () => {
    afterEach(() => {
        delete process.env.GITHUB_RUN_ID;
        mockSetTag.mockClear();
    });

    it("sets github_run_id tag when GITHUB_RUN_ID is present", () => {
        process.env.GITHUB_RUN_ID = "12345678";

        setSentryGithubRunIdTag();

        expect(mockSetTag).toHaveBeenCalledWith("github_run_id", "12345678");
    });

    it("does not set github_run_id tag when GITHUB_RUN_ID is absent", () => {
        delete process.env.GITHUB_RUN_ID;

        setSentryGithubRunIdTag();

        expect(mockSetTag).not.toHaveBeenCalled();
    });
});

describe("setSentryRunIdTags", () => {
    beforeEach(() => {
        mockSetTag.mockClear();
    });

    afterEach(() => {
        delete process.env.FERN_RUN_ID;
        delete process.env.GITHUB_RUN_ID;
    });

    it("sets both tags when both env vars are present", () => {
        process.env.FERN_RUN_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
        process.env.GITHUB_RUN_ID = "12345678";

        setSentryRunIdTags();

        expect(mockSetTag).toHaveBeenCalledWith("fern_run_id", "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee");
        expect(mockSetTag).toHaveBeenCalledWith("github_run_id", "12345678");
        expect(mockSetTag).toHaveBeenCalledTimes(2);
    });

    it("sets no tags when both env vars are absent", () => {
        setSentryRunIdTags();

        expect(mockSetTag).not.toHaveBeenCalled();
    });
});
