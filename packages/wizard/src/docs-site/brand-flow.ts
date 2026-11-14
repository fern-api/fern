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
    readFernToken,
    searchBrands,
    withSearchResultFavicon
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

    const guess = query === undefined ? await guessBrand(dir, org) : { query, source: "--brand" };
    // Remembers the company the user typed, so a retry after signing in doesn't ask again.
    const search: SearchState = { query: guess?.query };
    try {
        return await lookUpBrand(search, token, yes, query !== undefined);
    } catch (error) {
        if (!(error instanceof BrandLookupUnauthorizedError)) {
            throw error;
        }
        if (yes) {
            printSkipped(`${error.message} Keeping the starter branding for now.`);
            return undefined;
        }
    }
    // The saved login has expired: sign in again, then repeat the same search.
    printSkipped("Your Fern login has expired, so signing you in again");
    await login();
    const renewed = await readFernToken();
    if (renewed === undefined || renewed === token) {
        printSkipped("Keeping the starter branding (sign-in did not complete)");
        return undefined;
    }
    try {
        return await lookUpBrand(search, renewed, yes, query !== undefined);
    } catch (error) {
        if (error instanceof BrandLookupUnauthorizedError) {
            printSkipped(`${error.message} Keeping the starter branding for now.`);
            return undefined;
        }
        throw error;
    }
}

interface SearchState {
    /** The company to search for; the last one searched once a search has run. */
    query: string | undefined;
}

/**
 * Searches for the brand, lets the user pick it, downloads its logos, favicon, and color, and asks
 * the user to confirm them (or pick a different company) before they are used.
 */
async function lookUpBrand(
    search: SearchState,
    token: string,
    yes: boolean,
    explicit: boolean
): Promise<BrandSelection | undefined> {
    for (;;) {
        const match = await pickBrand(search, token, yes, explicit);
        if (match === undefined) {
            printSkipped("Keeping the starter branding");
            return undefined;
        }
        const selection = await withStatus(`Fetching ${match.name}'s logo and colors`, async () => {
            const brand = await fetchBrand(match.domain, token);
            if (brand === undefined) {
                return undefined;
            }
            const withFavicon = withSearchResultFavicon(brand, match);
            return { brand: withFavicon, files: await downloadBrandFiles(withFavicon) };
        });
        if (selection === undefined) {
            printSkipped(`Couldn't load ${match.name}'s brand, so keeping the starter branding`);
            return undefined;
        }
        printBrandSummary(selection, match.name);
        if (yes) {
            return selection;
        }
        const decision = await confirmBrand(selection.brand.name ?? match.name);
        if (decision === "use") {
            return selection;
        }
        if (decision === "skip") {
            printSkipped("Keeping the starter branding");
            return undefined;
        }
        // Ask for the company again instead of repeating the same search.
        search.query = undefined;
    }
}

/** Lets the user check the logos and color (each line above links to it) before they are used. */
export async function confirmBrand(name: string): Promise<"use" | "search-again" | "skip"> {
    const answer = await inquirer.prompt<{ decision: "use" | "search-again" | "skip" }>([
        {
            type: "list",
            name: "decision",
            message: `Use ${name}'s logo and colors?`,
            choices: [
                { name: "Yes, use them", value: "use" },
                { name: "Choose a different company", value: "search-again" },
                { name: "Skip and keep the starter branding", value: "skip" }
            ]
        }
    ]);
    return answer.decision;
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
    search: SearchState,
    token: string,
    yes: boolean,
    /** The user named the brand with --brand, so the top result can be trusted. */
    explicit: boolean
): Promise<BrandSearchResult | undefined> {
    let query = search.query;
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
        search.query = currentQuery;
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
