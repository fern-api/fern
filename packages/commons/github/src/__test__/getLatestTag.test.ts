import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLatestTag } from "../getLatestTag.js";

const mockListTags = vi.fn();

vi.mock("octokit", () => {
    return {
        Octokit: class MockOctokit {
            rest = {
                repos: {
                    listTags: mockListTags
                }
            };
        }
    };
});

describe("getLatestTag", () => {
    beforeEach(() => {
        mockListTags.mockReset();
    });

    it("returns the highest semver tag, not the most recently created", async () => {
        // Simulate: v1.0.1 was pushed most recently (appears first), but v2.0.0 is higher
        mockListTags.mockResolvedValueOnce({
            data: [{ name: "v1.0.1" }, { name: "v2.0.0" }, { name: "v1.0.0" }]
        });

        const result = await getLatestTag("owner/repo");
        expect(result).toEqual("v2.0.0");
    });

    it("handles tags without v prefix", async () => {
        mockListTags.mockResolvedValueOnce({
            data: [{ name: "1.0.1" }, { name: "3.0.0" }, { name: "2.5.0" }]
        });

        const result = await getLatestTag("owner/repo");
        expect(result).toEqual("3.0.0");
    });

    it("ignores non-semver tags", async () => {
        mockListTags.mockResolvedValueOnce({
            data: [{ name: "build-20240101" }, { name: "v1.2.3" }, { name: "nightly" }, { name: "v0.9.0" }]
        });

        const result = await getLatestTag("owner/repo");
        expect(result).toEqual("v1.2.3");
    });

    it("returns undefined when no valid semver tags exist", async () => {
        mockListTags.mockResolvedValueOnce({
            data: [{ name: "latest" }, { name: "stable" }]
        });

        const result = await getLatestTag("owner/repo");
        expect(result).toBeUndefined();
    });

    it("returns undefined when repo has no tags", async () => {
        mockListTags.mockResolvedValueOnce({
            data: []
        });

        const result = await getLatestTag("owner/repo");
        expect(result).toBeUndefined();
    });

    it("paginates through multiple pages of tags", async () => {
        // First page: 100 tags (triggers pagination)
        const page1 = Array.from({ length: 100 }, (_, i) => ({ name: `v0.0.${i}` }));
        // Second page: contains the highest version
        const page2 = [{ name: "v10.0.0" }, { name: "v1.0.0" }];

        mockListTags.mockResolvedValueOnce({ data: page1 }).mockResolvedValueOnce({ data: page2 });

        const result = await getLatestTag("owner/repo");
        expect(result).toEqual("v10.0.0");
        expect(mockListTags).toHaveBeenCalledTimes(2);
    });

    it("handles mixed v-prefixed and non-prefixed tags", async () => {
        mockListTags.mockResolvedValueOnce({
            data: [{ name: "v1.0.0" }, { name: "2.0.0" }, { name: "v1.5.0" }]
        });

        const result = await getLatestTag("owner/repo");
        expect(result).toEqual("2.0.0");
    });
});
