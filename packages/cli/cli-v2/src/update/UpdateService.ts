import { VersionsCache } from "../cache/versions/index.js";
import { FernRcCliManager } from "../config/fern-rc/FernRcCliManager.js";
import { BinaryDownloader } from "./BinaryDownloader.js";
import { PlatformDetector } from "./PlatformDetector.js";
import { VersionResolver } from "./VersionResolver.js";

/**
 * Orchestrates the high-level operations the `fern update` family of commands
 * needs:
 *
 * - `checkLatest`   — resolve the latest available version
 * - `installVersion` — download + persist a specific version, optionally switch active
 * - `useVersion`    — switch the active pointer in ~/.fernrc to an already-installed version
 * - `listVersions`  — enumerate both locally-installed and remotely-available versions
 *
 * Everything is delegated to the smaller resolvers/managers so that each piece
 * stays test-friendly. The service deliberately does not perform any process
 * re-execution — the active version is consulted at CLI startup via a thin
 * launcher shim (built separately from the binary).
 */
export declare namespace UpdateService {
    interface CheckResult {
        /** Currently running CLI version (e.g. "*", "0.0.0", "1.2.3"). */
        currentVersion: string;
        /** Latest version available from the release feed. */
        latestVersion: string;
        /** Whether the latest version is newer than the current one. */
        isUpgradeAvailable: boolean;
        /** Raw release info for the latest version. */
        latestRelease: VersionResolver.Release;
    }

    interface InstallResult {
        /** Version that was installed (matches the requested tag). */
        version: string;
        /** Whether the binary was newly downloaded (false = already in cache). */
        downloaded: boolean;
        /** Whether the active version was switched as part of this install. */
        switchedActive: boolean;
    }

    interface ListedVersion {
        version: string;
        /** Whether the version exists in the local versions cache. */
        installed: boolean;
        /** Whether this is the active version. */
        active: boolean;
        /** Whether the upstream release is marked as a prerelease. */
        prerelease?: boolean;
        /** ISO timestamp from upstream, if known. */
        publishedAt?: string;
    }

    interface ListResult {
        /** Versions installed locally and tracked in ~/.fernrc. */
        installed: ListedVersion[];
        /** Recent releases available remotely (may overlap with installed). */
        remote: ListedVersion[];
        /** The active version, if set. */
        active: string | undefined;
    }
}

export class UpdateService {
    public readonly currentVersion: string;
    private readonly versions: VersionsCache;
    private readonly cliManager: FernRcCliManager;
    private readonly resolver: VersionResolver;
    private readonly downloader: BinaryDownloader;
    private readonly platform: PlatformDetector;

    constructor({
        versions,
        cliManager,
        resolver,
        downloader,
        platform,
        currentVersion
    }: {
        versions: VersionsCache;
        cliManager: FernRcCliManager;
        resolver: VersionResolver;
        downloader: BinaryDownloader;
        platform: PlatformDetector;
        currentVersion: string;
    }) {
        this.versions = versions;
        this.cliManager = cliManager;
        this.resolver = resolver;
        this.downloader = downloader;
        this.platform = platform;
        this.currentVersion = currentVersion;
    }

    /**
     * Probes the release feed for the newest version and reports whether the
     * running CLI is behind.
     */
    public async checkLatest({
        includePreReleases = false
    }: {
        includePreReleases?: boolean;
    } = {}): Promise<UpdateService.CheckResult> {
        const latestRelease = await this.resolver.getLatest({ includePreReleases });
        const latestVersion = stripTagPrefix(latestRelease.tagName);
        return {
            currentVersion: this.currentVersion,
            latestVersion,
            isUpgradeAvailable: isUpgradeAvailable(this.currentVersion, latestVersion),
            latestRelease
        };
    }

    /**
     * Installs the given version into the local versions cache.
     *
     * When `switchActive` is true (default), the active pointer in ~/.fernrc
     * is set to the new version. The binary is only re-downloaded when missing
     * from disk.
     */
    public async installVersion({
        version,
        switchActive = true,
        force = false
    }: {
        version: string;
        switchActive?: boolean;
        force?: boolean;
    }): Promise<UpdateService.InstallResult> {
        const target = this.platform.resolveTarget();
        const release = await this.resolver.getByTag(version);
        const downloadUrl = release.assets[target.assetName];
        if (downloadUrl == null) {
            throw new Error(
                `Release ${version} does not include asset ${target.assetName}. Available assets: ${
                    Object.keys(release.assets).join(", ") || "(none)"
                }.`
            );
        }

        const versionDir = this.versions.getVersionPath(version);
        const alreadyInstalled = !force && (await this.versions.hasVersion(version, target.binaryName));

        let downloaded = false;
        if (!alreadyInstalled) {
            await this.downloader.download({
                url: downloadUrl,
                destinationDir: versionDir,
                binaryName: target.binaryName
            });
            downloaded = true;
        }

        await this.cliManager.addInstalledVersion(version);

        let switchedActive = false;
        if (switchActive) {
            const currentActive = await this.cliManager.getActiveVersion();
            if (currentActive !== version) {
                await this.cliManager.setActiveVersion(version);
                switchedActive = true;
            }
        }

        return { version, downloaded, switchedActive };
    }

