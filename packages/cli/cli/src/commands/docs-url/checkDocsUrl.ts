import { assertNever } from "@fern-api/core-utils";
import { type Availability, createAvailabilityChecker, DOCS_DOMAIN, isValidName, suggestNames } from "@fern-api/wizard";

import { CliContext } from "../../cli-context/CliContext.js";
import { requireFernLogin } from "../../utils/requireFernLogin.js";

export interface DocsUrlReport {
    url: string;
    status: Availability;
    /** Free alternatives, when another team owns the URL. */
    suggestions: string[];
}

/** `fern docs url check <name>`: whether <name>.docs.buildwithfern.com is free to publish to. */
export async function checkDocsUrl({
    cliContext,
    name,
    json
}: {
    cliContext: CliContext;
    name: string;
    json: boolean;
}): Promise<void> {
    const subdomain = toSubdomain(name);
    if (subdomain === undefined) {
        return cliContext.failAndThrow(
            `"${name}" isn't a ${DOCS_DOMAIN} URL. Pass a name like acme, or acme.${DOCS_DOMAIN}; names use lowercase letters, numbers, and hyphens.`
        );
    }
    const checker = createAvailabilityChecker(await requireFernLogin(cliContext));
    const status = await checker.docsUrl(subdomain);
    const suggestions =
        status === "taken"
            ? await suggestNames({ base: subdomain, check: (candidate) => checker.docsUrl(candidate) })
            : [];
    const report: DocsUrlReport = {
        url: `${subdomain}.${DOCS_DOMAIN}`,
        status,
        suggestions: suggestions.map((suggestion) => `${suggestion}.${DOCS_DOMAIN}`)
    };
    if (json) {
        cliContext.writeJsonToStdout(report);
        return;
    }
    cliContext.logger.info(describeDocsUrl(report));
}

export function describeDocsUrl(report: DocsUrlReport): string {
    switch (report.status) {
        case "mine":
            return `${report.url} belongs to your organization, so you can publish to it.`;
        case "available":
            return `${report.url} is free.`;
        case "taken":
            return report.suggestions.length === 0
                ? `${report.url} belongs to another team.`
                : `${report.url} belongs to another team. Free alternatives: ${report.suggestions.join(", ")}`;
        case "unknown":
            return `Couldn't check ${report.url} right now. Try again in a moment.`;
        default:
            assertNever(report.status);
    }
}

/** The docs URL's subdomain, from a bare name or a full URL; undefined when it isn't one. */
export function toSubdomain(name: string): string | undefined {
    const host = name
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/\/.*$/, "");
    const subdomain = host.endsWith(`.${DOCS_DOMAIN}`) ? host.slice(0, -`.${DOCS_DOMAIN}`.length) : host;
    return isValidName(subdomain) ? subdomain : undefined;
}
