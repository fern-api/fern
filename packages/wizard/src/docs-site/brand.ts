import { execFile } from "child_process";
import { mkdtemp, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";

// Pulls a company's logo, favicon, and accent color through the same Brandfetch-backed endpoints the
// Fern Dashboard's onboarding uses, authenticated with the user's `fern login` token.

const DEFAULT_DASHBOARD_URL = "https://dashboard.buildwithfern.com";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Email providers whose domain says nothing about the user's company. */
const PERSONAL_EMAIL_DOMAINS = new Set([
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "icloud.com",
    "me.com",
    "mac.com",
    "aol.com",
    "proton.me",
    "protonmail.com",
    "fastmail.com",
    "hey.com",
    "gmx.com",
    "yandex.com",
    "users.noreply.github.com"
]);

export interface BrandGuess {
    /** What to search Brandfetch for: a domain or a company name. */
    query: string;
    /** Where the guess came from, for display. */
    source: string;
}

export interface BrandSearchResult {
    name: string;
    domain: string;
    /** Square brand icon from Brandfetch's CDN. */
    icon?: string;
}

export interface BrandLogo {
    url: string;
    /** Brandfetch's kind: "logo" is a wordmark, "icon" and "symbol" are square marks. */
    type: string;
    /** Brandfetch marks logos meant for dark backgrounds (white wordmarks) with "light". */
    theme: "dark" | "light" | null;
}

export interface Brand {
    name?: string;
    /** Suggested docs subdomain, derived from the brand name. */
    slug?: string;
    primaryColor?: string;
    logos: BrandLogo[];
    faviconUrl?: string;
}

export interface BrandFiles {
    logoPath?: string;
    darkLogoPath?: string;
    faviconPath?: string;
    /** Where each downloaded image came from, so users can open and check it. */
    sources: { logo?: string; darkLogo?: string; favicon?: string };
}

type Fetch = typeof fetch;

export class BrandLookupUnauthorizedError extends Error {
    constructor() {
        super("Your Fern login has expired. Run `fern login` and try again.");
    }
}

/** The token `fern login` stores, or FERN_TOKEN when set. */
export async function readFernToken(): Promise<string | undefined> {
    const fromEnvironment = process.env.FERN_TOKEN?.trim();
    if (fromEnvironment) {
        return fromEnvironment;
    }
    try {
        const token = (await readFile(path.join(os.homedir(), ".fern", "token"), "utf8")).trim();
        return token.length > 0 ? token : undefined;
    } catch {
        // Not logged in.
        return undefined;
    }
}

/**
 * Best guess at the company behind this repository: the git email's domain, then the GitHub
 * organization, then package.json's homepage, then the Fern organization name.
 */
export async function guessBrand(dir: string, org: string | undefined): Promise<BrandGuess | undefined> {
    const email = await git(dir, ["config", "user.email"]);
    const emailDomain = email?.split("@")[1]?.toLowerCase();
    if (emailDomain !== undefined && !PERSONAL_EMAIL_DOMAINS.has(emailDomain)) {
        return { query: emailDomain, source: "your git email" };
    }
    const remote = await git(dir, ["remote", "get-url", "origin"]);
    const owner = remote?.match(/github\.com[:/]([^/]+)\//)?.[1];
    if (owner !== undefined) {
        return { query: owner, source: "your GitHub remote" };
    }
    const homepage = await readHomepage(dir);
    if (homepage !== undefined) {
        return { query: homepage, source: "package.json" };
    }
    return org === undefined ? undefined : { query: org, source: "your Fern organization" };
}

export async function searchBrands(
    query: string,
    token: string,
    fetchImpl: Fetch = fetch
): Promise<BrandSearchResult[]> {
    const response = await fetchImpl(
        `${dashboardUrl()}/api/brand-assets/search?q=${encodeURIComponent(query.trim())}`,
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
    );
    if (response.status === 401) {
        throw new BrandLookupUnauthorizedError();
    }
    if (!response.ok) {
        return [];
    }
    const body: unknown = await response.json();
    const results = isRecord(body) && Array.isArray(body.results) ? body.results : [];
    return results.flatMap((result): BrandSearchResult[] =>
        isRecord(result) && typeof result.name === "string" && typeof result.domain === "string"
            ? [{ name: result.name, domain: result.domain, icon: optionalString(result.icon) }]
            : []
    );
}

export async function fetchBrand(domain: string, token: string, fetchImpl: Fetch = fetch): Promise<Brand | undefined> {
    const response = await fetchImpl(`${dashboardUrl()}/api/brand-assets/fetch`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ identifier: domain })
    });
    if (response.status === 401) {
        throw new BrandLookupUnauthorizedError();
    }
    if (!response.ok) {
        return undefined;
    }
    const body: unknown = await response.json();
    const updates = isRecord(body) && isRecord(body.updates) ? body.updates : {};
    const brandData = isRecord(body) && isRecord(body.brandData) ? body.brandData : {};
    return {
        name: optionalString(updates.docsSiteName),
        slug: optionalString(updates.docsSiteUrl),
        primaryColor: optionalString(updates.primaryColorHex)?.toLowerCase(),
        logos: parseLogos(brandData.logos),
        faviconUrl: optionalString(updates.faviconUrl)
    };
}

