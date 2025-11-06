import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { mkdir, readFile, writeFile } from "fs/promises";
import { computeFileHash, downloadFile } from "./fileUtils";

// Constants for incremental sync
export const MANIFEST_FILENAME = "manifest.json";
export const VERSION_POINTER_FILENAME = "latest-version.txt";
export const DEPLOYMENTS_PATH = "deployments";

// Types for manifest-based incremental sync
export interface BundleManifest {
    version: string;
    timestamp: string;
    files: Record<string, { hash: string; size: number }>;
}

export interface LocalManifest extends BundleManifest {
    localPath: string;
}

// Try to fetch the latest version from the version pointer
export async function fetchLatestVersion(bucketUrl: string, logger: Logger): Promise<string | null> {
    try {
        const versionPointerUrl = new URL(`${DEPLOYMENTS_PATH}/${VERSION_POINTER_FILENAME}`, bucketUrl).href;
        logger.debug(`Fetching latest version from ${versionPointerUrl}`);

        const response = await fetch(versionPointerUrl);
        if (!response.ok) {
            logger.debug(`Version pointer not found (${response.status}). Incremental sync not available.`);
            return null;
        }

        const version = (await response.text()).trim();
        logger.debug(`Latest version from manifest system: ${version}`);
        return version;
    } catch (error) {
        logger.debug(`Failed to fetch latest version: ${error}. Falling back to traditional download.`);
        return null;
    }
}

// Fetch remote manifest from the manifest-based bundle system
export async function fetchRemoteManifest(
    bucketUrl: string,
    version: string,
    logger: Logger
): Promise<BundleManifest | null> {
    try {
        const manifestUrl = new URL(`${DEPLOYMENTS_PATH}/${version}/${MANIFEST_FILENAME}`, bucketUrl).href;
        logger.debug(`Fetching manifest from ${manifestUrl}`);

        const response = await fetch(manifestUrl);
        if (!response.ok) {
            logger.debug(`Manifest not found (${response.status}). Falling back to traditional download.`);
            return null;
        }

        const manifest: BundleManifest = await response.json();
        logger.debug(`Remote manifest fetched with ${Object.keys(manifest.files).length} files`);
        return manifest;
    } catch (error) {
        logger.debug(`Failed to fetch manifest: ${error}. Falling back to traditional download.`);
        return null;
    }
}

// Load local manifest if it exists
export async function loadLocalManifest(manifestPath: AbsoluteFilePath, logger: Logger): Promise<LocalManifest | null> {
    try {
        if (!(await doesPathExist(manifestPath))) {
            logger.debug("No local manifest found");
            return null;
        }

        const manifestContent = await readFile(manifestPath, "utf-8");
        const manifest: BundleManifest = JSON.parse(manifestContent);

        logger.debug(
            `Local manifest loaded with ${Object.keys(manifest.files).length} files (version: ${manifest.version})`
        );
        return {
            ...manifest,
            localPath: manifestPath
        };
    } catch (error) {
        logger.debug(`Failed to load local manifest: ${error}`);
        return null;
    }
}

