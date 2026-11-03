import { execFile } from "child_process";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";
import { describe, expect, it } from "vitest";
import {
    BrandLookupUnauthorizedError,
    downloadBrandFiles,
    fetchBrand,
    guessBrand,
    iconAsPng,
    imageExtension,
    pickBrandImages,
    searchBrands
} from "../docs-site/brand";
import { applyBrand, confidentMatch, toSubdomain } from "../docs-site/brand-flow";
import { defaultDocsSiteChoices } from "../docs-site/options";

const run = promisify(execFile);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');

function fakeFetch(routes: Record<string, { status?: number; json?: unknown; body?: Buffer }>): typeof fetch {
    return async (input) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const route = Object.entries(routes).find(([prefix]) => url.startsWith(prefix))?.[1];
        if (route === undefined) {
            return new Response("not found", { status: 404 });
        }
        return route.json !== undefined
            ? Response.json(route.json, { status: route.status ?? 200 })
            : new Response(new Uint8Array(route.body ?? Buffer.alloc(0)), { status: route.status ?? 200 });
    };
}

describe("brand lookup", () => {
    it("searches brands through the dashboard and keeps name, domain, and icon", async () => {
        const fetchImpl = fakeFetch({
            "https://dashboard.buildwithfern.com/api/brand-assets/search?q=stripe.com": {
                json: {
                    results: [{ name: "Stripe", domain: "stripe.com", icon: "https://cdn/icon.webp", claimed: true }]
                }
            }
        });
        await expect(searchBrands("stripe.com", "token", fetchImpl)).resolves.toEqual([
            { name: "Stripe", domain: "stripe.com", icon: "https://cdn/icon.webp" }
        ]);
    });

    it("reports an expired login separately from other failures", async () => {
        const unauthorized = fakeFetch({ "https://dashboard": { status: 401, json: {} } });
        await expect(searchBrands("acme", "token", unauthorized)).rejects.toBeInstanceOf(BrandLookupUnauthorizedError);
        const broken = fakeFetch({ "https://dashboard": { status: 500, json: {} } });
        await expect(searchBrands("acme", "token", broken)).resolves.toEqual([]);
        await expect(fetchBrand("acme.com", "token", broken)).resolves.toBeUndefined();
    });

    it("maps the dashboard's brand fields onto docs branding", async () => {
        const fetchImpl = fakeFetch({
            "https://dashboard.buildwithfern.com/api/brand-assets/fetch": {
                json: {
                    updates: {
                        docsSiteName: "Stripe",
                        docsSiteUrl: "stripe",
                        primaryColorHex: "#635BFF",
                        faviconUrl: null
                    },
                    brandData: {
                        logos: [
                            {
                                type: "logo",
                                theme: "dark",
                                formats: [{ src: "https://asset/wordmark.png", format: "png" }]
                            },
                            { type: "icon", theme: null, formats: [{ src: "https://asset/icon.png", format: "png" }] },
                            { type: "logo", theme: "light", formats: [] }
                        ]
                    }
                }
            }
        });
        await expect(fetchBrand("stripe.com", "token", fetchImpl)).resolves.toEqual({
            name: "Stripe",
            slug: "stripe",
            primaryColor: "#635bff",
            logos: [
                { url: "https://asset/wordmark.png", type: "logo", theme: "dark" },
                { url: "https://asset/icon.png", type: "icon", theme: null }
            ],
            faviconUrl: undefined
        });
    });

    it("uses wordmarks for the logos and the square icon for the favicon", () => {
        expect(
            pickBrandImages({
                logos: [
                    { url: "https://asset/icon.png", type: "icon", theme: null },
                    { url: "https://asset/white-wordmark.png", type: "logo", theme: "light" },
                    { url: "https://asset/wordmark.png", type: "logo", theme: "dark" }
                ]
            })
        ).toEqual({
            logo: "https://asset/wordmark.png",
            darkLogo: "https://asset/white-wordmark.png",
            favicon: "https://asset/icon.png"
        });
        // With no wordmark, a non-icon image is preferred for the logo and the icon stays the favicon.
        expect(
            pickBrandImages({
                logos: [
                    { url: "https://asset/icon.png", type: "icon", theme: null },
                    { url: "https://asset/other.png", type: "other", theme: "dark" }
                ]
            })
        ).toEqual({ logo: "https://asset/other.png", darkLogo: undefined, favicon: "https://asset/icon.png" });
    });

    it("only auto-applies a brand without a prompt when the guessed domain matches exactly", () => {
        const results = [
            { name: "Wizard Media", domain: "wizardmedia.com" },
            { name: "Acme", domain: "acme.io" }
        ];
        expect(confidentMatch("acme.io", results)).toEqual({ name: "Acme", domain: "acme.io" });
        expect(confidentMatch("wizard-test", results)).toBeUndefined();
        expect(confidentMatch("other.com", results)).toBeUndefined();
    });

    it("downloads the light-background logo, the dark-mode logo, and the favicon", async () => {
        const fetchImpl = fakeFetch({
            "https://asset/white.png": { body: PNG },
            "https://asset/dark-on-light.svg": { body: SVG },
            "https://cdn/icon.png": { body: PNG }
        });
        const files = await downloadBrandFiles(
            {
                logos: [
                    { url: "https://asset/white.png", type: "logo", theme: "light" },
                    { url: "https://asset/dark-on-light.svg", type: "logo", theme: "dark" }
                ],
                faviconUrl: "https://cdn/icon.png"
            },
            fetchImpl
        );
        // Brandfetch's "light" theme marks logos meant for dark backgrounds.
        expect(path.basename(files.logoPath ?? "")).toBe("logo.svg");
        expect(path.basename(files.darkLogoPath ?? "")).toBe("logo-dark.png");
        expect(path.basename(files.faviconPath ?? "")).toBe("favicon.png");
        await expect(readFile(files.logoPath ?? "")).resolves.toEqual(SVG);
        // Each saved image keeps a link to where it came from, so it can be checked.
        expect(files.sources).toEqual({
            logo: "https://asset/dark-on-light.svg",
            darkLogo: "https://asset/white.png",
            favicon: "https://cdn/icon.png"
        });
    });

    it("skips downloads that are not images", async () => {
        const fetchImpl = fakeFetch({ "https://asset/logo.png": { body: Buffer.from("<html>blocked</html>") } });
        const files = await downloadBrandFiles(
            { logos: [{ url: "https://asset/logo.png", type: "logo", theme: null }] },
            fetchImpl
        );
        expect(files.logoPath).toBeUndefined();
        expect(files.sources.logo).toBeUndefined();
    });

    it("identifies images by their contents", () => {
        expect(imageExtension(PNG)).toBe(".png");
        expect(imageExtension(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe(".jpg");
        expect(imageExtension(SVG)).toBe(".svg");
        expect(imageExtension(Buffer.from("plain text"))).toBeUndefined();
    });

    it("requests Brandfetch's icon as a PNG for the favicon", () => {
        expect(iconAsPng("https://cdn.brandfetch.io/id/w/128/h/128/fallback/lettermark/icon.webp?c=abc")).toBe(
            "https://cdn.brandfetch.io/id/w/128/h/128/fallback/lettermark/icon.png?c=abc"
        );
    });

    it("guesses the company from a work email, otherwise from the GitHub remote", async () => {
        const dir = await mkdtemp(path.join(os.tmpdir(), "fern-brand-guess-"));
        await run("git", ["init", "-q"], { cwd: dir });
        await run("git", ["config", "user.email", "dev@acme.io"], { cwd: dir });
        await expect(guessBrand(dir, "fallback-org")).resolves.toEqual({ query: "acme.io", source: "your git email" });

        await run("git", ["config", "user.email", "someone@gmail.com"], { cwd: dir });
        await run("git", ["remote", "add", "origin", "git@github.com:acme-labs/api.git"], { cwd: dir });
        await expect(guessBrand(dir, "fallback-org")).resolves.toEqual({
            query: "acme-labs",
            source: "your GitHub remote"
        });

        await run("git", ["remote", "remove", "origin"], { cwd: dir });
        await writeFile(path.join(dir, "package.json"), '{"homepage":"https://www.acme.dev/docs"}');
        await expect(guessBrand(dir, "fallback-org")).resolves.toEqual({ query: "acme.dev", source: "package.json" });
        await rm(dir, { recursive: true, force: true });
    });

    it("fills the docs site from the brand and turns its name into a docs URL", () => {
        const choices = applyBrand(defaultDocsSiteChoices("acme"), {
            brand: { name: "Acme Corp", slug: "Acme Corp", primaryColor: "#123456", logos: [] },
            files: {
                logoPath: "/tmp/logo.png",
                darkLogoPath: "/tmp/logo-dark.png",
                faviconPath: "/tmp/favicon.png",
                sources: {}
            }
        });
        expect(choices).toMatchObject({
            siteTitle: "Acme Corp",
            subdomain: "acme-corp",
            primaryColor: "#123456",
            logoPath: "/tmp/logo.png",
            darkLogoPath: "/tmp/logo-dark.png",
            faviconPath: "/tmp/favicon.png"
        });
        expect(applyBrand(defaultDocsSiteChoices("acme"), undefined)).toEqual(defaultDocsSiteChoices("acme"));
        expect(toSubdomain("  !!! ")).toBeUndefined();
    });
});
