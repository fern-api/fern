import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { rm, writeFile } from "fs/promises";

const PLATFORM_IS_WINDOWS = process.platform === "win32";
const COREPACK_MISSING_KEYID_ERROR_MESSAGE = 'Cannot find matching keyid: {"signatures":';

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

function contactFernSupportError(errorMessage: string): Error {
    return new Error(`${errorMessage}. Please reach out to support@buildwithfern.com.`);
}

export interface AppInstallationResult {
    type: "success" | "failure";
}

// Perform app installation steps (pnpm install, esbuild setup, etc.)
export async function performAppInstallation(
    logger: Logger,
    absolutePathToBundleFolder: AbsoluteFilePath,
    absPathToStandalone: AbsoluteFilePath,
    absPathToInstrumentationJs: AbsoluteFilePath,
    pnpmWorkspacePath: AbsoluteFilePath,
    pnpmfilePath: AbsoluteFilePath,
    npmrcPath: AbsoluteFilePath
): Promise<AppInstallationResult> {
    try {
        // check if pnpm exists
        logger.debug("Checking if pnpm is installed");
        try {
            await loggingExeca(logger, PLATFORM_IS_WINDOWS ? "where" : "which", ["pnpm"], {
                cwd: absolutePathToBundleFolder,
                doNotPipeOutput: true
            });
        } catch (error) {
            logger.debug("pnpm not found, installing pnpm");
            await loggingExeca(logger, "npm", ["install", "-g", "pnpm"], {
                doNotPipeOutput: true
            });
        }

        // if pnpm still hasn't been installed, user should install themselves
        try {
            await loggingExeca(logger, PLATFORM_IS_WINDOWS ? "where" : "which", ["pnpm"], {
                cwd: absolutePathToBundleFolder,
                doNotPipeOutput: true
            });
        } catch (error) {
            throw new Error(
                "Requires [pnpm] to run local development. Please run: npm install -g pnpm, and then: fern docs dev"
            );
        }

        try {
            // install esbuild
            logger.debug("Installing esbuild");
            await loggingExeca(logger, "pnpm", ["i", "esbuild"], {
                cwd: absolutePathToBundleFolder,
                doNotPipeOutput: true
            });
        } catch (error) {
            if (error instanceof Error) {
                // If error message contains "Cannot find matching keyid:", try to upgrade corepack
                if (
                    typeof error?.message === "string" &&
                    error.message.includes(COREPACK_MISSING_KEYID_ERROR_MESSAGE)
                ) {
                    logger.debug("Detected corepack missing keyid error. Attempting to upgrade corepack");
                    try {
                        await loggingExeca(logger, "npm", ["install", "-g", "corepack@latest"], {
                            doNotPipeOutput: true
                        });
                    } catch (corepackError) {
                        throw contactFernSupportError(`Failed to update corepack due to error: ${corepackError}`);
                    }
                    try {
                        // Try installing esbuild again after upgrading corepack
                        logger.debug("Installing esbuild after upgrading corepack");
                        await loggingExeca(logger, "pnpm", ["i", "esbuild"], {
                            cwd: absolutePathToBundleFolder,
                            doNotPipeOutput: true
                        });
                    } catch (installError) {
                        throw contactFernSupportError(
                            `Failed to install required package after updating corepack due to error: ${installError}`
                        );
                    }
                } else {
                    throw contactFernSupportError(`Failed to install required package due to error: ${error}.`);
                }
            } else {
                throw contactFernSupportError(`Failed to install required package due to error: ${error}.`);
            }
        }

        try {
            // resolve imports
            logger.debug("Resolve esbuild imports");
            await loggingExeca(logger, "node", ["install-esbuild.js"], {
                cwd: absolutePathToBundleFolder,
                doNotPipeOutput: true
            });
        } catch (error) {
            throw contactFernSupportError(`Failed to resolve imports due to error: ${error}`);
        }

        if (PLATFORM_IS_WINDOWS) {
            // Check all paths in parallel
            const [pnpmWorkspaceExists, pnpmfileExists, npmrcExists, instrumentationJsExists] = await Promise.all([
                doesPathExist(pnpmWorkspacePath),
                doesPathExist(pnpmfilePath),
                doesPathExist(npmrcPath),
                doesPathExist(absPathToInstrumentationJs)
            ]);

            // Warn if pnpm-workspace.yaml does not exist
            if (!pnpmWorkspaceExists) {
                logger.warn(
                    `Expected pnpm-workspace.yaml at ${pnpmWorkspacePath} but it does not exist. If you are experiencing issues, please contact support@buildwithfern.com.`
                );
            }

            // Write pnpmfile.cjs if it does not exist
            if (!pnpmfileExists) {
                logger.debug(`Writing pnpmfile.cjs at ${pnpmfilePath}`);
                await writeFile(pnpmfilePath, PNPMFILE_CJS_CONTENTS);
            }
            // Write .npmrc if it does not exist
            if (!npmrcExists) {
                logger.debug(`Writing .npmrc at ${npmrcPath}`);
                await writeFile(npmrcPath, NPMRC_CONTENTS);
            }
            // Remove instrumentation.js if it exists
            if (instrumentationJsExists) {
                logger.debug(`Removing instrumentation.js at ${absPathToInstrumentationJs}`);
                await rm(absPathToInstrumentationJs);
            }

            try {
                // pnpm install within standalone
                logger.debug("Running pnpm install within standalone");
                await loggingExeca(logger, "pnpm", ["install"], {
                    cwd: absPathToStandalone,
                    doNotPipeOutput: true
                });
            } catch (error) {
                throw contactFernSupportError(`Failed to install required package due to error: ${error}`);
            }
        }

        return { type: "success" };
    } catch (error) {
        logger.error(`App installation failed: ${error}`);
        return { type: "failure" };
    }
}
