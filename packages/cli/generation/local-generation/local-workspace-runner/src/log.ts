/* eslint-disable no-console */

/**
 * Centralized logging utility for local-workspace-runner.
 * This wrapper allows console usage in one place while keeping other files clean.
 */

export function info(...args: unknown[]): void {
    // biome-ignore lint/suspicious/noConsole: This is a centralized logging utility
    console.log(...args);
}

export function error(...args: unknown[]): void {
    // biome-ignore lint/suspicious/noConsole: This is a centralized logging utility
    console.error(...args);
}

export function warn(...args: unknown[]): void {
    // biome-ignore lint/suspicious/noConsole: This is a centralized logging utility
    console.warn(...args);
}

export function debug(...args: unknown[]): void {
    if (process.env.DEBUG) {
        // biome-ignore lint/suspicious/noConsole: This is a centralized logging utility
        console.log("[DEBUG]", ...args);
    }
}
