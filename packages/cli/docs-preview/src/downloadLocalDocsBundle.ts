import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import decompress from "decompress";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { homedir } from "os";
import tmp from "tmp-promise";
import xml2js from "xml2js";
import { performAppInstallation } from "./appInstallation";
import { MANIFEST_FILENAME, performIncrementalSync } from "./incrementalSync";

const PLATFORM_IS_WINDOWS = process.platform === "win32";
const ETAG_FILENAME = "etag";
const PREVIEW_FOLDER_NAME = "preview";
const APP_PREVIEW_FOLDER_NAME = "app-preview";
const BUNDLE_FOLDER_NAME = "bundle";
const NEXT_BUNDLE_FOLDER_NAME = ".next";
const STANDALONE_FOLDER_NAME = "standalone";
const LOCAL_STORAGE_FOLDER = process.env.LOCAL_STORAGE_FOLDER ?? ".fern";

// Const for windows post-processing
const INSTRUMENTATION_PATH = "packages/fern-docs/bundle/.next/server/instrumentation.js";
const NPMRC_NAME = ".npmrc";
const PNPMFILE_CJS_NAME = ".pnpmfile.cjs";
const PNPM_WORKSPACE_YAML_NAME = "pnpm-workspace.yaml";

export function getLocalStorageFolder(): AbsoluteFilePath {
    return join(AbsoluteFilePath.of(homedir()), RelativeFilePath.of(LOCAL_STORAGE_FOLDER));
}

