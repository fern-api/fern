import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLatestRelease } from "../getLatestRelease.js";

const mockGetLatestRelease = vi.fn();

vi.mock("octokit", () => {
    return {
        Octokit: class MockOctokit {
            rest = {
                repos: {
                    getLatestRelease: mockGetLatestRelease
                }
            };
        }
    };
});

describe("getLatestRelease", () => {
    beforeEach(() => {
        mockGetLatestRelease.mockReset();
    });

    it("returns the tag_name from the latest release", async () => {
        mockGetLatestRelease.mockResolvedValueOnce({
            data: { tag_name: "v2.0.0" }
        });

        const result = await getLatestRelease("owner/repo");
        expect(result).toEqual("v2.0.0");
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
});
