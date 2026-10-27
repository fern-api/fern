import {
    getClaimSecret,
    readStoredGuestSession,
    removeStoredGuestSession,
    type StoredGuestSession
} from "@fern-api/auth";
import {
    FERN_DIRECTORY,
    getFernDirectory,
    loadProjectConfig,
    PROJECT_CONFIG_FILENAME
} from "@fern-api/configuration-loader";
import { createVenusService } from "@fern-api/core";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import { produce } from "immer";

import { CliContext } from "../../cli-context/CliContext.js";
import { ensureFinalNewline } from "../../utils/ensureFinalNewline.js";

export interface ClaimRequest {
    token: string;
    sessionId: string;
    claimSecret: string;
    organizationId: string | undefined;
}

export type ClaimResult =
    | { ok: true; organizationId: string; nextSteps: string[] }
    | { ok: false; statusCode: number | undefined; message: string | undefined };

export type Claim = (request: ClaimRequest) => Promise<ClaimResult>;

/**
 * `fern claim [--org]`: claims the guest session recorded in this repo with the signed-in user, points
 * fern.config.json at the organization that now owns the work, and forgets the session.
 */
export async function claimGuestSession({
    cliContext,
    organization,
    absolutePathToFernDirectory,
    claim = claimWithVenus
}: {
    cliContext: CliContext;
    organization: string | undefined;
    absolutePathToFernDirectory?: AbsoluteFilePath;
    claim?: Claim;
}): Promise<void> {
    const fernDirectory = absolutePathToFernDirectory ?? (await getFernDirectory());
    if (fernDirectory == null) {
        return cliContext.failAndThrow(`Directory "${FERN_DIRECTORY}" not found.`, undefined, {
            code: CliError.Code.ConfigError
        });
    }

    const stored = await readStoredGuestSession({ absolutePathToFernDirectory: fernDirectory });
    if (stored == null) {
        return cliContext.failAndThrow(
            "No guest session is recorded for this repo. Run `fern generate --guest` first, then claim it.",
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    const claimSecret = getClaimSecret(stored.claimUrl);
    if (claimSecret == null) {
        return cliContext.failAndThrow(
            `The recorded guest session has no claim secret. Open ${stored.claimUrl} in a browser to claim it.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }

    const token = await cliContext.runTask((context) => askToLogin(context));
    if (token.type !== "user") {
        return cliContext.failAndThrow(
            "Claiming needs a signed-in user. Unset the FERN_TOKEN environment variable and run `fern login`, then retry `fern claim`.",
            undefined,
            { code: CliError.Code.AuthError }
        );
    }

    const result = await cliContext.runTask(() =>
        claim({ token: token.value, sessionId: stored.sessionId, claimSecret, organizationId: organization })
    );
    if (!result.ok) {
        return cliContext.failAndThrow(describeClaimFailure(result, stored, organization), undefined, {
            code:
                result.statusCode === 401 || result.statusCode === 403
                    ? CliError.Code.AuthError
                    : CliError.Code.NetworkError
        });
    }

    const projectConfig = await cliContext.runTask((context) =>
        loadProjectConfig({ directory: fernDirectory, context })
    );
    if (projectConfig.rawConfig.organization !== result.organizationId) {
        const updated = produce(projectConfig.rawConfig, (draft) => {
            draft.organization = result.organizationId;
        });
        await writeFile(projectConfig._absolutePath, ensureFinalNewline(JSON.stringify(updated, undefined, 2)));
        cliContext.logger.info(
            `Updated ${PROJECT_CONFIG_FILENAME}: organization is now ${chalk.bold(result.organizationId)}.`
        );
    }
    await removeStoredGuestSession({ sessionId: stored.sessionId, absolutePathToFernDirectory: fernDirectory });

    cliContext.logger.info(
        `Claimed guest session ${chalk.bold(stored.sessionId)} into organization ${chalk.bold(result.organizationId)}. Its guest token no longer works; run \`fern login\` or set FERN_TOKEN to keep generating.`
    );
    for (const step of result.nextSteps) {
        cliContext.logger.info(`  - ${step}`);
    }
}

async function claimWithVenus({ token, sessionId, claimSecret, organizationId }: ClaimRequest): Promise<ClaimResult> {
    const response = await createVenusService({ token }).guestSession.claim(
        { sessionId, organizationId },
        { headers: { "X-Fern-Claim-Secret": claimSecret } }
    );
    if (response.ok) {
        return { ok: true, organizationId: response.body.organizationId, nextSteps: response.body.nextSteps ?? [] };
    }
    const error = response.error as { statusCode?: number; content?: unknown };
    return { ok: false, statusCode: error.statusCode, message: readSuggestedFix(error.content) };
}

function describeClaimFailure(
    result: Extract<ClaimResult, { ok: false }>,
    stored: StoredGuestSession,
    organization: string | undefined
): string {
    const suffix = result.message != null ? ` ${result.message}` : "";
    switch (result.statusCode) {
        case 401:
            return `Venus rejected your login while claiming guest session ${stored.sessionId}. Run \`fern login\` and retry.${suffix}`;
        case 403:
            return organization != null
                ? `You are not an admin of organization "${organization}", so the guest session cannot be moved there.${suffix}`
                : `Venus refused to claim guest session ${stored.sessionId}.${suffix}`;
        case 404:
            return `Venus has no guest session ${stored.sessionId} for this claim secret. It may have been deleted; run \`fern generate --guest\` to start a new one.${suffix}`;
        case 410:
            return `Guest session ${stored.sessionId} has nothing left to claim (expired, taken down or already claimed). Run \`fern generate --guest\` to start a new one.${suffix}`;
        default:
            return `Failed to claim guest session ${stored.sessionId}${result.statusCode != null ? ` (status ${result.statusCode})` : ""}.${suffix}`;
    }
}

function readSuggestedFix(body: unknown): string | undefined {
    if (typeof body !== "object" || body == null) {
        return undefined;
    }
    const record = body as Record<string, unknown>;
    const content =
        typeof record.content === "object" && record.content != null
            ? (record.content as Record<string, unknown>)
            : record;
    return typeof content.suggestedFix === "string" ? content.suggestedFix : undefined;
}
