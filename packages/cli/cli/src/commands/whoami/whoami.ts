import { getToken, isGuestSessionLive, readStoredGuestSession } from "@fern-api/auth";
import { getFernDirectory } from "@fern-api/configuration-loader";
import { createVenusService } from "@fern-api/core";
import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import chalk from "chalk";

import { CliContext } from "../../cli-context/CliContext.js";

export interface WhoamiReport {
    login:
        | { kind: "none" }
        | { kind: "organization-token" }
        | { kind: "user"; userId: string; username: string; email: string | undefined }
        /** A saved login whose Venus lookup failed (expired token, Venus unreachable); the rest of the report still applies. */
        | { kind: "user-unverified"; error: string };
    /** The guest session recorded for this repo, if any. The token itself is never included. */
    guestSession:
        | {
              sessionId: string;
              organizationId: string;
              expiresAt: string;
              claimUrl: string;
              live: boolean;
              venusOrigin: string;
          }
        | undefined;
}

/** `fern whoami [--json]`: who the CLI would act as here — login, FERN_TOKEN and this repo's guest session. */
export async function whoami({
    cliContext,
    json,
    absolutePathToFernDirectory
}: {
    cliContext: CliContext;
    json: boolean;
    absolutePathToFernDirectory?: AbsoluteFilePath;
}): Promise<void> {
    const report = await buildWhoamiReport({ cliContext, absolutePathToFernDirectory });
    if (json) {
        cliContext.writeJsonToStdout(report);
        return;
    }
    for (const line of formatWhoamiReport(report)) {
        cliContext.logger.info(line);
    }
}

export async function buildWhoamiReport({
    cliContext,
    absolutePathToFernDirectory
}: {
    cliContext: CliContext;
    absolutePathToFernDirectory?: AbsoluteFilePath;
}): Promise<WhoamiReport> {
    const token = await getToken();
    let login: WhoamiReport["login"];
    if (token == null) {
        login = { kind: "none" };
    } else if (token.type === "user") {
        login = await lookUpUser(token.value);
    } else {
        login = { kind: "organization-token" };
    }

    const fernDirectory = absolutePathToFernDirectory ?? (await getFernDirectory());
    const stored =
        fernDirectory != null
            ? await readStoredGuestSession({ absolutePathToFernDirectory: fernDirectory })
            : undefined;

    return {
        login,
        guestSession:
            stored != null
                ? {
                      sessionId: stored.sessionId,
                      organizationId: stored.organizationId,
                      expiresAt: stored.expiresAt,
                      claimUrl: stored.claimUrl,
                      // Mirrors getOrCreateGuestSession: a session from another Venus is not reused.
                      live: isGuestSessionLive(stored) && stored.venusOrigin === currentVenusOrigin(),
                      venusOrigin: stored.venusOrigin
                  }
                : undefined
    };
}

// Talks to Venus directly rather than through a task so `--json` never gets log lines on stdout and a failed
// lookup degrades to "unverified" instead of aborting the command.
async function lookUpUser(token: string): Promise<WhoamiReport["login"]> {
    try {
        const response = await createVenusService({ token }).user.getMyself();
        if (!response.ok) {
            return {
                kind: "user-unverified",
                error: `Venus rejected the saved login (${describeVenusError(response.error)}).`
            };
        }
        return {
            kind: "user",
            userId: response.body.userId,
            username: response.body.username,
            email: response.body.email ?? undefined
        };
    } catch (error) {
        return {
            kind: "user-unverified",
            error: `Could not reach Venus: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}

function describeVenusError(error: unknown): string {
    const top = error as { statusCode?: unknown; content?: unknown } | undefined;
    if (typeof top?.statusCode === "number") {
        return `status ${top.statusCode}`;
    }
    const content = top?.content as { statusCode?: unknown; errorMessage?: unknown; reason?: unknown } | undefined;
    if (typeof content?.statusCode === "number") {
        return `status ${content.statusCode}`;
    }
    if (typeof content?.errorMessage === "string") {
        return content.errorMessage;
    }
    if (typeof content?.reason === "string") {
        return content.reason;
    }
    return "unknown error";
}

function currentVenusOrigin(): string {
    return process.env.DEFAULT_VENUS_ORIGIN ?? "https://venus.buildwithfern.com";
}

function formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function formatWhoamiReport(report: WhoamiReport): string[] {
    const lines: string[] = [];
    switch (report.login.kind) {
        case "user":
            lines.push(
                `Logged in as ${chalk.bold(report.login.email ?? report.login.username)} (${report.login.userId}).`
            );
            break;
        case "user-unverified":
            lines.push(
                `Logged in, but the login could not be verified: ${report.login.error} Run \`fern login\` to refresh it.`
            );
            break;
        case "organization-token":
            lines.push("Using an organization token from the FERN_TOKEN environment variable.");
            break;
        case "none":
            lines.push("Not logged in. Run `fern login`, set FERN_TOKEN, or use `fern generate --guest`.");
            break;
        default:
            assertNever(report.login);
    }
    const guest = report.guestSession;
    if (guest != null) {
        const expires = formatDate(guest.expiresAt);
        lines.push(
            guest.live
                ? `Guest session ${chalk.bold(guest.sessionId)} for this repo: organization ${chalk.bold(guest.organizationId)}, expires ${expires}.`
                : `Guest session ${chalk.bold(guest.sessionId)} for this repo expired ${expires}; the next \`fern generate --guest\` starts a new one.`
        );
        if (guest.live) {
            lines.push(`  Claim it: ${chalk.cyan(guest.claimUrl)} (or run \`fern claim\`)`);
        }
    }
    return lines;
}