// Compare manifests and determine which files need to be updated
export async function getFilesToUpdate(
    localManifest: LocalManifest | null,
    remoteManifest: BundleManifest,
    bundleFolderPath: AbsoluteFilePath,
    logger: Logger
): Promise<string[]> {
    const filesToUpdate: string[] = [];

    // If no local manifest, we need to download all files
    if (!localManifest) {
        logger.debug("No local manifest found, downloading all files");
        return Object.keys(remoteManifest.files);
    }

    // If versions are the same, check individual file hashes
    if (localManifest.version === remoteManifest.version) {
        logger.debug("Versions match, checking individual file hashes");
    } else {
        logger.debug(`Version mismatch: local=${localManifest.version}, remote=${remoteManifest.version}`);
    }

    // Check each file in the remote manifest
    for (const [relativePath, remoteFileInfo] of Object.entries(remoteManifest.files)) {
        const localFileInfo = localManifest.files[relativePath];
        const localFilePath = join(bundleFolderPath, RelativeFilePath.of(relativePath));

        // File doesn't exist locally
        if (!localFileInfo || !(await doesPathExist(localFilePath))) {
            filesToUpdate.push(relativePath);
            continue;
        }

        // Hash mismatch
        if (localFileInfo.hash !== remoteFileInfo.hash) {
            filesToUpdate.push(relativePath);
            continue;
        }

        // Verify actual file hash if size differs (could indicate corruption)
        if (localFileInfo.size !== remoteFileInfo.size) {
            try {
                const actualHash = await computeFileHash(localFilePath);
                if (actualHash !== remoteFileInfo.hash) {
                    filesToUpdate.push(relativePath);
                }
            } catch (error) {
                // If we can't compute hash, assume file needs updating
                logger.debug(`Failed to compute hash for ${relativePath}: ${error}`);
                filesToUpdate.push(relativePath);
            }
        }
    }

    logger.debug(`Found ${filesToUpdate.length} files that need updating`);
    return filesToUpdate;
}

// Perform incremental sync using manifest-based system
export async function performIncrementalSync(
    bucketUrl: string,
    manifestPath: AbsoluteFilePath,
    bundleFolderPath: AbsoluteFilePath,
    logger: Logger,
    preferCached: boolean
): Promise<{ success: boolean; version?: string }> {
    logger.debug("Attempting incremental sync using manifest-based system");

    try {
        // Step 1: Try to get the latest version
        const latestVersion = await fetchLatestVersion(bucketUrl, logger);
        if (!latestVersion) {
            logger.debug("Could not determine latest version, falling back to traditional download");
            return { success: false };
        }

        // Step 2: Fetch the remote manifest
        const remoteManifest = await fetchRemoteManifest(bucketUrl, latestVersion, logger);
        if (!remoteManifest) {
            logger.debug("Could not fetch remote manifest, falling back to traditional download");
            return { success: false };
        }

        // Step 3: Check if we should prefer cached version
        const localManifest = await loadLocalManifest(manifestPath, logger);

        if (preferCached && localManifest) {
            if (localManifest.version === remoteManifest.version) {
                logger.debug("Local version matches remote version, using cached bundle");
                return { success: true, version: latestVersion };
            } else {
                logger.debug(`Version mismatch: local=${localManifest.version}, remote=${remoteManifest.version}`);
            }
        }

        // Step 4: Determine which files need to be updated
        const filesToUpdate = await getFilesToUpdate(localManifest, remoteManifest, bundleFolderPath, logger);

        if (filesToUpdate.length === 0) {
            logger.debug("All files are up to date");
            // Still save the manifest in case it didn't exist before
            await writeFile(manifestPath, JSON.stringify(remoteManifest, null, 2));
            return { success: true, version: latestVersion };
        }

        logger.debug(`Downloading ${filesToUpdate.length} updated files...`);

        // Step 5: Ensure the bundle folder exists
        await mkdir(bundleFolderPath, { recursive: true });

        // Step 6: Download updated files
        const downloadPromises = filesToUpdate.map(async (relativePath) => {
            const destinationPath = join(bundleFolderPath, RelativeFilePath.of(relativePath));
            await downloadFile(bucketUrl, latestVersion, relativePath, destinationPath, logger);
        });

        // Download files in parallel with some concurrency limit
        const concurrency = 10;
        for (let i = 0; i < downloadPromises.length; i += concurrency) {
            const batch = downloadPromises.slice(i, i + concurrency);
            await Promise.all(batch);
        }

        // Step 7: Save the new manifest
        await writeFile(manifestPath, JSON.stringify(remoteManifest, null, 2));
        logger.debug(`Incremental sync completed. Downloaded ${filesToUpdate.length} files.`);

        return { success: true, version: latestVersion };
    } catch (error) {
        logger.debug(`Incremental sync failed: ${error}. Falling back to traditional download.`);
        return { success: false };
    }
}
