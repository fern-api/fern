import { FernGuestToken, getOrCreateGuestSession, getToken } from "@fern-api/auth";
import { dirname } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { CliError } from "@fern-api/task-context";
import chalk from "chalk";

import { CliContext } from "../../cli-context/CliContext.js";

/**
 * `--guest`: swap the project's organization for the guest session's `guest-<id>` org for this run and return the
 * guest token to generate with. fern.config.json is left untouched; `fern claim` rewrites it later.
 */
/** Warn this close to expiry. The session is still reused until it expires: a new one is a new guest org. */
const EXPIRY_WARNING_MS = 60 * 60 * 1000;

export async function resolveGuestProject({
    project,
    cliContext,
    newSession = false,
    now = new Date()
}: {
    project: Project;
    cliContext: CliContext;
    /** `--new-session`: ignore the stored session and mint another one. */
    newSession?: boolean;
    now?: Date;
}): Promise<{ project: Project; token: FernGuestToken }> {
    const existingToken = await getToken();
    if (existingToken != null) {
        cliContext.failAndThrow(
            existingToken.type === "organization"
                ? "--guest cannot be combined with FERN_TOKEN. Unset it to continue as a guest, or drop --guest to use the token."
                : "--guest cannot be combined with a saved login. Run 'fern logout' to continue as a guest, or drop --guest to use your account.",
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }

    const { token, reused } = await cliContext.runTask((context) =>
        getOrCreateGuestSession({
            absolutePathToFernDirectory: dirname(project.config._absolutePath),
            cliVersion: cliContext.environment.packageVersion,
            context,
            forceNew: newSession
        })
    );

    const verb = reused ? "Reusing" : newSession ? "Started a new (--new-session)" : "Started";
    cliContext.logger.info(
        `${verb} guest session ${chalk.bold(token.sessionId)} as organization ${chalk.bold(token.organizationId)} (expires ${token.expiresAt.toLocaleString()}).`
    );
    cliContext.logger.info(`Claim it to keep this work: ${chalk.cyan(token.claimUrl)}`);
    const msLeft = token.expiresAt.getTime() - now.getTime();
    if (msLeft < EXPIRY_WARNING_MS) {
        cliContext.logger.warn(
            `This guest session expires in ${formatMinutes(msLeft)}. Claim it now (fern claim, or the link above) to keep this work; a run that crosses the deadline fails.`
        );
    }
    if (project.config.organization !== token.organizationId) {
        cliContext.logger.warn(
            `Ignoring organization "${project.config.organization}" from fern.config.json while running as a guest.`
        );
    }

    return {
        token,
        project: { ...project, config: { ...project.config, organization: token.organizationId } }
    };
}

function formatMinutes(ms: number): string {
    const minutes = Math.max(1, Math.ceil(ms / 60_000));
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
