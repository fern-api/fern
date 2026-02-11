import { FernRcSchema, schemas } from "@fern-api/config";

import { FernRcSchemaLoader } from "./FernRcSchemaLoader.js";

export namespace FernRcAccountManager {
    export interface AddResult {
        /** Whether this is a new account (vs. update of existing) */
        isNew: boolean;
        /** Total number of accounts after the operation */
        totalAccounts: number;
    }

    export interface RemoveResult {
        /** Whether an account was removed */
        removed: boolean;
        /** The new active account (if any) after removal */
        newActive: string | undefined;
    }

    export interface AllAccountsResult {
        /** List of all accounts */
        accounts: schemas.FernRcAccountSchema[];
        /** The currently active account identifier */
        active: string | undefined;
    }
}

/**
 * Manages account entries in the ~/.fernrc configuration file.
 */
export class FernRcAccountManager {
    private readonly loader: FernRcSchemaLoader;

    constructor({ loader }: { loader: FernRcSchemaLoader }) {
        this.loader = loader;
    }

    /**
     * Adds an account to the ~/.fernrc.
     */
    public async addAccount(account: schemas.FernRcAccountSchema): Promise<FernRcAccountManager.AddResult> {
        const { data: config } = await this.loader.load();
        const existingIndex = config.auth.accounts.findIndex((a) => a.user === account.user);
        const isNew = existingIndex === -1;

        let updatedAccounts: schemas.FernRcAccountSchema[];
        if (isNew) {
            updatedAccounts = [...config.auth.accounts, account];
        } else {
            updatedAccounts = [...config.auth.accounts];
            updatedAccounts[existingIndex] = account;
        }

        const updatedConfig: FernRcSchema = {
            ...config,
            auth: {
                ...config.auth,
                active: account.user,
                accounts: updatedAccounts
            }
        };

        await this.loader.save(updatedConfig);

        return { isNew, totalAccounts: updatedAccounts.length };
    }

    /**
     * Removes an account from the ~/.fernrc.
     *
     * If the removed account was active, switches to the first remaining account.
     */
    public async removeAccount(user: string): Promise<FernRcAccountManager.RemoveResult> {
        const { data: config } = await this.loader.load();
        const initialLength = config.auth.accounts.length;

        const updatedAccounts = config.auth.accounts.filter((a) => a.user !== user);
        const removed = updatedAccounts.length < initialLength;

        // If we removed the active account, switch to the first remaining.
        let newActive = config.auth.active;
        if (removed && config.auth.active === user) {
            newActive = updatedAccounts[0]?.user;
        }

        const updatedConfig: FernRcSchema = {
            ...config,
            auth: {
                active: newActive,
                accounts: updatedAccounts
            }
        };

        await this.loader.save(updatedConfig);

        return { removed, newActive };
    }

    /**
     * Removes all accounts from the ~/.fernrc config.
     */
    public async removeAllAccounts(): Promise<number> {
        const { data: config } = await this.loader.load();
        const count = config.auth.accounts.length;

        const updatedConfig: FernRcSchema = {
            ...config,
            auth: {
                active: undefined,
                accounts: []
            }
        };

        await this.loader.save(updatedConfig);

        return count;
    }

    /**
     * Gets the active account from the ~/.fernrc.
     */
    public async getActiveAccount(): Promise<schemas.FernRcAccountSchema | undefined> {
        const { data: config } = await this.loader.load();
        if (config.auth.active == null) {
            return undefined;
        }
        return config.auth.accounts.find((a) => a.user === config.auth.active);
    }

    /**
     * Gets all accounts from the ~/.fernrc.
     */
    public async getAllAccounts(): Promise<FernRcAccountManager.AllAccountsResult> {
        const { data: config } = await this.loader.load();
        return { accounts: config.auth.accounts, active: config.auth.active };
    }

    /**
     * Gets a specific account by user identifier.
     */
    public async getAccount(user: string): Promise<schemas.FernRcAccountSchema | undefined> {
        const { data: config } = await this.loader.load();
        return config.auth.accounts.find((a) => a.user === user);
    }

    /**
     * Sets the active account.
     */
    public async setActiveAccount(user: string): Promise<boolean> {
        const { data: config } = await this.loader.load();
        const account = config.auth.accounts.find((a) => a.user === user);

        if (account == null) {
            return false;
        }

        const updatedConfig: FernRcSchema = {
            ...config,
            auth: {
                ...config.auth,
                active: user
            }
        };

        await this.loader.save(updatedConfig);

        return true;
    }
}
