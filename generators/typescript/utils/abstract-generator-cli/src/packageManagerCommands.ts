/**
 * Single source of truth for the package-manager command strings used by the
 * TypeScript SDK generator's emitted artifacts (`.github/workflows/ci.yml` and
 * `.fern/verify.sh`). Both files express the same install/build/test contract;
 * keeping the command strings here means a change to one (e.g. switching
 * `pnpm build` to `pnpm run build`) propagates to the other automatically.
 */

export type SupportedPackageManager = "pnpm" | "yarn";

export interface PackageManagerCommands {
    /** Plain install — used by `verify.sh`, which runs against a workspace that may not have a lockfile. */
    install: string;
    /** Lockfile-pinned install — used by `ci.yml`, which runs against the customer's committed repo. */
    frozenInstall: string;
    build: string;
    test: string;
}

export function packageManagerCommands(packageManager: SupportedPackageManager): PackageManagerCommands {
    return {
        install: `${packageManager} install`,
        frozenInstall: `${packageManager} install --frozen-lockfile`,
        build: `${packageManager} build`,
        test: `${packageManager} test`
    };
}
