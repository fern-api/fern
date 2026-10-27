import { getCurrentUser, getToken, isGuestSessionLive, readStoredGuestSession } from "@fern-api/auth";
import { getFernDirectory } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import chalk from "chalk";

import { CliContext } from "../../cli-context/CliContext.js";

export interface WhoamiReport {
    login:
        | { kind: "none" }
        | { kind: "organization-token" }
        | { kind: "user"; userId: string; username: string; email: string | undefined };
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
        process.stdout.write(`${JSON.stringify(report, undefined, 2)}\n`);
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
        const user = await cliContext.runTask((context) => getCurrentUser({ token, context }));
        login = { kind: "user", userId: user.userId, username: user.username, email: user.email ?? undefined };
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
                      live: isGuestSessionLive(stored),
                      venusOrigin: stored.venusOrigin
                  }
                : undefined
    };
}

export function formatWhoamiReport(report: WhoamiReport): string[] {
    const lines: string[] = [];
    switch (report.login.kind) {
        case "user":
            lines.push(
                `Logged in as ${chalk.bold(report.login.email ?? report.login.username)} (${report.login.userId}).`
            );
            break;
        case "organization-token":
            lines.push("Using an organization token from the FERN_TOKEN environment variable.");
            break;
        case "none":
            lines.push("Not logged in. Run `fern login`, set FERN_TOKEN, or use `fern generate --guest`.");
            break;
    }
    const guest = report.guestSession;
    if (guest != null) {
        const expires = new Date(guest.expiresAt).toLocaleString();
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
