/**
 * Resolves CLI versions from the fern-api/fern GitHub Releases.
 *
 * Used by `fern update` to discover the latest release (and remotely-available
 * versions) without bundling any auth — the GitHub releases endpoints are public.
 */

const DEFAULT_RELEASES_BASE = "https://api.github.com/repos/fern-api/fern/releases";
const USER_AGENT = "fern-cli-update";

export declare namespace VersionResolver {
    interface Release {
        /** GitHub release tag name (matches the semver-style version). */
        tagName: string;
        /** Whether GitHub flagged this release as a prerelease. */
        prerelease: boolean;
        /** ISO-8601 publish timestamp. */
        publishedAt: string | undefined;
        /** Asset download URLs, keyed by asset filename. */
        assets: Record<string, string>;
    }

    type Fetcher = (input: string, init?: { headers?: Record<string, string> }) => Promise<FetchResponse>;

    interface FetchResponse {
        readonly ok: boolean;
        readonly status: number;
        readonly statusText: string;
        json(): Promise<unknown>;
    }
}

interface GitHubReleaseAsset {
    name: string;
    browser_download_url: string;
}

interface GitHubRelease {
    tag_name: string;
    prerelease: boolean;
    published_at?: string | null;
    assets?: GitHubReleaseAsset[];
}

function isGitHubRelease(value: unknown): value is GitHubRelease {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const record = value as Record<string, unknown>;
    return typeof record.tag_name === "string" && typeof record.prerelease === "boolean";
}

function toRelease(raw: GitHubRelease): VersionResolver.Release {
    const assets: Record<string, string> = {};
    for (const asset of raw.assets ?? []) {
        if (typeof asset?.name === "string" && typeof asset?.browser_download_url === "string") {
            assets[asset.name] = asset.browser_download_url;
        }
    }
    return {
        tagName: raw.tag_name,
        prerelease: raw.prerelease,
        publishedAt: raw.published_at ?? undefined,
        assets
    };
}

export class VersionResolver {
    private readonly baseUrl: string;
    private readonly fetcher: VersionResolver.Fetcher;

    constructor({ baseUrl, fetcher }: { baseUrl?: string; fetcher?: VersionResolver.Fetcher } = {}) {
        this.baseUrl = baseUrl ?? DEFAULT_RELEASES_BASE;
        this.fetcher = fetcher ?? (globalThis.fetch as unknown as VersionResolver.Fetcher);
    }

    /**
     * Fetches the latest non-prerelease release.
     */
    public async getLatest({
        includePreReleases = false
    }: {
        includePreReleases?: boolean;
    } = {}): Promise<VersionResolver.Release> {
        if (includePreReleases) {
            const all = await this.listReleases({ limit: 30 });
            if (all.length === 0) {
                throw new Error("No releases found on GitHub.");
            }
            const first = all[0];
            if (first == null) {
                throw new Error("No releases found on GitHub.");
            }
            return first;
        }

        const data = await this.requestJson(`${this.baseUrl}/latest`);
        if (!isGitHubRelease(data)) {
            throw new Error("Unexpected response shape from GitHub /releases/latest.");
        }
        return toRelease(data);
    }

    /**
     * Fetches the release matching a specific tag.
     */
    public async getByTag(tag: string): Promise<VersionResolver.Release> {
        const data = await this.requestJson(`${this.baseUrl}/tags/${encodeURIComponent(tag)}`);
        if (!isGitHubRelease(data)) {
            throw new Error(`Unexpected response shape for tag ${tag}.`);
        }
        return toRelease(data);
    }

    /**
     * Lists recent releases (most-recent-first). Limited to one page from
     * GitHub (default 30, max 100) — sufficient for surfacing recent versions
     * in `fern update list`.
     */
    public async listReleases({ limit = 30 }: { limit?: number } = {}): Promise<VersionResolver.Release[]> {
        const data = await this.requestJson(`${this.baseUrl}?per_page=${Math.min(Math.max(limit, 1), 100)}`);
        if (!Array.isArray(data)) {
            throw new Error("Unexpected response shape from GitHub /releases.");
        }
        const releases: VersionResolver.Release[] = [];
        for (const item of data) {
            if (isGitHubRelease(item)) {
                releases.push(toRelease(item));
            }
        }
        return releases;
    }

    private async requestJson(url: string): Promise<unknown> {
        const response = await this.fetcher(url, {
            headers: {
                Accept: "application/vnd.github+json",
                "User-Agent": USER_AGENT
            }
        });
        if (!response.ok) {
            throw new Error(`GitHub request to ${url} failed: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
}
