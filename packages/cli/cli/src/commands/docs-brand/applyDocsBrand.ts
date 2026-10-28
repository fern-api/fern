import { getFernDirectory } from "@fern-api/configuration-loader";
import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import {
    applyBrandToDocsSite,
    BrandLookupUnauthorizedError,
    type BrandSearchResult,
    confidentMatch,
    downloadBrandFiles,
    fetchBrand,
    searchBrands
} from "@fern-api/wizard";

import { CliContext } from "../../cli-context/CliContext.js";
import { requireFernLogin } from "../../utils/requireFernLogin.js";

/**
 * `fern docs brand <company>`: looks up a company's logo, favicon, and accent color (as the Fern
 * Dashboard's onboarding does) and applies them to fern/docs.yml. With `json`, prints the brand
 * instead and changes nothing.
 */
export async function applyDocsBrand({
    cliContext,
    query,
    yes,
    json
}: {
    cliContext: CliContext;
    query: string;
    yes: boolean;
    json: boolean;
}): Promise<void> {
    const token = await requireFernLogin(cliContext);
    const match = await chooseCompany({ cliContext, query, token, yes: yes || json });
    const brand = await fetchBrand(match.domain, token);
    if (brand === undefined) {
        return cliContext.failAndThrow(`Couldn't load ${match.name}'s logo and colors. Try again in a moment.`);
    }
    if (json) {
        cliContext.writeJsonToStdout({ name: brand.name ?? match.name, domain: match.domain, ...brand });
        return;
    }

    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null || !(await doesPathExist(join(fernDirectory, RelativeFilePath.of("docs.yml"))))) {
        return cliContext.failAndThrow(
            "There's no fern/docs.yml here. Create a docs site first with `fern init --docs`, or pass --json to just look up the brand."
        );
    }
    const files = await downloadBrandFiles(brand);
    const applied = await applyBrandToDocsSite({ fernDir: fernDirectory, brand, files });
    if (applied.settings.length === 0) {
        cliContext.logger.info(`${match.name} has no logo or colors to apply.`);
        return;
    }
    cliContext.logger.info(`Applied ${match.name}'s ${list(applied.settings)} to fern/docs.yml.`);
    for (const file of applied.written) {
        cliContext.logger.info(`  wrote ${file}`);
    }
}

/** The company the query names: the exact match, or the user's pick when several fit. */
async function chooseCompany({
    cliContext,
    query,
    token,
    yes
}: {
    cliContext: CliContext;
    query: string;
    token: string;
    yes: boolean;
}): Promise<BrandSearchResult> {
    let results: BrandSearchResult[];
    try {
        results = await searchBrands(query, token);
    } catch (error) {
        if (error instanceof BrandLookupUnauthorizedError) {
            return cliContext.failAndThrow("Your Fern login has expired. Run `fern login`, then try again.");
        }
        throw error;
    }
    const [first] = results;
    if (first === undefined) {
        return cliContext.failAndThrow(`No company found for "${query}". Try its website, like stripe.com.`);
    }
    const exact = confidentMatch(query, results) ?? (results.length === 1 ? first : undefined);
    if (exact !== undefined && (yes || !cliContext.isInteractive)) {
        return exact;
    }
    if (yes || !cliContext.isInteractive) {
        return cliContext.failAndThrow(
            `Several companies match "${query}" (${results
                .slice(0, 5)
                .map((result) => result.domain)
                .join(", ")}). Pass the website you mean, like ${first.domain}.`
        );
    }
    return cliContext.selectPrompt({
        message: "Which company is this for?",
        choices: results.map((result) => ({ name: `${result.name} (${result.domain})`, value: result })),
        default: exact
    });
}

function list(items: string[]): string {
    return items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}
