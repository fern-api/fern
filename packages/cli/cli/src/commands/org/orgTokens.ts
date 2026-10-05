import { createVenusService } from "@fern-api/core";
import { askToLogin } from "@fern-api/login";
import { CliError, TaskContext } from "@fern-api/task-context";
import chalk from "chalk";

import { CliContext } from "../../cli-context/CliContext.js";
import { resolveOrgId } from "./orgConfig.js";

export interface OrgTokenRow {
    tokenId: string;
    status: string;
    createdTime: string;
    description: string | null;
}

/**
 * API key management requires a user token: an organization token cannot list,
 * create, or revoke the org's other keys.
 */
async function getUserToken(context: TaskContext): Promise<string> {
    const token = await askToLogin(context);
    if (token.type === "organization") {
        return context.failAndThrow(
            "Organization tokens cannot manage API keys. Unset the FERN_TOKEN environment variable and run 'fern login' to manage them.",
            undefined,
            { code: CliError.Code.AuthError }
        );
    }
    return token.value;
}

function failForStatus(context: TaskContext, status: number, subject: string): never {
    if (status === 401 || status === 403) {
        return context.failAndThrow(`You do not have access to ${subject}.`, undefined, {
            code: CliError.Code.AuthError
        });
    }
    if (status === 404) {
        return context.failAndThrow(`${subject} was not found.`, undefined, { code: CliError.Code.UserError });
    }
    return context.failAndThrow(
        `Failed to reach Venus (HTTP ${status}). Please contact support@buildwithfern.com for assistance.`,
        undefined,
        { code: CliError.Code.InternalError }
    );
}

async function lookupAuth0OrgId(
    context: TaskContext,
    venus: ReturnType<typeof createVenusService>,
    orgName: string
): Promise<string> {
    const orgLookup = await venus.organization.get({ orgId: orgName });
    if (!orgLookup.ok) {
        failForStatus(context, orgLookup.rawResponse.status, `Organization "${orgName}"`);
    }
    return orgLookup.body.auth0Id;
}

/**
 * Escape a CSV cell: quote cells containing commas/quotes/newlines (RFC 4180),
 * render newlines as escape sequences so rows stay on one line, and prefix a
 * leading `'` on text a spreadsheet would read as a formula. Signed numbers
 * (`-12`, `+4.5%`) are left alone since a spreadsheet reads them as values.
 */
function escapeCsvCell(value: string | null | undefined): string {
    if (value == null) {
        return "";
    }
    const raw = /^[=+\-@\t\r]/.test(value) && !/^[+-](?:\d+(?:[.,]\d+)*%?)?$/.test(value) ? `'${value}` : value;
    const normalized = raw.replace(/\r/g, "\\r").replace(/\n/g, "\\n");
    if (normalized.includes('"') || normalized.includes(",")) {
        return `"${normalized.replace(/"/g, '""')}"`;
    }
    return normalized;
}

/**
 * The same columns as the dashboard's API Keys CSV export, plus Status since
 * the CLI lists revoked and expired keys too (the dashboard hides them).
 * The secret key value is never exportable — Venus only returns it once at
 * creation — so the export carries metadata only.
 */
export function buildOrgTokensCsv(tokens: OrgTokenRow[]): string {
    const headers = ["Name", "Token ID", "Status", "Created at"];
    const rows = tokens.map((t) => [t.description ?? "", t.tokenId, t.status, t.createdTime]);
    return [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

export async function listOrgTokens({
    cliContext,
    org,
    json,
    csv
}: {
    cliContext: CliContext;
    org?: string;
    json?: boolean;
    csv?: boolean;
}): Promise<void> {
    const orgName = await resolveOrgId(cliContext, org);

    await cliContext.runTask(async (context) => {
        const token = await getUserToken(context);
        const venus = createVenusService({ token });
        const auth0OrgId = await lookupAuth0OrgId(context, venus, orgName);

        const response = await venus.apiKeys.getTokensForOrganization({ organizationId: auth0OrgId });
        if (!response.ok) {
            return failForStatus(context, response.rawResponse.status, `Organization "${orgName}"`);
        }

        const tokens: OrgTokenRow[] = response.body.map((t) => ({
            tokenId: t.tokenId,
            status: t.status.type,
            createdTime: t.createdTime.toISOString(),
            description: t.description ?? null
        }));

        if (json) {
            process.stdout.write(JSON.stringify(tokens, null, 2) + "\n");
            return;
        }
        if (csv) {
            process.stdout.write(buildOrgTokensCsv(tokens) + "\n");
            return;
        }
        if (tokens.length === 0) {
            context.logger.info(`No API keys found for organization "${orgName}".`);
            context.logger.info(`  To create one, run: fern org token create --org ${orgName}`);
            return;
        }
        for (const t of tokens) {
            const status =
                t.status === "active"
                    ? chalk.green(t.status)
                    : t.status === "revoked"
                      ? chalk.red(t.status)
                      : chalk.dim(t.status);
            const description = t.description != null ? `  ${chalk.dim(t.description)}` : "";
            const created = new Date(t.createdTime).toLocaleDateString();
            context.logger.info(`${t.tokenId}  ${status}  ${chalk.dim(created)}${description}`);
        }
    });
}

export async function createOrgToken({
    cliContext,
    org,
    description,
    json
}: {
    cliContext: CliContext;
    org?: string;
    description?: string;
    json?: boolean;
}): Promise<void> {
    const orgName = await resolveOrgId(cliContext, org);

    await cliContext.runTask(async (context) => {
        const token = await getUserToken(context);
        const venus = createVenusService({ token });
        const auth0OrgId = await lookupAuth0OrgId(context, venus, orgName);

        let name = description;
        if (name == null && process.stdout.isTTY) {
            const answer = await cliContext.getInput({
                message: `Description ${chalk.dim("(optional, press Enter to skip)")}:`
            });
            if (answer.trim().length > 0) {
                name = answer.trim();
            }
        }

        const response = await venus.apiKeys.create({ organizationId: auth0OrgId, description: name });
        if (!response.ok) {
            return failForStatus(context, response.rawResponse.status, `Organization "${orgName}"`);
        }

        if (json) {
            process.stdout.write(
                JSON.stringify({ tokenId: response.body.tokenId, token: response.body.token }, null, 2) + "\n"
            );
            return;
        }
        context.logger.info(chalk.green("Token created successfully."));
        context.logger.info(`  Token ID: ${response.body.tokenId}`);
        context.logger.info("  Save this token now. You won't be able to see it again.");
        // The secret goes to stdout unadorned so it is pipeable.
        process.stdout.write(response.body.token + "\n");
    });
}

export async function revokeOrgToken({
    cliContext,
    tokenId,
    json
}: {
    cliContext: CliContext;
    tokenId: string;
    json?: boolean;
}): Promise<void> {
    await cliContext.runTask(async (context) => {
        const token = await getUserToken(context);
        const venus = createVenusService({ token });

        const response = await venus.apiKeys.revokeTokenById({ tokenId });
        if (!response.ok) {
            return failForStatus(context, response.rawResponse.status, `Token "${tokenId}"`);
        }

        if (json) {
            process.stdout.write(JSON.stringify({ success: true, tokenId }, null, 2) + "\n");
            return;
        }
        context.logger.info(chalk.green(`Token "${tokenId}" has been revoked.`));
    });
}