export function getPathToPreviewFolder({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(getLocalStorageFolder(), RelativeFilePath.of(app ? APP_PREVIEW_FOLDER_NAME : PREVIEW_FOLDER_NAME));
}

export function getPathToBundleFolder({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(
        getPathToPreviewFolder({ app }),
        RelativeFilePath.of(app ? NEXT_BUNDLE_FOLDER_NAME : BUNDLE_FOLDER_NAME)
    );
}

export function getPathToStandaloneFolder({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(getPathToBundleFolder({ app }), RelativeFilePath.of(STANDALONE_FOLDER_NAME));
}

export function getPathToInstrumentationJs({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(getPathToStandaloneFolder({ app }), RelativeFilePath.of(INSTRUMENTATION_PATH));
}

function getPathToPnpmWorkspaceYaml({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(getPathToStandaloneFolder({ app }), RelativeFilePath.of(PNPM_WORKSPACE_YAML_NAME));
}

function getPathToPnpmfileCjs({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(getPathToStandaloneFolder({ app }), RelativeFilePath.of(PNPMFILE_CJS_NAME));
}

function getPathToNpmrc({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(getPathToStandaloneFolder({ app }), RelativeFilePath.of(NPMRC_NAME));
}

function contactFernSupportError(errorMessage: string): Error {
    return new Error(`${errorMessage}. Please reach out to support@buildwithfern.com.`);
}

export function getPathToEtagFile({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(getPathToPreviewFolder({ app }), RelativeFilePath.of(ETAG_FILENAME));
}

// Get path to local manifest file
function getPathToLocalManifest({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(getPathToPreviewFolder({ app }), RelativeFilePath.of(MANIFEST_FILENAME));
}

export declare namespace DownloadLocalBundle {
    type Result = SuccessResult | FailureResult;

    interface SuccessResult {
        type: "success";
    }

    interface FailureResult {
        type: "failure";
    }
}

export async function downloadBundle({
    bucketUrl,
    logger,
    preferCached,
    app = false,
    tryTar = false
}: {
    bucketUrl: string;
    logger: Logger;
    preferCached: boolean;
    app?: boolean;
    tryTar?: boolean;
}): Promise<DownloadLocalBundle.Result> {
    logger.debug("Setting up docs preview bundle...");

    // First, try incremental sync using the manifest-based system
    const manifestPath = getPathToLocalManifest({ app });
    const bundleFolderPath = getPathToBundleFolder({ app });
    const incrementalResult = await performIncrementalSync(
        bucketUrl,
        manifestPath,
        bundleFolderPath,
        logger,
        preferCached
    );

    if (incrementalResult.success) {
        logger.debug("Successfully used incremental sync");

        // If this is an app bundle, we still need to run the installation steps
        if (app) {
            const absolutePathToBundleFolder = getPathToBundleFolder({ app });
            const absPathToStandalone = getPathToStandaloneFolder({ app });
            const absPathToInstrumentationJs = getPathToInstrumentationJs({ app });
            const pnpmWorkspacePath = getPathToPnpmWorkspaceYaml({ app });
            const pnpmfilePath = getPathToPnpmfileCjs({ app });
            const npmrcPath = getPathToNpmrc({ app });

            const installResult = await performAppInstallation(
                logger,
                absolutePathToBundleFolder,
                absPathToStandalone,
                absPathToInstrumentationJs,
                pnpmWorkspacePath,
                pnpmfilePath,
                npmrcPath
            );
            if (installResult.type === "failure") {
                return { type: "failure" };
            }
        }

        return { type: "success" };
    }

    // If incremental sync failed, fall back to traditional download
    logger.debug("Falling back to traditional zip/tar download");

    const response = await fetch(bucketUrl);
    if (!response.ok) {
        return {
            type: "failure"
        };
    }
    const body = await response.text();
    const parser = new xml2js.Parser();
    const parsedResponse = await parser.parseStringPromise(body);
    const eTag = parsedResponse?.ListBucketResult?.Contents?.[0]?.ETag?.[0];
    const key = parsedResponse?.ListBucketResult?.Contents?.[0]?.Key?.[0];

    const eTagFilepath = getPathToEtagFile({ app });
    if (preferCached) {
        const currentETagExists = await doesPathExist(eTagFilepath);
        let currentETag = undefined;
        if (currentETagExists) {
            logger.debug("Reading existing ETag");
            currentETag = (await readFile(eTagFilepath)).toString();
        }
        if (currentETag != null && currentETag === eTag) {
            logger.debug("ETag matches. Using already downloaded bundle");
            // The bundle is already downloaded
            return {
                type: "success"
            };
        } else {
            logger.debug("ETag is different. Downloading latest preview bundle");
            if (app) {
                logger.info(
                    "Setting up docs preview bundle...\nPlease wait while the installation completes. This may take a few minutes depending on your connection speed."
                );
            }
        }
    }

    logger.debug("Creating tmp directory to download docs preview bundle");
    // create tmp directory
    const dir = await tmp.dir({ prefix: "fern" });
    const absoluteDirectoryToTmpDir = AbsoluteFilePath.of(dir.path);

    const docsBundleUrl = new URL(key, bucketUrl).href;
    logger.debug(`Downloading docs preview bundle from ${docsBundleUrl}`);
    // download docs bundle
    try {
        const docsBundleZipResponse = await fetch(docsBundleUrl);
        if (!docsBundleZipResponse.ok) {
            throw new Error(`Failed to download docs preview bundle. Status code: ${docsBundleZipResponse.status}`);
        }
        const outputZipPath = join(
            absoluteDirectoryToTmpDir,
            RelativeFilePath.of(tryTar ? "output.tar.gz" : "output.zip")
        );

        if (docsBundleZipResponse.body == null) {
            throw contactFernSupportError("Docs bundle has empty response body");
        }

        const nodeBuffer = Buffer.from(await docsBundleZipResponse.arrayBuffer());
        await writeFile(outputZipPath, new Uint8Array(nodeBuffer));
        logger.debug(`Wrote ${tryTar ? "output.tar.gz" : "output.zip"} to ${outputZipPath}`);

        const absolutePathToPreviewFolder = getPathToPreviewFolder({ app });
        if (await doesPathExist(absolutePathToPreviewFolder)) {
            logger.debug(`Removing previously cached bundle at: ${absolutePathToPreviewFolder}`);
            await rm(absolutePathToPreviewFolder, { recursive: true });
        }
        await mkdir(absolutePathToPreviewFolder, { recursive: true });

        const absolutePathToBundleFolder = getPathToBundleFolder({ app });
        await mkdir(absolutePathToBundleFolder, { recursive: true });
        logger.debug(`Decompressing bundle from ${outputZipPath} to ${absolutePathToBundleFolder}`);
        await decompress(outputZipPath, absolutePathToBundleFolder, {
            // skip extraction of symlinks on windows
            filter: (file) => !(PLATFORM_IS_WINDOWS && file.type === "symlink")
        });

        // write etag
        await writeFile(eTagFilepath, eTag);
        logger.debug(`Downloaded bundle to ${absolutePathToBundleFolder}`);

        // Perform app installation if needed
        if (app) {
            const absolutePathToBundleFolder = getPathToBundleFolder({ app });
            const absPathToStandalone = getPathToStandaloneFolder({ app });
            const absPathToInstrumentationJs = getPathToInstrumentationJs({ app });
            const pnpmWorkspacePath = getPathToPnpmWorkspaceYaml({ app });
            const pnpmfilePath = getPathToPnpmfileCjs({ app });
            const npmrcPath = getPathToNpmrc({ app });

            const installResult = await performAppInstallation(
                logger,
                absolutePathToBundleFolder,
                absPathToStandalone,
                absPathToInstrumentationJs,
                pnpmWorkspacePath,
                pnpmfilePath,
                npmrcPath
            );
            if (installResult.type === "failure") {
                throw new Error("App installation failed");
            }
        }

        return {
            type: "success"
        };
    } catch (error) {
        logger.error(`Error: ${error}`);

        // remove incomplete bundle
        const absolutePathToPreviewFolder = getPathToPreviewFolder({ app });
        if (await doesPathExist(absolutePathToPreviewFolder)) {
            await rm(absolutePathToPreviewFolder, { recursive: true });
        }
        logger.debug(`Removing incomplete bundle: rm -rf ${absolutePathToPreviewFolder}`);

        return {
            type: "failure"
        };
    }
}
