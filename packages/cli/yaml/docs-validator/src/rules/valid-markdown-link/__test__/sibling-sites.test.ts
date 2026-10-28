import { afterEach, describe, expect, it, vi } from "vitest";

import { checkSiblingLink, fetchSiblingSites, getSiblingSiteBasepath } from "../sibling-sites.js";

describe("getSiblingSiteBasepath", () => {
    const siblings = ["product-a", "product-b", "seeds", "seeds/sunflower"];

    it("matches a path under a sibling basepath", () => {
        expect(getSiblingSiteBasepath("/product-b/overview", "/product-a", siblings)).toBe("product-b");
        expect(getSiblingSiteBasepath("/product-b", "/product-a", siblings)).toBe("product-b");
        expect(getSiblingSiteBasepath("/product-b/overview#install?x=1", "/product-a", siblings)).toBe("product-b");
    });

    it("does not match the current site or unrelated paths", () => {
        expect(getSiblingSiteBasepath("/product-a/missing", "/product-a", siblings)).toBeUndefined();
        expect(getSiblingSiteBasepath("/does-not-exist", "/product-a", siblings)).toBeUndefined();
        expect(getSiblingSiteBasepath("/product-beta/overview", "/product-a", siblings)).toBeUndefined();
    });

    it("prefers the longest basepath for nested sites", () => {
        expect(getSiblingSiteBasepath("/seeds/overview", "/seeds/sunflower", siblings)).toBe("seeds");
        expect(getSiblingSiteBasepath("/seeds/sunflower/missing", "/seeds/sunflower", siblings)).toBeUndefined();
        expect(getSiblingSiteBasepath("/seeds/sunflower/intro", "/seeds", siblings)).toBe("seeds/sunflower");
    });

    it("keeps checking the current site even when it is not live yet", () => {
        expect(getSiblingSiteBasepath("/seeds/sunflower/missing", "/seeds/sunflower", ["seeds"])).toBeUndefined();
    });

    it("ignores relative paths and empty sibling lists", () => {
        expect(getSiblingSiteBasepath("product-b/overview", "/product-a", siblings)).toBeUndefined();
        expect(getSiblingSiteBasepath("/product-b/overview", "/product-a", [])).toBeUndefined();
    });
});

describe("fetchSiblingSites", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("posts the domain, asks for slugs and normalizes the response", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    sites: [
                        { basepath: "/product-b/", slugs: ["product-b/overview/", "/product-b/api/get"] },
                        { basepath: "" }
                    ]
                }),
                { status: 200 }
            )
        );
        vi.stubGlobal("fetch", fetchMock);
        const result = await fetchSiblingSites({
            fdrOrigin: "https://fdr.example.com",
            domain: "docs.example.com",
            token: "token"
        });
        expect(result).toEqual({
            type: "success",
            sites: [
                { basepath: "product-b", slugs: new Set(["product-b/overview", "product-b/api/get"]) },
                { basepath: "", slugs: undefined }
            ]
        });
        expect(fetchMock).toHaveBeenCalledWith(
            "https://fdr.example.com/slugs/sites",
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({ domain: "docs.example.com", includeSlugs: true })
            })
        );
    });

    it("skips without a token", async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
        const result = await fetchSiblingSites({ fdrOrigin: "https://fdr", domain: "d", token: undefined });
        expect(result).toEqual({ type: "skipped", reason: "not authenticated" });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("skips when FDR fails", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("forbidden", { status: 403 })));
        const result = await fetchSiblingSites({ fdrOrigin: "https://fdr", domain: "d", token: "t" });
        expect(result).toEqual({ type: "skipped", reason: "FDR returned 403" });
    });

    it("reports a timeout clearly", async () => {
        const timeout = new Error("The operation was aborted due to timeout");
        timeout.name = "TimeoutError";
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(timeout));
        const result = await fetchSiblingSites({ fdrOrigin: "https://fdr", domain: "d", token: "t" });
        expect(result).toEqual({ type: "skipped", reason: "FDR timed out after 30s" });
    });
});

describe("checkSiblingLink", () => {
    const site = { basepath: "product-b", slugs: new Set(["product-b/overview", "product-b/api/get-user"]) };

    it("finds published pages, ignoring anchors, query params and trailing slashes", () => {
        expect(checkSiblingLink("/product-b/overview", site)).toBe("found");
        expect(checkSiblingLink("/product-b/api/get-user/#response", site)).toBe("found");
        expect(checkSiblingLink("/product-b/overview?tab=1", site)).toBe("found");
    });

    it("treats the sibling's own root as found", () => {
        expect(checkSiblingLink("/product-b", site)).toBe("found");
        expect(checkSiblingLink("/product-b/", site)).toBe("found");
    });

    it("reports pages the sibling does not publish as missing", () => {
        expect(checkSiblingLink("/product-b/does-not-exist", site)).toBe("missing");
    });

    it("is unverified when FDR has no page list for the sibling", () => {
        expect(checkSiblingLink("/product-b/overview", { basepath: "product-b", slugs: undefined })).toBe("unverified");
    });
});
