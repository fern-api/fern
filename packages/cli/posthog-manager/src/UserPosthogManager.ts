import { mkdir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { dirname } from "path";
import { PostHog } from "posthog-node";
import { v4 as uuidv4 } from "uuid";

import { FernUserToken, getUserIdFromToken } from "@fern-api/auth";
import { AbsoluteFilePath, RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { PosthogEvent } from "@fern-api/task-context";

import { PosthogManager } from "./PosthogManager";

const DISTINCT_ID_FILENAME = "id";
const LOCAL_STORAGE_FOLDER = process.env.LOCAL_STORAGE_FOLDER ?? ".fern";

export class UserPosthogManager implements PosthogManager {
    private posthog: PostHog;
    private userId: string | undefined;

    constructor({ token, posthogApiKey }: { token: FernUserToken | undefined; posthogApiKey: string }) {
        this.posthog = new PostHog(posthogApiKey);
        this.userId = token == null ? undefined : getUserIdFromToken(token);
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
        this.posthog.capture({
            distinctId: this.userId ?? (await this.getPersistedDistinctId()),
            event: "CLI",
            properties: {
                version: process.env.CLI_VERSION,
                ...event,
                ...event.properties
            }
        });
    }

    public async flush(): Promise<void> {
        await this.posthog.flush();
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
