import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createWriteStream } from "fs";
import fs from "fs/promises";
import { Readable } from "stream";
import { finished } from "stream/promises";
import type { ReadableStream as WebReadableStream } from "stream/web";

/**
 * Downloads CLI binaries from a URL into a target directory atomically.
 *
 * Atomicity: bytes are streamed to a sibling `.partial` file, then renamed in
 * place once the download completes. Failed downloads leave the destination
 * untouched (the partial file is removed on error).
 */
export declare namespace BinaryDownloader {
    /** Minimal fetch-compatible function shape. */
    type Fetcher = (input: string, init?: { headers?: Record<string, string> }) => Promise<FetchResponse>;

    interface FetchResponse {
        readonly ok: boolean;
        readonly status: number;
        readonly statusText: string;
        readonly body: WebReadableStream<Uint8Array> | null;
    }

    interface DownloadOptions {
        /** URL of the binary to download. */
        url: string;
        /** Directory the binary should land in. Created if missing. */
        destinationDir: AbsoluteFilePath;
        /** Filename to write (e.g. `fern` or `fern.exe`). */
        binaryName: string;
    }
}

const USER_AGENT = "fern-cli-update";

export class BinaryDownloader {
    private readonly fetcher: BinaryDownloader.Fetcher;

    constructor({ fetcher }: { fetcher?: BinaryDownloader.Fetcher } = {}) {
        this.fetcher = fetcher ?? (globalThis.fetch as unknown as BinaryDownloader.Fetcher);
    }

    /**
     * Streams the binary from `url` into `destinationDir/binaryName`.
     * Returns the absolute path written.
     */
    public async download(options: BinaryDownloader.DownloadOptions): Promise<AbsoluteFilePath> {
        const { url, destinationDir, binaryName } = options;
        await fs.mkdir(destinationDir, { recursive: true });
        const finalPath = join(destinationDir, RelativeFilePath.of(binaryName));
        const partialPath = join(destinationDir, RelativeFilePath.of(`${binaryName}.partial`));

        if (await doesPathExist(partialPath)) {
            await fs.rm(partialPath, { force: true });
        }

        const response = await this.fetcher(url, {
            headers: {
                "User-Agent": USER_AGENT,
                Accept: "application/octet-stream"
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
        }
        if (response.body == null) {
            throw new Error(`Empty response body when downloading ${url}.`);
        }

        try {
            const fileStream = createWriteStream(partialPath);
            const nodeStream = Readable.fromWeb(response.body);
            await finished(nodeStream.pipe(fileStream));
            await fs.chmod(partialPath, 0o755);
            await fs.rename(partialPath, finalPath);
        } catch (error) {
            await fs.rm(partialPath, { force: true });
            throw error;
        }

        return finalPath;
    }
}
