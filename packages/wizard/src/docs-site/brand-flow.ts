import chalk from "chalk";
import inquirer from "inquirer";
import { hyperlink, printDetail, printDone, printSkipped, withStatus } from "../ui";
import {
    type Brand,
    type BrandFiles,
    BrandLookupUnauthorizedError,
    type BrandSearchResult,
    downloadBrandFiles,
    fetchBrand,
    guessBrand,
    iconAsPng,
    readFernToken,
    searchBrands
} from "./brand";
import type { DocsSiteChoices } from "./options";

const MAX_CHOICES = 5;
const SEARCH_AGAIN = "__search-again__";
const SKIP = "__skip__";

export interface BrandSelection {
    brand: Brand;
    files: BrandFiles;
}

/**
 * Finds the user's brand the way the Dashboard onboarding does: guess the company, search
 * Brandfetch, let the user confirm the match, then pull its logos, favicon, and accent color.
 * Returns undefined when the user skips or the lookup isn't possible; the starter branding is kept.
 */
export async function chooseBrand({
    dir,
    org,
    query,
    yes,
    login
}: {
    dir: string;
    org: string | undefined;
    /** A company name or domain given with --brand. */
    query: string | undefined;
    yes: boolean;
    /** Runs `fern login` interactively. */
    login: () => Promise<void>;
}): Promise<BrandSelection | undefined> {
    let token = await readFernToken();
    if (token === undefined) {
        if (yes || !(await confirm("Sign in to Fern to pull your logo and colors automatically?"))) {
            printSkipped("Keeping the starter branding (not signed in to Fern)");
            return undefined;
        }
        await login();
        token = await readFernToken();
        if (token === undefined) {
            printSkipped("Keeping the starter branding (sign-in did not complete)");
            return undefined;
        }
    }

    try {
        const guess = query === undefined ? await guessBrand(dir, org) : { query, source: "--brand" };
        const match = await pickBrand(guess?.query, token, yes, query !== undefined);
        if (match === undefined) {
            printSkipped("Keeping the starter branding");
            return undefined;
        }
        const brandToken = token;
        const selection = await withStatus(`Fetching ${match.name}'s logo and colors`, async () => {
            const brand = await fetchBrand(match.domain, brandToken);
            if (brand === undefined) {
                return undefined;
            }
            // Brands without an icon-type logo still have a square icon in search results.
            const hasMark = brand.logos.some((logo) => logo.type === "icon" || logo.type === "symbol");
            const withFavicon =
                brand.faviconUrl === undefined && !hasMark && match.icon !== undefined
                    ? { ...brand, faviconUrl: iconAsPng(match.icon) }
                    : brand;
            return { brand: withFavicon, files: await downloadBrandFiles(withFavicon) };
        });
        if (selection === undefined) {
            printSkipped(`Couldn't load ${match.name}'s brand, so keeping the starter branding`);
            return undefined;
        }
        printBrandSummary(selection, match.name);
        return selection;
    } catch (error) {
        if (error instanceof BrandLookupUnauthorizedError) {
            printSkipped(`${error.message} Keeping the starter branding for now.`);
            return undefined;
        }
        throw error;
    }
}

/** Applies a brand on top of the template defaults. */
export function applyBrand(defaults: DocsSiteChoices, selection: BrandSelection | undefined): DocsSiteChoices {
    if (selection === undefined) {
        return defaults;
    }
    const { brand, files } = selection;
    const slug = brand.slug === undefined ? undefined : toSubdomain(brand.slug);
    return {
        ...defaults,
        ...(brand.name === undefined ? {} : { siteTitle: brand.name }),
        ...(slug === undefined ? {} : { subdomain: slug }),
        ...(brand.primaryColor === undefined ? {} : { primaryColor: brand.primaryColor }),
        ...(files.logoPath === undefined ? {} : { logoPath: files.logoPath }),
        ...(files.darkLogoPath === undefined ? {} : { darkLogoPath: files.darkLogoPath }),
        ...(files.faviconPath === undefined ? {} : { faviconPath: files.faviconPath })
    };
}

