import { afterEach, describe, expect, it, vi } from "vitest";
import { BrandLookupUnauthorizedError, type BrandSearchResult } from "../docs-site/brand";
import { chooseBrand } from "../docs-site/brand-flow";

const searchBrands = vi.fn<(query: string, token: string) => Promise<BrandSearchResult[]>>();

vi.mock("../docs-site/brand", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../docs-site/brand")>()),
    guessBrand: async () => ({ query: "github", source: "test" }),
    searchBrands: (query: string, token: string) => searchBrands(query, token)
}));

// Every prompt is answered with a blank company, which skips branding.
vi.mock("inquirer", () => ({ default: { prompt: async () => ({ company: "" }) } }));

afterEach(() => {
    delete process.env.FERN_TOKEN;
    searchBrands.mockReset();
});

describe("brand lookup with an expired login", () => {
    it("signs in again and repeats the same search", async () => {
        process.env.FERN_TOKEN = "expired";
        searchBrands.mockImplementation(async (_query, token) => {
            if (token === "expired") {
                throw new BrandLookupUnauthorizedError();
            }
            return [];
        });
        const login = vi.fn(async () => {
            process.env.FERN_TOKEN = "renewed";
        });

        await chooseBrand({ dir: "/tmp/project", org: undefined, query: undefined, yes: false, login });

        expect(login).toHaveBeenCalledTimes(1);
        expect(searchBrands.mock.calls).toEqual([
            ["github", "expired"],
            ["github", "renewed"]
        ]);
    });

    it("keeps the starter branding without signing in when nothing can prompt", async () => {
        process.env.FERN_TOKEN = "expired";
        searchBrands.mockRejectedValue(new BrandLookupUnauthorizedError());
        const login = vi.fn(async () => undefined);

        await expect(
            chooseBrand({ dir: "/tmp/project", org: undefined, query: "github.com", yes: true, login })
        ).resolves.toBeUndefined();
        expect(login).not.toHaveBeenCalled();
    });

    it("stops when signing in doesn't produce a new login", async () => {
        process.env.FERN_TOKEN = "expired";
        searchBrands.mockRejectedValue(new BrandLookupUnauthorizedError());
        const login = vi.fn(async () => undefined);

        await expect(
            chooseBrand({ dir: "/tmp/project", org: undefined, query: undefined, yes: false, login })
        ).resolves.toBeUndefined();
        expect(login).toHaveBeenCalledTimes(1);
        expect(searchBrands).toHaveBeenCalledTimes(1);
    });
});