/** Brandfetch's logos, keeping each one's type and theme and its first downloadable format. */
function parseLogos(value: unknown): BrandLogo[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.flatMap((logo): BrandLogo[] => {
        if (!isRecord(logo) || !Array.isArray(logo.formats)) {
            return [];
        }
        const url = logo.formats
            .map((format) => (isRecord(format) ? optionalString(format.src) : undefined))
            .find((src): src is string => src !== undefined);
        if (url === undefined) {
            return [];
        }
        const theme = logo.theme === "dark" || logo.theme === "light" ? logo.theme : null;
        return [{ url, type: optionalString(logo.type) ?? "logo", theme }];
    });
}

/**
 * Picks which Brandfetch images to use: wordmarks for the logos (one for light backgrounds, one for
 * dark), and a square mark for the favicon.
 */
export function pickBrandImages(brand: Brand): { logo?: string; darkLogo?: string; favicon?: string } {
    const wordmarks = brand.logos.filter((logo) => logo.type === "logo");
    const marks = brand.logos.filter((logo) => logo.type === "icon" || logo.type === "symbol");
    const forLightBackground =
        wordmarks.find((logo) => logo.theme !== "light") ??
        brand.logos.find((logo) => logo.type !== "icon" && logo.theme !== "light") ??
        wordmarks[0] ??
        brand.logos[0];
    const forDarkBackground = wordmarks.find((logo) => logo.theme === "light");
    return {
        logo: forLightBackground?.url,
        darkLogo: forDarkBackground?.url,
        favicon: brand.faviconUrl ?? (marks.find((logo) => logo.type === "icon") ?? marks[0])?.url
    };
}

/** Brandfetch's CDN serves the same icon in other formats; PNG works as a favicon everywhere. */
export function iconAsPng(iconUrl: string): string {
    return iconUrl.replace(/\/icon\.(webp|jpe?g|svg)(\?|$)/, "/icon.png$2");
}

/**
 * Downloads the brand's logos and favicon (see {@link pickBrandImages}) to a temporary directory.
 */
export async function downloadBrandFiles(brand: Brand, fetchImpl: Fetch = fetch): Promise<BrandFiles> {
    const dir = await mkdtemp(path.join(os.tmpdir(), "fern-brand-"));
    const images = pickBrandImages(brand);
    const get = async (url: string | undefined, name: string): Promise<string | undefined> =>
        url === undefined ? undefined : download(url, path.join(dir, name), fetchImpl);
    const logoPath = await get(images.logo, "logo");
    const darkLogoPath = await get(images.darkLogo, "logo-dark");
    const faviconPath = await get(images.favicon, "favicon");
    return {
        logoPath,
        darkLogoPath,
        faviconPath,
        sources: {
            logo: logoPath === undefined ? undefined : images.logo,
            darkLogo: darkLogoPath === undefined ? undefined : images.darkLogo,
            favicon: faviconPath === undefined ? undefined : images.favicon
        }
    };
}

async function download(url: string, basePath: string, fetchImpl: Fetch): Promise<string | undefined> {
    try {
        const response = await fetchImpl(url);
        if (!response.ok) {
            return undefined;
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        const extension = imageExtension(buffer);
        if (extension === undefined || buffer.length > MAX_IMAGE_BYTES) {
            return undefined;
        }
        const filePath = `${basePath}${extension}`;
        await writeFile(filePath, buffer);
        return filePath;
    } catch {
        // A missing image just means the starter's default is kept.
        return undefined;
    }
}

/** Identifies an image by its magic number rather than trusting the URL or content type. */
export function imageExtension(buffer: Buffer): string | undefined {
    if (buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        return ".png";
    }
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return ".jpg";
    }
    if (
        buffer.length >= 12 &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP"
    ) {
        return ".webp";
    }
    const start = buffer.toString("utf8", 0, Math.min(200, buffer.length));
    if (start.includes("<svg") || start.trimStart().startsWith("<?xml")) {
        return ".svg";
    }
    if (buffer.length >= 4 && buffer[0] === 0 && buffer[1] === 0 && buffer[2] === 1 && buffer[3] === 0) {
        return ".ico";
    }
    return undefined;
}

function dashboardUrl(): string {
    return (process.env.FERN_DASHBOARD_URL ?? DEFAULT_DASHBOARD_URL).replace(/\/$/, "");
}

async function git(dir: string, args: string[]): Promise<string | undefined> {
    return new Promise((resolve) => {
        execFile("git", args, { cwd: dir, timeout: 5000 }, (error, stdout) => {
            const value = stdout.trim();
            resolve(error === null && value.length > 0 ? value : undefined);
        });
    });
}

async function readHomepage(dir: string): Promise<string | undefined> {
    try {
        const manifest: unknown = JSON.parse(await readFile(path.join(dir, "package.json"), "utf8"));
        const homepage = isRecord(manifest) ? manifest.homepage : undefined;
        return typeof homepage === "string" ? new URL(homepage).hostname.replace(/^www\./, "") : undefined;
    } catch {
        // No package.json, or no usable homepage.
        return undefined;
    }
}

function optionalString(value: unknown): string | undefined {
    return typeof value === "string" && value.length > 0 ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