/** A docs subdomain: lowercase letters, numbers, and inner hyphens. */
export function toSubdomain(value: string): string | undefined {
    const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return slug.length > 0 ? slug : undefined;
}

async function pickBrand(
    initialQuery: string | undefined,
    token: string,
    yes: boolean,
    /** The user named the brand with --brand, so the top result can be trusted. */
    explicit: boolean
): Promise<BrandSearchResult | undefined> {
    let query = initialQuery;
    for (;;) {
        if (query === undefined || query.trim().length === 0) {
            if (yes) {
                return undefined;
            }
            query = await askForCompany();
            if (query === undefined) {
                return undefined;
            }
        }
        const currentQuery = query;
        const results = await withStatus(`Looking up ${currentQuery}`, () => searchBrands(currentQuery, token));
        if (yes) {
            // Without a prompt, only apply a brand we are sure of.
            return explicit ? results[0] : confidentMatch(currentQuery, results);
        }
        if (results.length === 0) {
            printSkipped(`No brands found for "${currentQuery}"`);
            query = undefined;
            continue;
        }
        const answer = await inquirer.prompt<{ choice: string }>([
            {
                type: "list",
                name: "choice",
                message: "Which company is this for?",
                pageSize: MAX_CHOICES + 3,
                choices: [
                    ...results
                        .slice(0, MAX_CHOICES)
                        .map((result) => ({ name: `${result.name} (${result.domain})`, value: result.domain })),
                    new inquirer.Separator(),
                    { name: "Search for a different company", value: SEARCH_AGAIN },
                    { name: "Skip and keep the starter branding", value: SKIP }
                ]
            }
        ]);
        if (answer.choice === SKIP) {
            return undefined;
        }
        if (answer.choice === SEARCH_AGAIN) {
            query = undefined;
            continue;
        }
        return results.find((result) => result.domain === answer.choice);
    }
}

/** A search result whose domain is exactly the guessed domain (for example from a work email). */
export function confidentMatch(query: string, results: BrandSearchResult[]): BrandSearchResult | undefined {
    const domain = query.trim().toLowerCase();
    return domain.includes(".") ? results.find((result) => result.domain.toLowerCase() === domain) : undefined;
}

async function askForCompany(): Promise<string | undefined> {
    const answer = await inquirer.prompt<{ company: string }>([
        { type: "input", name: "company", message: "Company name or website (blank to skip)" }
    ]);
    const company = answer.company.trim();
    return company.length > 0 ? company : undefined;
}

async function confirm(message: string): Promise<boolean> {
    const answer = await inquirer.prompt<{ proceed: boolean }>([
        { type: "confirm", name: "proceed", message, default: true }
    ]);
    return answer.proceed;
}

/** One line per thing found, each with a link to open and check it. */
function printBrandSummary({ brand, files }: BrandSelection, fallbackName: string): void {
    const name = brand.name ?? fallbackName;
    const rows: Array<[string, string, string]> = [];
    if (files.sources.logo !== undefined) {
        rows.push(["logo", "", files.sources.logo]);
    }
    if (files.sources.darkLogo !== undefined) {
        rows.push(["dark-mode logo", "", files.sources.darkLogo]);
    }
    if (files.sources.favicon !== undefined) {
        rows.push(["favicon", "", files.sources.favicon]);
    }
    if (brand.primaryColor !== undefined) {
        const hex = brand.primaryColor.replace(/^#/, "");
        rows.push([
            "accent",
            `${chalk.hex(brand.primaryColor)("██")} ${brand.primaryColor}  `,
            `https://www.colorhexa.com/${hex}`
        ]);
    }
    if (rows.length === 0) {
        printDone(`Found ${name}, but no logo or colors`);
        return;
    }
    printDone(`Found ${name}`);
    const labelWidth = Math.max(...rows.map(([label]) => label.length));
    for (const [label, prefix, url] of rows) {
        printDetail(`${hyperlink(label.padEnd(labelWidth), url)}  ${prefix}${chalk.dim(url)}`);
    }
}
