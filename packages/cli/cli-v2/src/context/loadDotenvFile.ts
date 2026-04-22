import chalk from "chalk";
import { config as dotenvConfig } from "dotenv";
import fs from "fs";
import path from "path";

/**
 * Loads environment variables from a .env file into process.env.
 *
 * Behavior:
 * - If `envFilePath` is provided (via --env flag): load that file, warn if it doesn't exist.
 * - Otherwise: silently try to load `.env` from the current working directory.
 * - Existing env vars (set in the shell) are never overwritten (override: false).
 */
export function loadDotenvFile(envFilePath: string | undefined): void {
    if (envFilePath != null) {
        const resolved = path.resolve(process.cwd(), envFilePath);
        if (!fs.existsSync(resolved)) {
            process.stderr.write(`${chalk.yellow("warn")} .env file not found: ${resolved}\n`);
            return;
        }
        dotenvConfig({ path: resolved, override: false });
        return;
    }

    // Auto-discover .env in cwd — silent if not present.
    const defaultEnvFile = path.join(process.cwd(), ".env");
    if (fs.existsSync(defaultEnvFile)) {
        dotenvConfig({ path: defaultEnvFile, override: false });
    }
}
