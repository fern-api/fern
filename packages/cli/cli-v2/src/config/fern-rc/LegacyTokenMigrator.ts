import { getPathToTokenFile } from "@fern-api/auth";
import { FernRcSchema, schemas } from "@fern-api/config";
import { createVenusService } from "@fern-api/core";
import { doesPathExist } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";

import { FernRcSchemaLoader } from "./FernRcSchemaLoader.js";

// Legacy access tokens do not contain an email address in the JWT claims.
// We attempt to fetch the user's email via the Venus API, but fall back
// to 'default' if the API call fails (e.g., token expired, network issues).
const DEFAULT_USER = "default";

export namespace LegacyTokenMigrator {
    export interface Result {
        /** Whether a migration was performed */
        migrated: boolean;
        /** The user identifier for the migrated account (for storing in keyring) */
        user?: string;
        /** The token value that was migrated (for storing in keyring) */
        token?: string;
    }
}

/**
 * Migrates the legacy ~/.fern/token file to the new ~/.fernrc + keyring format.
 *
 * For now, the legacy ~/.fern/token file is NOT deleted so that users can continue
 * using the original CLI commands alongside the new ones.
 */
export class LegacyTokenMigrator {
    private readonly loader: FernRcSchemaLoader;

    constructor({ loader }: { loader: FernRcSchemaLoader }) {
        this.loader = loader;
    }

    /**
     * Performs the migration from ~/.fern/token to ~/.fernrc + keyring.
     */
    public async migrate(): Promise<LegacyTokenMigrator.Result> {
        const legacyPath = getPathToTokenFile();
        if (!(await doesPathExist(legacyPath))) {
            return { migrated: false };
        }

        const { data: config } = await this.loader.load();
        if (config.auth.accounts.length > 0) {
            // If we already have accounts, we don't need to migrate.
            return { migrated: false };
        }

        const tokenContent = (await readFile(legacyPath, "utf-8")).trim();
        if (tokenContent.length === 0) {
            return { migrated: false };
        }

        // Attempt to fetch the user's email from the Venus API.
        const user = await this.fetchUserEmail(tokenContent);

        const account: schemas.FernRcAccountSchema = { user };
        const updatedConfig: FernRcSchema = {
            ...config,
            auth: {
                ...config.auth,
                active: user,
                accounts: [...config.auth.accounts, account]
            }
        };

        await this.loader.save(updatedConfig);

        return { migrated: true, user, token: tokenContent };
    }

    /**
     * Fetches the user's email from the Venus API using the access token.
     * Returns DEFAULT_USER if the API call fails.
     */
    private async fetchUserEmail(token: string): Promise<string> {
        try {
            const venus = createVenusService({ token });
            const response = await venus.user.getMyself();
            if (response.ok && response.body.email != null) {
                return response.body.email;
            }
            return DEFAULT_USER;
        } catch {
            return DEFAULT_USER;
        }
    }
}
