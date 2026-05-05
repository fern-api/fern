import { FernUserToken, getUserIdFromToken } from "@fern-api/auth";
import { createVenusService } from "@fern-api/core";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { PosthogEvent } from "@fern-api/task-context";
import { mkdir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { dirname } from "path";
import { PostHog } from "posthog-node";
import { v4 as uuidv4 } from "uuid";

import { PosthogManager } from "./PosthogManager.js";

const DISTINCT_ID_FILENAME = "id";
const LOCAL_STORAGE_FOLDER = process.env.LOCAL_STORAGE_FOLDER ?? ".fern";

export class UserPosthogManager implements PosthogManager {
    private posthog: PostHog;
    private userId: string | undefined;
    private token: FernUserToken | undefined;

    constructor({ token, posthogApiKey }: { token: FernUserToken | undefined; posthogApiKey: string }) {
        this.posthog = new PostHog(posthogApiKey);
        this.userId = token == null ? undefined : getUserIdFromToken(token);
        this.token = token;
    }

    public async identify(): Promise<void> {
        if (this.userId != null) {
            this.posthog.alias({
                distinctId: this.userId,
                alias: await this.getPersistedDistinctId()
            });
        }
    }

    public async sendEvent(event: PosthogEvent): Promise<void> {
        // Resolve email + primary org in parallel — both are venus calls that
        // happen at most once per CLI process (cached after first miss).
        const [userEmail, orgId] = await Promise.all([this.getUserEmail(), this.getPrimaryOrgId()]);
        this.posthog.capture({
            distinctId: this.userId ?? (await this.getPersistedDistinctId()),
            event: "CLI",
            properties: {
                version: process.env.CLI_VERSION,
                ...event,
                ...event.properties,
                usingAccessToken: false,
                ...(userEmail != null ? { userEmail } : {}),
                ...(orgId != null ? { org_id: orgId } : {})
            }
        });
    }

    public async flush(): Promise<void> {
        try {
            await Promise.race([this.posthog.flush(), new Promise<void>((resolve) => setTimeout(resolve, 3000))]);
        } catch {
            // Silently swallow – analytics should never block the CLI
        }
    }

    private userEmail: string | undefined | null;
    private async getUserEmail(): Promise<string | undefined> {
        if (this.userEmail === null) {
            return undefined;
        }
        if (this.userEmail != null) {
            return this.userEmail;
        }
        if (this.token == null) {
            this.userEmail = null;
            return undefined;
        }
        try {
            const response = await createVenusService({ token: this.token.value }).user.getMyself();
            if (response.ok && response.body.email != null) {
                this.userEmail = response.body.email;
                return this.userEmail;
            }
        } catch {
            // Silently fail - email is optional for analytics
        }
        this.userEmail = null;
        return undefined;
    }

    /**
     * Cached primary `OrganizationId` for the current user. `null` is the
     * "tried and gave up" sentinel — distinct from `undefined` (not yet tried)
     * so subsequent `sendEvent` calls don't repeatedly hit venus when the user
     * has no orgs or the call failed.
     *
     * Picks the first org returned by `getOrgIdsFromToken`. Multi-org users
     * appear under their first org for adoption metrics — accurate enough for
     * dashboards, and matches autopilot's distinct-id pattern.
     */
    private orgId: string | undefined | null;
    private async getPrimaryOrgId(): Promise<string | undefined> {
        if (this.orgId === null) {
            return undefined;
        }
        if (this.orgId != null) {
            return this.orgId;
        }
        if (this.token == null) {
            this.orgId = null;
            return undefined;
        }
        try {
            const response = await createVenusService({ token: this.token.value }).organization.getOrgIdsFromToken();
            if (response.ok && response.body.length > 0) {
                const first = response.body[0];
                if (first != null) {
                    this.orgId = first;
                    return this.orgId;
                }
            }
        } catch {
            // Silently fail — org tagging is optional for analytics.
        }
        this.orgId = null;
        return undefined;
    }

    private persistedDistinctId: string | undefined;
    private async getPersistedDistinctId(): Promise<string> {
        if (this.persistedDistinctId == null) {
            const pathToFile = join(
                AbsoluteFilePath.of(homedir()),
                RelativeFilePath.of(LOCAL_STORAGE_FOLDER),
                RelativeFilePath.of(DISTINCT_ID_FILENAME)
            );
            if (!(await doesPathExist(pathToFile))) {
                await mkdir(dirname(pathToFile), { recursive: true });
                await writeFile(pathToFile, uuidv4());
            }
            this.persistedDistinctId = (await readFile(pathToFile)).toString();
        }
        return this.persistedDistinctId;
    }
}
