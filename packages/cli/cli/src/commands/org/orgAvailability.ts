import { assertNever } from "@fern-api/core-utils";
import { type Availability, createAvailabilityChecker, isValidName, suggestNames } from "@fern-api/wizard";

import { CliContext } from "../../cli-context/CliContext.js";
import { requireFernLogin } from "../../utils/requireFernLogin.js";

export interface OrganizationReport {
    organization: string;
    status: Availability;
    /** Free alternatives, when another team owns the name. */
    suggestions: string[];
}

/** `fern org check <name>`: whether a Fern organization name is yours, free, or another team's. */
export async function checkOrganization({
    cliContext,
    name,
    json
}: {
    cliContext: CliContext;
    name: string;
    json: boolean;
}): Promise<void> {
    assertValidName(cliContext, name);
    const checker = createAvailabilityChecker(await requireFernLogin(cliContext));
    const status = await checker.organization(name);
    const report: OrganizationReport = {
        organization: name,
        status,
        suggestions:
            status === "taken"
                ? await suggestNames({ base: name, check: (candidate) => checker.organization(candidate) })
                : []
    };
    if (json) {
        cliContext.writeJsonToStdout(report);
        return;
    }
    cliContext.logger.info(describeOrganization(report));
}

/** `fern org create <name>`: creates the organization, with the user as its first member. */
export async function createOrganization({
    cliContext,
    name,
    json
}: {
    cliContext: CliContext;
    name: string;
    json: boolean;
}): Promise<void> {
    assertValidName(cliContext, name);
    const checker = createAvailabilityChecker(await requireFernLogin(cliContext));
    const result = await checker.claimOrganization(name);
    switch (result) {
        case "created":
        case "mine":
            if (json) {
                cliContext.writeJsonToStdout({ organization: name, created: result === "created" });
                return;
            }
            cliContext.logger.info(
                result === "created" ? `Created the Fern organization ${name}.` : `You already belong to ${name}.`
            );
            return;
        case "taken": {
            const suggestions = await suggestNames({
                base: name,
                check: (candidate) => checker.organization(candidate)
            });
            cliContext.failAndThrow(
                `${name} belongs to another team.${suggestions.length === 0 ? "" : ` Free names: ${suggestions.join(", ")}`}`
            );
            return;
        }
        case "unknown":
            cliContext.failAndThrow(`Couldn't create ${name} right now. Try again in a moment.`);
            return;
        default:
            assertNever(result);
    }
}

export function describeOrganization(report: OrganizationReport): string {
    switch (report.status) {
        case "mine":
            return `You belong to ${report.organization}.`;
        case "available":
            return `${report.organization} is free. Create it with \`fern org create ${report.organization}\`.`;
        case "taken":
            return report.suggestions.length === 0
                ? `${report.organization} belongs to another team.`
                : `${report.organization} belongs to another team. Free names: ${report.suggestions.join(", ")}`;
        case "unknown":
            return `Couldn't check ${report.organization} right now. Try again in a moment.`;
        default:
            assertNever(report.status);
    }
}

function assertValidName(cliContext: CliContext, name: string): void {
    if (!isValidName(name)) {
        cliContext.failAndThrow(
            `"${name}" isn't a valid organization name. Use lowercase letters, numbers, and hyphens (not at the start or end).`
        );
    }
}
