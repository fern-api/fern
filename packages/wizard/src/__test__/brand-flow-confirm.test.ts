import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Brand, BrandSearchResult } from "../docs-site/brand";
import { chooseBrand } from "../docs-site/brand-flow";

const RESULTS: BrandSearchResult[] = [
    { name: "GitHub", domain: "githubstatus.com" },
    { name: "GitHub", domain: "github.com" }
];

const searchBrands = vi.fn(async (_query: string, _token: string) => RESULTS);
const fetchBrand = vi.fn(
    async (domain: string, _token: string): Promise<Brand> => ({
        name: "GitHub",
        primaryColor: domain === "github.com" ? "#0fbf3e" : "#00791c",
        logos: []
    })
);

vi.mock("../docs-site/brand", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../docs-site/brand")>()),
    guessBrand: async () => ({ query: "github", source: "test" }),
    searchBrands: (query: string, token: string) => searchBrands(query, token),
    fetchBrand: (domain: string, token: string) => fetchBrand(domain, token),
    downloadBrandFiles: async (brand: Brand) => ({ logoPath: `/tmp/${brand.primaryColor}.png`, sources: {} })
}));

// Each prompt takes the next answer in line.
const answers: Array<Record<string, string>> = [];
vi.mock("inquirer", () => ({
    default: {
        prompt: async () => answers.shift() ?? {},
        Separator: class {}
    }
}));

beforeEach(() => {
    process.env.FERN_TOKEN = "token";
});

afterEach(() => {
    delete process.env.FERN_TOKEN;
    answers.length = 0;
    searchBrands.mockClear();
    fetchBrand.mockClear();
});

describe("confirming the brand", () => {
    it("asks before using the brand, and can go back to choose a different company", async () => {
        answers.push(
            { choice: "githubstatus.com" },
            { decision: "search-again" },
            { company: "github.com" },
            { choice: "github.com" },
            { decision: "use" }
        );

        const selection = await chooseBrand({
            dir: "/tmp/project",
            org: undefined,
            query: undefined,
            yes: false,
            login: async () => undefined
        });

        expect(fetchBrand.mock.calls.map(([domain]) => domain)).toEqual(["githubstatus.com", "github.com"]);
        expect(searchBrands.mock.calls.map(([query]) => query)).toEqual(["github", "github.com"]);
        expect(selection?.brand.primaryColor).toBe("#0fbf3e");
        expect(answers).toEqual([]);
    });

    it("keeps the starter branding when the user skips after reviewing", async () => {
        answers.push({ choice: "github.com" }, { decision: "skip" });

        await expect(
            chooseBrand({
                dir: "/tmp/project",
                org: undefined,
                query: undefined,
                yes: false,
                login: async () => undefined
            })
        ).resolves.toBeUndefined();
    });

    it("doesn't ask with --yes", async () => {
        const selection = await chooseBrand({
            dir: "/tmp/project",
            org: undefined,
            query: "github.com",
            yes: true,
            login: async () => undefined
        });

        expect(selection?.brand.primaryColor).toBe("#00791c");
        expect(answers).toEqual([]);
    });
});
