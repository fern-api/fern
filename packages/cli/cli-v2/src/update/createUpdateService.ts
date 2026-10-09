import { FernRcCliManager } from "../config/fern-rc/FernRcCliManager.js";
import { FernRcSchemaLoader } from "../config/fern-rc/FernRcSchemaLoader.js";
import type { Context } from "../context/Context.js";
import { Version } from "../version.js";
import { BinaryDownloader } from "./BinaryDownloader.js";
import { PlatformDetector } from "./PlatformDetector.js";
import { UpdateCheckTracker } from "./UpdateCheckTracker.js";
import { UpdateService } from "./UpdateService.js";
import { VersionResolver } from "./VersionResolver.js";

/**
 * Construct a fully-wired UpdateService from a Context. Centralizes the
 * dependency graph so each command can stay short.
 */
export function createUpdateService(context: Context): UpdateService {
    const loader = new FernRcSchemaLoader();
    return new UpdateService({
        versions: context.cache.versions,
        cliManager: new FernRcCliManager({ loader }),
        resolver: new VersionResolver(),
        downloader: new BinaryDownloader(),
        platform: new PlatformDetector(),
        currentVersion: Version
    });
}

/**
 * Construct an UpdateCheckTracker for the shared cache directory.
 */
export function createUpdateCheckTracker(context: Context): UpdateCheckTracker {
    return new UpdateCheckTracker({ baseDir: context.cache.getVersionedPath() });
}
