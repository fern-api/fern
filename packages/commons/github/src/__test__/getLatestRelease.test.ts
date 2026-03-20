import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLatestRelease } from "../getLatestRelease.js";

const mockGetLatestRelease = vi.fn();
const mockListReleases = vi.fn();

vi.mock("octokit", () => {
    return {
        Octokit: class MockOctokit {
            rest = {
                repos: {
                    getLatestRelease: mockGetLatestRelease,
                    listReleases: mockListReleases
                }
            };
            /**
             * Simulates octokit.paginate(endpoint, params, mapFn) by calling the
             * map function with the mock listReleases response and a done callback.
             */
            paginate = async (
                _endpoint: unknown,
                _params: unknown,
                mapFn: (response: unknown, done: () => void) => string[]
            ) => {
                const response = await mockListReleases(_params);
                // no-op: the test doesn't need to track whether done() was called
                const done = () => undefined;
                return mapFn(response, done);
            };
        }
    };
});

describe("getLatestRelease", () => {
    beforeEach(() => {
        mockGetLatestRelease.mockReset();
        mockListReleases.mockReset();
    });

    it("returns the tag_name from the latest release", async () => {
        mockGetLatestRelease.mockResolvedValueOnce({
            data: { tag_name: "v2.0.0" }
        });

        const result = await getLatestRelease("owner/repo");
        expect(result).toEqual("v2.0.0");
        expect(mockListReleases).not.toHaveBeenCalled();
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
        expect(mockListReleases).not.toHaveBeenCalled();
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
        mockListReleases.mockResolvedValueOnce({
            data: [
                { tag_name: "0.0.0-dev-babaf54d", draft: false, prerelease: false },
                { tag_name: "0.0.0-dev-abc12345", draft: false, prerelease: false },
                { tag_name: "v0.0.33450", draft: false, prerelease: false }
            ]
        });

        const result = await getLatestRelease("owner/repo");
        expect(result).toEqual("v0.0.33450");
        expect(mockListReleases).toHaveBeenCalledWith({ owner: "owner", repo: "repo", per_page: 100 });
    });

    it("returns undefined when paginate exhausts all pages without finding stable release", async () => {
        mockGetLatestRelease.mockResolvedValueOnce({
            data: { tag_name: "0.0.0-dev-aaa" }
        });
        mockListReleases.mockResolvedValueOnce({
            data: [
                { tag_name: "0.0.0-dev-aaa", draft: false, prerelease: false },
                { tag_name: "0.0.0-dev-bbb", draft: false, prerelease: false }
            ]
        });

        const result = await getLatestRelease("owner/repo");
        expect(result).toBeUndefined();
    });

    it("skips GitHub drafts and prereleases when falling back", async () => {
        mockGetLatestRelease.mockResolvedValueOnce({
            data: { tag_name: "v1.0.0-rc.1" }
        });
        mockListReleases.mockResolvedValueOnce({
            data: [
                { tag_name: "v1.0.0-rc.1", draft: false, prerelease: false },
                { tag_name: "v0.9.9", draft: true, prerelease: false },
                { tag_name: "v0.9.8", draft: false, prerelease: true },
                { tag_name: "v0.9.7", draft: false, prerelease: false }
            ]
        });

        const result = await getLatestRelease("owner/repo");
        expect(result).toEqual("v0.9.7");
    });

    it("returns undefined when all releases are semver prereleases", async () => {
        mockGetLatestRelease.mockResolvedValueOnce({
            data: { tag_name: "0.0.0-dev-aaa" }
        });
        mockListReleases.mockResolvedValueOnce({
            data: [
                { tag_name: "0.0.0-dev-aaa", draft: false, prerelease: false },
                { tag_name: "0.0.0-dev-bbb", draft: false, prerelease: false },
                { tag_name: "0.0.0-dev-ccc", draft: false, prerelease: false }
            ]
        });

        const result = await getLatestRelease("owner/repo");
        expect(result).toBeUndefined();
    });

    it("handles v-prefixed semver prerelease tags", async () => {
        mockGetLatestRelease.mockResolvedValueOnce({
            data: { tag_name: "v2.0.0-beta.1" }
        });
        mockListReleases.mockResolvedValueOnce({
            data: [
                { tag_name: "v2.0.0-beta.1", draft: false, prerelease: false },
                { tag_name: "v1.5.0", draft: false, prerelease: false }
            ]
        });

        const result = await getLatestRelease("owner/repo");
        expect(result).toEqual("v1.5.0");
    });
});
