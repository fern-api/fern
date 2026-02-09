import { schemas } from "@fern-api/config";
import jwt from "jsonwebtoken";

import { FernRcAccountManager, FernRcSchemaLoader, LegacyTokenMigrator } from "../config/fern-rc/index.js";
import { KeyringStore } from "./KeyringStore.js";

export namespace TokenService {
    /**
     * Information about a JWT token.
     */
    export interface TokenInfo {
        /** The JWT token string */
        token: string;
        /** Email or username extracted from token */
        email: string | undefined;
        /** User ID (sub claim) from token */
        userId: string | undefined;
        /** When the token expires (or undefined if cannot be determined) */
        expiresAt: Date | undefined;
        /** Human-readable expiry text (e.g., "in 29 days", "expired") */
        expiresIn: string;
        /** Whether the token has expired */
        isExpired: boolean;
    }

    /**
     * Information about an account, including token details.
     */
    export interface AccountInfo extends schemas.FernRcAccountSchema {
        /** Whether this is the active account */
        isActive: boolean;
        /** Token info if available */
        tokenInfo?: TokenInfo;
    }

    /**
     * Result of a login operation.
     */
    export interface LoginResult {
        /** Whether this is a new account (vs updating an existing one) */
        isNew: boolean;
        /** Total number of accounts after the operation */
        totalAccounts: number;
    }

    /**
     * Result of a logout operation.
     */
    export interface LogoutResult {
        /** Whether an account was removed */
        removed: boolean;
        /** The new active account (if any) after logout */
        newActive: string | undefined;
    }
}

/**
 * High-level service for managing authentication tokens.
 *
 * Automatically handles migration of legacy tokens on first use.
 */
export class TokenService {
    private readonly keyring: KeyringStore;
    private readonly accountManager: FernRcAccountManager;
    private readonly migrator: LegacyTokenMigrator;

    // Tracks whether or not we've already performed the migration.
    private migrationPromise: Promise<void> | null = null;

    constructor({ keyring }: { keyring: KeyringStore }) {
        this.keyring = keyring;

        const loader = new FernRcSchemaLoader();
        this.accountManager = new FernRcAccountManager({ loader });
        this.migrator = new LegacyTokenMigrator({ loader });
    }

    /**
     * Adds a new account with its token.
     */
    public async login(account: string, token: string): Promise<TokenService.LoginResult> {
        await this.ensureMigrated();
        await this.keyring.store(account, token);
        return this.accountManager.addAccount({ user: account });
    }

    /**
     * Removes an account and its token.
     */
    public async logout(account: string): Promise<TokenService.LogoutResult> {
        await this.ensureMigrated();
        await this.keyring.remove(account);
        return this.accountManager.removeAccount(account);
    }

    /**
     * Removes all accounts and their tokens.
     */
    public async logoutAll(): Promise<number> {
        await this.ensureMigrated();
        const { accounts } = await this.accountManager.getAllAccounts();
        for (const account of accounts) {
            await this.keyring.remove(account.user);
        }
        return this.accountManager.removeAllAccounts();
    }

    /**
     * Gets the token for the active account.
     */
    public async getActiveToken(): Promise<string | undefined> {
        await this.ensureMigrated();
        const account = await this.accountManager.getActiveAccount();
        if (account == null) {
            return undefined;
        }
        return this.keyring.get(account.user);
    }

    /**
     * Gets the token for a specific account.
     */
    public async getToken(account: string): Promise<string | undefined> {
        await this.ensureMigrated();
        const accountInfo = await this.accountManager.getAccount(account);
        if (accountInfo == null) {
            return undefined;
        }
        return this.keyring.get(account);
    }

    /**
     * Gets detailed token info for the active account.
     */
    public async getActiveTokenInfo(): Promise<TokenService.TokenInfo | undefined> {
        const token = await this.getActiveToken();
        if (token == null) {
            return undefined;
        }
        return this.parseTokenInfo(token);
    }

    /**
     * Gets detailed info about all accounts.
     */
    public async getAllAccountInfo(): Promise<TokenService.AccountInfo[]> {
        await this.ensureMigrated();

        const result: TokenService.AccountInfo[] = [];

        const { accounts, active } = await this.accountManager.getAllAccounts();
        for (const account of accounts) {
            const token = await this.keyring.get(account.user);
            const tokenInfo = token != null ? this.parseTokenInfo(token) : undefined;

            result.push({
                ...account,
                isActive: account.user === active,
                tokenInfo
            });
        }

        return result;
    }

    /**
     * Gets info about the active account.
     */
    public async getActiveAccountInfo(): Promise<TokenService.AccountInfo | undefined> {
        await this.ensureMigrated();

        const account = await this.accountManager.getActiveAccount();
        if (account == null) {
            return undefined;
        }

        const token = await this.keyring.get(account.user);
        const tokenInfo = token != null ? this.parseTokenInfo(token) : undefined;

        return {
            ...account,
            isActive: true,
            tokenInfo
        };
    }

    /**
     * Switches the active account.
     */
    public async switchAccount(account: string): Promise<boolean> {
        await this.ensureMigrated();
        return this.accountManager.setActiveAccount(account);
    }

    private parseTokenInfo(token: string): TokenService.TokenInfo {
        try {
            const decoded = jwt.decode(token, { complete: true });
            if (decoded == null || typeof decoded.payload === "string") {
                return {
                    token,
                    email: undefined,
                    userId: undefined,
                    expiresAt: undefined,
                    isExpired: false,
                    expiresIn: this.formatExpiry(undefined)
                };
            }

            const payload = decoded.payload as Record<string, unknown>;

            let email: string | undefined;
            if (typeof payload.email === "string") {
                email = payload.email;
            }

            let expiresAt: Date | undefined;
            let isExpired = false;
            if (typeof payload.exp === "number") {
                expiresAt = new Date(payload.exp * 1000);
                isExpired = expiresAt.getTime() < Date.now();
            }

            const userId = typeof payload.sub === "string" ? payload.sub : undefined;

            return {
                token,
                email,
                userId,
                expiresAt,
                isExpired,
                expiresIn: this.formatExpiry(expiresAt)
            };
        } catch {
            return {
                token,
                email: undefined,
                userId: undefined,
                expiresAt: undefined,
                isExpired: false,
                expiresIn: this.formatExpiry(undefined)
            };
        }
    }

    /**
     * Formats the time until expiration in a human-readable format.
     */
    private formatExpiry(expiresAt: Date | undefined): string {
        if (expiresAt == null) {
            return "unknown";
        }

        const now = Date.now();
        const expiry = expiresAt.getTime();

        if (expiry < now) {
            return "expired";
        }

        const diffMs = expiry - now;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            return `in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
        }
        if (diffHours > 0) {
            return `in ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
        }
        if (diffMinutes > 0) {
            return `in ${diffMinutes} minute${diffMinutes === 1 ? "" : "s"}`;
        }
        return "soon";
    }

    /**
     * Ensures legacy tokens are migrated. Called automatically before any operation.
     */
    private async ensureMigrated(): Promise<void> {
        if (this.migrationPromise == null) {
            this.migrationPromise = this.performMigration();
        }
        return this.migrationPromise;
    }

    private async performMigration(): Promise<void> {
        const result = await this.migrator.migrate();
        if (result.migrated && result.token != null && result.user != null) {
            await this.keyring.store(result.user, result.token);
        }

        // TODO: Before we go live with the new CLI, we should
        // delete the legacy token file after the migration.
    }
}
