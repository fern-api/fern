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
    createdBy: string | null;
    createdByEmail: string | null;
    lastUsedAt: string | null;
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

/**
 * The api-keys endpoints take the org name as `organizationId` (the dashboard
 * calls them the same way). The venus SDK's TokenMetadata type omits
 * `createdBy`/`createdByEmail`/`lastUsedAt`, but they are present in the
 * response (unrecognizedObjectKeys: "passthrough"), so read them defensively.
 */
function readExtraFields(t: object): {
    createdBy: string | null;
    createdByEmail: string | null;
    lastUsedAt: string | null;
} {
    const createdBy = "createdBy" in t && typeof t.createdBy === "string" ? t.createdBy : null;
    const createdByEmail = "createdByEmail" in t && typeof t.createdByEmail === "string" ? t.createdByEmail : null;
    const raw = "lastUsedAt" in t ? t.lastUsedAt : null;
    // Newer SDKs parse it into a Date; older ones pass the ISO string through.
    const lastUsedAt = raw instanceof Date ? raw.toISOString() : typeof raw === "string" ? raw : null;
    return { createdBy, createdByEmail, lastUsedAt };
}

/** The creator's email when Venus could resolve it, else the raw user ID. */
function displayCreator(t: OrgTokenRow): string | null {
    return t.createdByEmail ?? t.createdBy;
}

/**
 * Escape a CSV cell: quote cells containing commas, quotes, or control
 * whitespace per RFC 4180 (embedded newlines/tabs are preserved verbatim), and
 * prefix a leading `'` on text a spreadsheet would read as a formula. Signed
 * numbers (`-12`, `+4.5%`) are left alone since a spreadsheet reads them as
 * values.
 */
function escapeCsvCell(value: string | null | undefined): string {
    if (value == null) {
        return "";
    }
    const raw = /^[=+\-@\t\r]/.test(value) && !/^[+-](?:\d+(?:[.,]\d+)*%?)?$/.test(value) ? `'${value}` : value;
    if (/[",\n\r\t]/.test(raw)) {
        return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
}

/**
 * The same columns as the dashboard's API Keys CSV export, plus Status since
 * the CLI lists revoked and expired keys too (the dashboard hides them).
 * The secret key value is never exportable — Venus only returns it once at
 * creation — so the export carries metadata only.
 */
export function buildOrgTokensCsv(tokens: OrgTokenRow[]): string {
    const headers = ["Name", "Token ID", "Status", "Created by", "Created at", "Last used at"];
    const rows = tokens.map((t) => [
        t.description ?? "",
        t.tokenId,
        t.status,
        displayCreator(t) ?? "",
        t.createdTime,
        t.lastUsedAt ?? ""
    ]);
    return [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

/**
 * Short local-time form (`2026-06-12 14:24`) for the text view. The CSV and
 * JSON outputs keep the ISO 8601 timestamps Venus returns.
 */
export function formatTimestamp(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }
    const two = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())} ${two(date.getHours())}:${two(date.getMinutes())}`;
}

const TABLE_HEADERS = ["Name", "Token ID", "Status", "Created by", "Created at", "Last used at"] as const;

/**
 * The text view of `fern org token list`: the same columns, in the same order,
 * as the CSV export, with a header row so it is clear the first values are
 * token IDs and names, not the secret key (which is only shown at creation).
 * Empty cells get a placeholder so a blank column never reads as missing data.
 */
export function buildOrgTokensTable(tokens: OrgTokenRow[], { color = false }: { color?: boolean } = {}): string[] {
    const singleLine = (value: string) => value.replace(/\s+/g, " ").trim();
    const rows = tokens.map((t) => [
        t.description != null && singleLine(t.description).length > 0 ? singleLine(t.description) : "(no name)",
        t.tokenId,
        t.status,
        displayCreator(t) ?? "-",
        formatTimestamp(t.createdTime),
        t.lastUsedAt != null ? formatTimestamp(t.lastUsedAt) : "never"
    ]);
    const widths = TABLE_HEADERS.map((header, i) => Math.max(header.length, ...rows.map((row) => row[i]?.length ?? 0)));
    const pad = (value: string, i: number) => value.padEnd(widths[i] ?? 0);
    const statusColumn = TABLE_HEADERS.indexOf("Status");

    const header = TABLE_HEADERS.map(pad).join("  ").trimEnd();
    const body = rows.map((row) =>
        row
            .map((cell, i) => {
                const padded = pad(cell, i);
                if (!color) {
                    return padded;
                }
                if (i === statusColumn) {
                    return cell === "active"
                        ? chalk.green(padded)
                        : cell === "revoked"
                          ? chalk.red(padded)
                          : chalk.dim(padded);
                }
                return cell === "(no name)" || cell === "-" || cell === "never" ? chalk.dim(padded) : padded;
            })
            .join("  ")
            .trimEnd()
    );
    return [color ? chalk.bold(header) : header, ...body];
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

        const response = await venus.apiKeys.getTokensForOrganization({ organizationId: orgName });
        if (!response.ok) {
            return failForStatus(context, response.rawResponse.status, `Organization "${orgName}"`);
        }

        const tokens: OrgTokenRow[] = response.body.map((t) => {
            const extra = readExtraFields(t);
            return {
                tokenId: t.tokenId,
                status: t.status.type,
                createdTime: t.createdTime.toISOString(),
                createdBy: extra.createdBy,
                createdByEmail: extra.createdByEmail,
                lastUsedAt: extra.lastUsedAt,
                description: t.description ?? null
            };
        });

        if (json) {
            cliContext.writeJsonToStdout(tokens);
            return;
        }
        if (csv) {
            cliContext.writeTextToStdout(buildOrgTokensCsv(tokens) + "\n");
            return;
        }
        if (tokens.length === 0) {
            context.logger.info(`No API keys found for organization "${orgName}".`);
            context.logger.info(`  To create one, run: fern org token create --org ${orgName}`);
            return;
        }
        for (const line of buildOrgTokensTable(tokens, { color: chalk.level > 0 })) {
            context.logger.info(line);
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

        let name = description;
        if (name == null && process.stdout.isTTY && cliContext.isInteractive) {
            const answer = await cliContext.getInput({
                message: `Description ${chalk.dim("(optional, press Enter to skip)")}:`
            });
            if (answer.trim().length > 0) {
                name = answer.trim();
            }
        }

        const response = await venus.apiKeys.create({ organizationId: orgName, description: name });
        if (!response.ok) {
            return failForStatus(context, response.rawResponse.status, `Organization "${orgName}"`);
        }

        if (json) {
            cliContext.writeJsonToStdout({ tokenId: response.body.tokenId, token: response.body.token });
            return;
        }
        cliContext.stderr.info(chalk.green("Token created successfully."));
        cliContext.stderr.info(`  Token ID: ${response.body.tokenId}`);
        cliContext.stderr.info("  Save this token now. You won't be able to see it again.");
        // The secret alone goes to stdout so it is pipeable.
        cliContext.writeTextToStdout(response.body.token + "\n");
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
            cliContext.writeJsonToStdout({ success: true, tokenId });
            return;
        }
        cliContext.stderr.info(chalk.green(`Token "${tokenId}" has been revoked.`));
    });
}
