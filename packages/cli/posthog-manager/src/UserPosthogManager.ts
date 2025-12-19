import { FernUserToken, getUserIdFromToken } from "@fern-api/auth";
import { createVenusService } from "@fern-api/core";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { PosthogEvent } from "@fern-api/task-context";
import { mkdir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { dirname } from "path";
import { PostHog } from "posthog-node";
import { v4 as uuidv4 } from "uuid";

import { PosthogManager } from "./PosthogManager";

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
        const userEmail = await this.getUserEmail();
        this.posthog.capture({
            distinctId: this.userId ?? (await this.getPersistedDistinctId()),
            event: "CLI",
            properties: {
                version: process.env.CLI_VERSION,
                orgId: event.orgId,
                command: event.command,
                ...event.properties,
                usingAccessToken: false,
                ...(userEmail != null ? { userEmail } : {})
            }
        });
    }

    public async flush(): Promise<void> {
        await this.posthog.flush();
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
