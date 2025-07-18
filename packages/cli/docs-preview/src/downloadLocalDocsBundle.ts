import decompress from "decompress";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { homedir } from "os";
import tmp from "tmp-promise";
import xml2js from "xml2js";
import path from "path";
import fs from "fs";


import { AbsoluteFilePath, RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";

const ETAG_FILENAME = "etag";
const PREVIEW_FOLDER_NAME = "preview";
const APP_PREVIEW_FOLDER_NAME = "app-preview-fernlocal-4";
const BUNDLE_FOLDER_NAME = "bundle";
const NEXT_BUNDLE_FOLDER_NAME = ".next";
const STANDALONE_FOLDER_NAME = "standalone";
const LOCAL_STORAGE_FOLDER = process.env.LOCAL_STORAGE_FOLDER ?? ".fern";

// Const for windows post-processing
const INSTRUMENTATION_PATH = "packages/fern-docs/bundle/.next/server/instrumentation.js";
const NPMRC_NAME = ".npmrc";
const PNPMFILE_CJS_NAME = "pnpmfile.cjs";
const PNPM_WORKSPACE_YAML_NAME = "pnpm-workspace.yaml";

export function getLocalStorageFolder(): AbsoluteFilePath {
    return join(AbsoluteFilePath.of(homedir()), RelativeFilePath.of(LOCAL_STORAGE_FOLDER));
}

export function getPathToPreviewFolder({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(
        getLocalStorageFolder(),
        RelativeFilePath.of(app ? APP_PREVIEW_FOLDER_NAME : PREVIEW_FOLDER_NAME)
    );
}

export function getPathToBundleFolder({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(
        getPathToPreviewFolder({ app }),
        RelativeFilePath.of(app ? NEXT_BUNDLE_FOLDER_NAME : BUNDLE_FOLDER_NAME)
    );
}

export function getPathToStandaloneFolder({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(
        getPathToBundleFolder({app}),
        RelativeFilePath.of(STANDALONE_FOLDER_NAME)
    );
}

export function getPathToInstrumentationJs({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(
        getPathToStandaloneFolder({ app }),
        RelativeFilePath.of(INSTRUMENTATION_PATH)
    )
}

function getPathToPnpmWorkspaceYaml({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(
        getPathToStandaloneFolder({ app }),
        RelativeFilePath.of(PNPM_WORKSPACE_YAML_NAME)
    );
}

function getPathToPnpmfileCjs({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(
        getPathToStandaloneFolder({ app }),
        RelativeFilePath.of(PNPMFILE_CJS_NAME)
    );
}

function getPathToNpmrc({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(
        getPathToStandaloneFolder({ app }),
        RelativeFilePath.of(NPMRC_NAME)
    );
}

export function getPathToEtagFile({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(
        getPathToPreviewFolder({ app }),
        RelativeFilePath.of(ETAG_FILENAME)
    );
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

// Config file contents as constants
const PNPM_WORKSPACE_YAML_CONTENTS = `packages:
  - "packages/**"
  - "!**/dist"
`;

const PNPMFILE_CJS_CONTENTS = `module.exports = {
    hooks: {
        readPackage(pkg) {
            // Remove all workspace:* dependencies
            if (pkg.dependencies) {
                Object.keys(pkg.dependencies).forEach(dep => {
                    if (pkg.dependencies[dep] === 'workspace:*') {
                        delete pkg.dependencies[dep]; } });
                    }
            if (pkg.devDependencies) {
                Object.keys(pkg.devDependencies).forEach(dep => {
                    if (pkg.devDependencies[dep] === 'workspace:*') {
                        delete pkg.devDependencies[dep]; } });
            } return pkg;
        }
    }
};
`;

const NPMRC_CONTENTS = "@fern-fern:registry=https://npm.buildwithfern.com\n";

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
            logger.error(`Failed to download docs preview bundle. Status code: ${docsBundleZipResponse.status}`);
            return {
                type: "failure"
            };
        }
        const outputZipPath = join(
            absoluteDirectoryToTmpDir,
            RelativeFilePath.of(tryTar ? "output.tar.gz" : "output.zip")
        );

        if (docsBundleZipResponse.body == null) {
            return {
                type: "failure"
            };
        }

        const nodeBuffer = Buffer.from(await docsBundleZipResponse.arrayBuffer());
        await writeFile(outputZipPath, new Uint8Array(nodeBuffer));
        logger.debug(`Wrote ${tryTar ? "output.tar.gz" : "output.zip"} to ${outputZipPath}`);

        const absolutePathToPreviewFolder = getPathToPreviewFolder({ app });
        if (await doesPathExist(absolutePathToPreviewFolder)) {
            await rm(absolutePathToPreviewFolder, { recursive: true });
        }
        await mkdir(absolutePathToPreviewFolder, { recursive: true });
        logger.debug(`rm -rf ${absolutePathToPreviewFolder}`);

        const absolutePathToBundleFolder = getPathToBundleFolder({ app });
        await mkdir(absolutePathToBundleFolder, { recursive: true });
        await decompress(outputZipPath, absolutePathToBundleFolder, {
            // skip extraction of symlinks on windows
            filter: (file) => !(process.platform === "win32" && file.type === "symlink")
        });

        // write etag
        await writeFile(eTagFilepath, eTag);
        logger.debug(`Downloaded bundle to ${absolutePathToBundleFolder}`);

        if (app) {
            // check if pnpm exists
            logger.debug("Checking if pnpm is installed");
            try {
                await loggingExeca(logger, process.platform === "win32" ? "where" : "which", ["pnpm"], {
                    cwd: absolutePathToBundleFolder,
                    doNotPipeOutput: false
                });
            } catch (error) {
                logger.debug("pnpm not found, installing pnpm");
                await loggingExeca(logger, "npm", ["install", "-g", "pnpm"], {
                    doNotPipeOutput: false
                });
            }

            // if pnpm still hasn't been installed, user should install themselves
            try {
                await loggingExeca(logger, process.platform === "win32" ? "where" : "which", ["pnpm"], {
                    cwd: absolutePathToBundleFolder,
                    doNotPipeOutput: false
                });
            } catch (error) {
                logger.error(
                    "Requires [pnpm] to run local development. Please run: npm install -g pnpm, and then: fern docs dev"
                );

                // remove incomplete bundle
                if (await doesPathExist(absolutePathToPreviewFolder)) {
                    await rm(absolutePathToPreviewFolder, { recursive: true });
                }
                logger.debug(`rm -rf ${absolutePathToPreviewFolder}`);
                return {
                    type: "failure"
                };
            }

            try {
                // install esbuild
                logger.debug("Installing esbuild");
                await loggingExeca(logger, "pnpm", ["i", "esbuild"], {
                    cwd: absolutePathToBundleFolder,
                    doNotPipeOutput: false
                });
            } catch (error) {
                logger.error("Failed to install required package. Please reach out to support@buildwithfern.com.");

                // remove incomplete bundle
                if (await doesPathExist(absolutePathToPreviewFolder)) {
                    await rm(absolutePathToPreviewFolder, { recursive: true });
                }
                logger.debug(`rm -rf ${absolutePathToPreviewFolder}`);
                return {
                    type: "failure"
                };
            }

            try {
                // resolve imports
                logger.debug("Resolve esbuild imports");
                await loggingExeca(logger, "node", ["install-esbuild.js"], {
                    cwd: absolutePathToBundleFolder,
                    doNotPipeOutput: false
                });
            } catch (error) {
                logger.error("Failed to resolve imports. Please reach out to support@buildwithfern.com.");

                // remove incomplete bundle
                if (await doesPathExist(absolutePathToPreviewFolder)) {
                    await rm(absolutePathToPreviewFolder, { recursive: true });
                }
                logger.debug(`rm -rf ${absolutePathToPreviewFolder}`);
                return {
                    type: "failure"
                };
            }

            // if (process.platform === "win32") {
            const absPathToStandalone = getPathToStandaloneFolder({ app });
            const absPathToInstrumentationJs = getPathToInstrumentationJs({ app });
            // Add workspace config files
            // const fs = await import('fs/promises');
            // const pathModule = require('path');
            const pnpmWorkspacePath = getPathToPnpmWorkspaceYaml({app})
            const pnpmfilePath = getPathToPnpmfileCjs({app});
            const npmrcPath = getPathToNpmrc({app});

            const foo = doesPathExist(pnpmWorkspacePath);

            await Promise.all([
                doesPathExist(pnpmWorkspacePath).then((exists) => { if (exists) return fs.writeFile(pnpmWorkspacePath, PNPM_WORKSPACE_YAML_CONTENTS)}),
                doesPathExist(pnpmfilePath).then(fs.writeFile(pnpmfilePath, PNPMFILE_CJS_CONTENTS)),
                doesPathExist(npmrcPath).then(fs.writeFile(npmrcPath, NPMRC_CONTENTS)),
                doesPathExist()
            ]
                
            )
            // Check all paths in parallel
            const [
                pnpmWorkspaceExists,
                pnpmfileExists,
                npmrcExists,
                instrumentationJsExists
            ] = await Promise.all([
                doesPathExist(pnpmWorkspacePath),
                doesPathExist(pnpmfilePath),
                doesPathExist(npmrcPath),
                doesPathExist(absPathToInstrumentationJs)
            ]);

            const writePromises = [];
            if (!pnpmWorkspaceExists) {
                writePromises.push(
                    fs.writeFile(
                        pnpmWorkspacePath,
                        PNPM_WORKSPACE_YAML_CONTEN
                    )
                );
            }
            if (!pnpmfileExists) {
                writePromises.push(
                    fs.writeFile(
                        pnpmfilePath,
                        PNPMFILE_CJS
                    )
                );
            }
            if (!npmrcExists) {
                writePromises.push(
                    fs.writeFile(
                        npmrcPath,
                        NPMRC
                    )
                );
            }
            if (instrumentationJsExists) {
                writePromises.push(fs.unlink(absPathToInstrumentationJs));
            }
            await Promise.all(writePromises);

            // pnpm install within standalone
            logger.debug("Resolve esbuild imports");
            await loggingExeca(logger, "pnpm", ["install"], {
                cwd: absPathToStandalone,
                doNotPipeOutput: false
            });
            // }
        }

        return {
            type: "success"
        };
    } catch (error) {
        logger.error(`Failed to download docs preview bundle. Error: ${error}`);
        return {
            type: "failure"
        };
    }
}
