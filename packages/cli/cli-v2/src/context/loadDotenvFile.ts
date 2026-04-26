import chalk from "chalk";
import { config as dotenvConfig } from "dotenv";
import fs from "fs";
import path from "path";

/**
 * Loads environment variables from a .env file into process.env.
 *
 * Only loads when the user explicitly passes --env <path>. There is no
 * auto-discovery from the current working directory — silently loading an
 * untrusted CWD .env could allow workspace-poisoning attacks where a
 * malicious repo injects variables like FERN_FDR_ORIGIN to redirect API
 * traffic and exfiltrate auth tokens.
 *
 * Existing env vars (set in the shell) are never overwritten (override: false).
 * Values are never logged — only key names are shown, with <SET> as a placeholder.
 */
export function loadDotenvFile(envFilePath: string | undefined, logDebug?: (msg: string) => void): void {
    if (envFilePath == null) {
        return;
    }

    const resolved = path.resolve(process.cwd(), envFilePath);
    if (!fs.existsSync(resolved)) {
        process.stderr.write(`${chalk.yellow("warn")} .env file not found: ${resolved}\n`);
        return;
    }

    const result = dotenvConfig({ path: resolved, override: false });

    if (logDebug != null && result.parsed != null) {
        for (const key of Object.keys(result.parsed)) {
            // Never log values — use **** so the user knows a key was loaded
            // without revealing the value or its length.
            logDebug(`Loaded from --env: ${key}=****`);
        }
    }
}
