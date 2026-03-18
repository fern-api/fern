import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLatestRelease } from "../getLatestRelease.js";

const mockGetLatestRelease = vi.fn();
const mockPaginate = vi.fn();

vi.mock("octokit", () => {
    return {
        Octokit: class MockOctokit {
            rest = {
                repos: {
                    getLatestRelease: mockGetLatestRelease,
                    listReleases: "listReleases-sentinel"
                }
            };
            paginate = mockPaginate;
        }
    };
});

/**
 * Helper to set up mockPaginate so it simulates a single-page response.
 * octokit.paginate(endpoint, params, mapFn) calls mapFn(response, done)
 * for each page and concatenates the results into a flat array.
 */
function setupPaginateResponse(releases: Array<{ tag_name: string; draft: boolean; prerelease: boolean }>): void {
    mockPaginate.mockImplementationOnce(
        (
            _endpoint: unknown,
            _params: unknown,
            mapFn: (response: { data: typeof releases }, done: () => void) => string[]
        ) => {
            const done = (): void => {
                // no-op: stops pagination in real octokit
            };
            const result = mapFn({ data: releases }, done);
            return Promise.resolve(result);
        }
    );
}

describe("getLatestRelease", () => {
    beforeEach(() => {
        mockGetLatestRelease.mockReset();
        mockPaginate.mockReset();
    });

    it("returns the tag_name from the latest release", async () => {
        mockGetLatestRelease.mockResolvedValueOnce({
            data: { tag_name: "v2.0.0" }
        });

        const result = await getLatestRelease("owner/repo");
        expect(result).toEqual("v2.0.0");
        expect(mockPaginate).not.toHaveBeenCalled();
    });

    it("returns undefined when no releases exist (404)", async () => {
        mockGetLatestRelease.mockRejectedValueOnce(new Error("Not Found"));

        const result = await getLatestRelease("owner/repo");
        expect(result).toBeUndefined();
    });

    it("returns tag_name without v prefix if release uses bare version", async () => {
        mockGetLatestRelease.mockResolvedValueOnce({
            data: { tag_name: "3.1.0" }
        });

        const result = await getLatestRelease("owner/repo");
        expect(result).toEqual("3.1.0");
        expect(mockPaginate).not.toHaveBeenCalled();
    });

    it("passes auth token to Octokit when provided", async () => {
        mockGetLatestRelease.mockResolvedValueOnce({
            data: { tag_name: "v1.0.0" }
        });

        const result = await getLatestRelease("owner/repo", { authToken: "ghp_test123" });
        expect(result).toEqual("v1.0.0");
        expect(mockGetLatestRelease).toHaveBeenCalledWith({ owner: "owner", repo: "repo" });
    });

    it("returns undefined on network error", async () => {
        mockGetLatestRelease.mockRejectedValueOnce(new Error("Network error"));

        const result = await getLatestRelease("owner/repo");
        expect(result).toBeUndefined();
    });

    it("falls back to listReleases when latest release is a semver prerelease", async () => {
        mockGetLatestRelease.mockResolvedValueOnce({
            data: { tag_name: "0.0.0-dev-babaf54d" }
        });
        setupPaginateResponse([
            { tag_name: "0.0.0-dev-babaf54d", draft: false, prerelease: false },
            { tag_name: "0.0.0-dev-abc12345", draft: false, prerelease: false },
            { tag_name: "v0.0.33450", draft: false, prerelease: false }
        ]);

        const result = await getLatestRelease("owner/repo");
        expect(result).toEqual("v0.0.33450");
        expect(mockPaginate).toHaveBeenCalled();
    });

    it("skips GitHub drafts and prereleases when falling back", async () => {
        mockGetLatestRelease.mockResolvedValueOnce({
            data: { tag_name: "v1.0.0-rc.1" }
        });
        setupPaginateResponse([
            { tag_name: "v1.0.0-rc.1", draft: false, prerelease: false },
            { tag_name: "v0.9.9", draft: true, prerelease: false },
            { tag_name: "v0.9.8", draft: false, prerelease: true },
            { tag_name: "v0.9.7", draft: false, prerelease: false }
        ]);

        const result = await getLatestRelease("owner/repo");
        expect(result).toEqual("v0.9.7");
    });

    it("returns undefined when all releases are semver prereleases", async () => {
        mockGetLatestRelease.mockResolvedValueOnce({
            data: { tag_name: "0.0.0-dev-aaa" }
        });
        setupPaginateResponse([
            { tag_name: "0.0.0-dev-aaa", draft: false, prerelease: false },
            { tag_name: "0.0.0-dev-bbb", draft: false, prerelease: false },
            { tag_name: "0.0.0-dev-ccc", draft: false, prerelease: false }
        ]);

        const result = await getLatestRelease("owner/repo");
        expect(result).toBeUndefined();
    });

    it("handles v-prefixed semver prerelease tags", async () => {
        mockGetLatestRelease.mockResolvedValueOnce({
            data: { tag_name: "v2.0.0-beta.1" }
        });
        setupPaginateResponse([
            { tag_name: "v2.0.0-beta.1", draft: false, prerelease: false },
            { tag_name: "v1.5.0", draft: false, prerelease: false }
        ]);

        const result = await getLatestRelease("owner/repo");
        expect(result).toEqual("v1.5.0");
    });
});