    /**
     * Switches the active pointer to an already-installed version.
     */
    public async activateVersion(version: string): Promise<void> {
        const target = this.platform.resolveTarget();
        const hasLocal = await this.versions.hasVersion(version, target.binaryName);
        if (!hasLocal) {
            throw new Error(
                `Version ${version} is not installed locally. Run \`fern update ${version}\` to install it first.`
            );
        }
        await this.cliManager.addInstalledVersion(version);
        await this.cliManager.setActiveVersion(version);
    }

    /**
     * Returns installed + remote versions for UI rendering. Remote lookups
     * never fail the call — when the network is unavailable the remote array
     * is simply empty.
     */
    public async listVersions({
        includePreReleases = false,
        remoteLimit = 10
    }: {
        includePreReleases?: boolean;
        remoteLimit?: number;
    } = {}): Promise<UpdateService.ListResult> {
        const target = this.platform.resolveTarget();
        const active = await this.cliManager.getActiveVersion();

        const trackedVersions = new Set(await this.cliManager.getInstalledVersions());
        for (const localVersion of await this.versions.listLocalVersions()) {
            trackedVersions.add(localVersion);
        }

        const installed: UpdateService.ListedVersion[] = [];
        for (const version of trackedVersions) {
            installed.push({
                version,
                installed: await this.versions.hasVersion(version, target.binaryName),
                active: active === version
            });
        }
        installed.sort((a, b) => compareVersionsDesc(a.version, b.version));

        let remote: UpdateService.ListedVersion[] = [];
        try {
            const releases = await this.resolver.listReleases({ limit: remoteLimit });
            const filtered = includePreReleases ? releases : releases.filter((release) => !release.prerelease);
            remote = filtered.map((release) => {
                const version = stripTagPrefix(release.tagName);
                return {
                    version,
                    installed: trackedVersions.has(version),
                    active: active === version,
                    prerelease: release.prerelease,
                    publishedAt: release.publishedAt
                };
            });
        } catch {
            // Best-effort: no network → no remote listing.
        }

        return { installed, remote, active };
    }
}

/**
 * Strip a leading `v` from a git tag (e.g. `v1.2.3` → `1.2.3`).
 * Exported for tests.
 */
export function stripTagPrefix(tag: string): string {
    return tag.startsWith("v") ? tag.slice(1) : tag;
}

/**
 * Compare two version strings, returning the order suitable for descending sort.
 * Falls back to lexicographic comparison for non-semver strings.
 */
export function compareVersionsDesc(a: string, b: string): number {
    const aParts = parseVersion(a);
    const bParts = parseVersion(b);
    if (aParts != null && bParts != null) {
        for (let i = 0; i < 3; i++) {
            const left = aParts[i] ?? 0;
            const right = bParts[i] ?? 0;
            if (left !== right) {
                return right - left;
            }
        }
        return 0;
    }
    return b.localeCompare(a);
}

/**
 * Returns true when `latest` is strictly newer than `current` under semver-like
 * comparison. Treats placeholders (`*`, `0.0.0`, empty) as "always upgrade".
 */
export function isUpgradeAvailable(current: string, latest: string): boolean {
    if (current === "*" || current === "" || current === "0.0.0") {
        return true;
    }
    const currentParts = parseVersion(current);
    const latestParts = parseVersion(latest);
    if (currentParts == null || latestParts == null) {
        return current !== latest;
    }
    for (let i = 0; i < 3; i++) {
        const left = latestParts[i] ?? 0;
        const right = currentParts[i] ?? 0;
        if (left !== right) {
            return left > right;
        }
    }
    return false;
}

function parseVersion(input: string): [number, number, number] | undefined {
    const cleaned = stripTagPrefix(input).split("-")[0];
    if (cleaned == null) {
        return undefined;
    }
    const parts = cleaned.split(".").map((segment) => Number.parseInt(segment, 10));
    if (parts.length < 1 || parts.some((segment) => Number.isNaN(segment))) {
        return undefined;
    }
    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}
