import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import { PublishInfo } from "@fern-api/typescript-base";
import { execFile } from "child_process";
import decompress from "decompress";
import { cp, readdir, readFile, rm, writeFile } from "fs/promises";
import tmp from "tmp-promise";
import { promisify } from "util";

export declare namespace PersistedTypescriptProject {
    export interface Init {
        directory: AbsoluteFilePath;
        srcDirectory: RelativeFilePath;
        distDirectory: RelativeFilePath;
        testDirectory: RelativeFilePath;
        buildCommand: string[];
        formatCommand: string[];
        checkFixCommand: string[];
        /** Package specifiers needed for check:fix (e.g. ["@biomejs/biome@2.4.3"]) */
        checkFixPackages: string[];
        /** Binary names that must be on PATH for check:fix (e.g. ["biome"]) */
        checkFixToolBinaries: string[];
        runScripts: boolean;
        packageManager: "pnpm" | "yarn";
    }
}

export class PersistedTypescriptProject {
    private directory: AbsoluteFilePath;
    private srcDirectory: RelativeFilePath;
    private distDirectory: RelativeFilePath;
    private packageManager: "pnpm" | "yarn";
    private testDirectory: RelativeFilePath;
    private buildCommand: string[];
    private formatCommand: string[];
    private checkFixCommand: string[];
    private checkFixPackages: string[];
    private checkFixToolBinaries: string[];

    private runScripts;

    constructor({
        directory,
        srcDirectory,
        distDirectory,
        testDirectory,
        buildCommand,
        formatCommand,
        checkFixCommand,
        checkFixPackages,
        checkFixToolBinaries,
        runScripts,
        packageManager
    }: PersistedTypescriptProject.Init) {
        this.directory = directory;
        this.srcDirectory = srcDirectory;
        this.distDirectory = distDirectory;
        this.testDirectory = testDirectory;
        this.buildCommand = buildCommand;
        this.formatCommand = formatCommand;
        this.checkFixCommand = checkFixCommand;
        this.checkFixPackages = checkFixPackages;
        this.checkFixToolBinaries = checkFixToolBinaries;
        this.runScripts = runScripts;
        this.packageManager = packageManager;
    }

    public getSrcDirectory(): AbsoluteFilePath {
        return join(this.directory, this.srcDirectory);
    }

    public getRootDirectory(): AbsoluteFilePath {
        return this.directory;
    }

    public getTestDirectory(): RelativeFilePath {
        return this.testDirectory;
    }

    public async fixPackageJson(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        try {
            logger.debug("Normalizing package.json in-process");
            const startTime = Date.now();
            const pkgPath = join(this.directory, RelativeFilePath.of("package.json"));
            const raw = await readFile(pkgPath, "utf-8");
            const pkg = JSON.parse(raw);
            let changed = false;

            // Normalize repository field (main npm pkg fix transform)
            if (typeof pkg.repository === "string" && pkg.repository.length > 0) {
                const url = pkg.repository.startsWith("git+") ? pkg.repository : `git+${pkg.repository}`;
                const withSuffix = url.endsWith(".git") ? url : `${url}.git`;
                pkg.repository = { type: "git", url: withSuffix };
                changed = true;
            }

            if (changed) {
                await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
            }
            logger.debug(`[TIMING] fixPackageJson took ${Date.now() - startTime}ms`);
        } catch (e) {
            logger.warn(`Failed to normalize package.json: ${e}`);
        }
    }

    public async generateLockfile(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        const pm = createLoggingExecutable(this.packageManager, {
            cwd: this.directory,
            logger
        });

        const startTime = Date.now();
        await (this.packageManager === "yarn"
            ? pm(["install", "--mode=update-lockfile", "--ignore-scripts", "--prefer-offline"], {
                  env: {
                      // set enableImmutableInstalls=false so we can modify yarn.lock, even when in CI
                      YARN_ENABLE_IMMUTABLE_INSTALLS: "false"
                  }
              })
            : pm(["install", "--lockfile-only", "--ignore-scripts", "--prefer-offline", "--no-optional"], {
                  env: {
                      // allow modifying pnpm-lock.yaml, even when in CI
                      PNPM_FROZEN_LOCKFILE: "false"
                  }
              }));
        logger.debug(`[TIMING] generateLockfile took ${Date.now() - startTime}ms`);
    }

    public async installDependencies(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        const pm = createLoggingExecutable(this.packageManager, {
            cwd: this.directory,
            logger
        });

        const startTime = Date.now();
        await (this.packageManager === "yarn"
            ? pm(["install", "--ignore-scripts", "--prefer-offline"], {
                  env: {
                      // set enableImmutableInstalls=false so we can modify yarn.lock, even when in CI
                      YARN_ENABLE_IMMUTABLE_INSTALLS: "false"
                  }
              })
            : pm(["install", "--ignore-scripts", "--prefer-offline"], {
                  env: {
                      // allow modifying pnpm-lock.yaml, even when in CI
                      PNPM_FROZEN_LOCKFILE: "false"
                  }
              }));
        logger.debug(`[TIMING] installDependencies took ${Date.now() - startTime}ms`);
    }

    /**
     * Returns true when every tool binary needed by check:fix is already
     * available on the system PATH (e.g. globally installed in Docker).
     * When true, callers can skip installing packages entirely.
     */
    public async areCheckFixToolsAvailable(logger: Logger): Promise<boolean> {
        if (this.checkFixToolBinaries.length === 0) {
            return true;
        }
        const execFileAsync = promisify(execFile);
        for (const binary of this.checkFixToolBinaries) {
            try {
                await execFileAsync("which", [binary]);
            } catch {
                logger.debug(`Tool '${binary}' not found on PATH, will install check:fix packages`);
                return false;
            }
        }
        logger.debug("All check:fix tools available on PATH, skipping install");
        return true;
    }

    /**
     * Installs only the packages required by checkFix (formatter / linter)
     * instead of the full dependency tree. This is significantly faster for
     * output modes that only need formatting/linting but not a full build.
     */
    public async installCheckFixDependencies(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }
        if (this.checkFixPackages.length === 0) {
            return;
        }

        const pm = createLoggingExecutable(this.packageManager, {
            cwd: this.directory,
            logger
        });

        const startTime = Date.now();
        await (this.packageManager === "yarn"
            ? pm(["add", "--dev", "--ignore-scripts", "--prefer-offline", ...this.checkFixPackages], {
                  env: {
                      YARN_ENABLE_IMMUTABLE_INSTALLS: "false"
                  }
              })
            : pm(["add", "--save-dev", "--ignore-scripts", "--prefer-offline", ...this.checkFixPackages], {
                  env: {
                      PNPM_FROZEN_LOCKFILE: "false"
                  }
              }));
        logger.debug(`[TIMING] installCheckFixDependencies took ${Date.now() - startTime}ms`);
    }

    public async format(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        const pm = createLoggingExecutable(this.packageManager, {
            cwd: this.directory,
            logger,
            doNotPipeOutput: true
        });
        try {
            const startTime = Date.now();
            const result = await pm(this.formatCommand);
            await this.writeToolOutputToLogFile({
                step: "format",
                stdout: result.stdout,
                stderr: result.stderr,
                logger
            });
            logger.debug(`[TIMING] format took ${Date.now() - startTime}ms`);
        } catch (e) {
            const error = e as { stdout?: string; stderr?: string };
            await this.writeToolOutputToLogFile({
                step: "format",
                stdout: error.stdout ?? "",
                stderr: error.stderr ?? "",
                logger
            });
            logger.error(`Failed to format the generated project: ${e}`);
        }
    }

    public async checkFix(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        const pm = createLoggingExecutable(this.packageManager, {
            cwd: this.directory,
            logger,
            reject: false,
            doNotPipeOutput: true
        });
        try {
            const startTime = Date.now();
            const result = await pm(this.checkFixCommand);
            await this.writeToolOutputToLogFile({
                step: "checkFix",
                stdout: result.stdout,
                stderr: result.stderr,
                logger
            });
            logger.debug(`[TIMING] checkFix took ${Date.now() - startTime}ms`);
        } catch (e) {
            const error = e as { stdout?: string; stderr?: string };
            await this.writeToolOutputToLogFile({
                step: "checkFix",
                stdout: error.stdout ?? "",
                stderr: error.stderr ?? "",
                logger
            });
            logger.error(`Failed to format the generated project: ${e}`);
        }
    }

    /**
     * Runs check:fix using `pnpm dlx` to execute the tool directly from
     * the pnpm store, without installing it into node_modules. This is
     * significantly faster than installCheckFixDependencies + checkFix
     * because pnpm dlx:
     * - Only resolves and caches the single tool package (not the full dep tree)
     * - Doesn't modify package.json or the lockfile
     * - Reuses the pnpm store cache across runs
     *
     * Falls back to installCheckFixDependencies + checkFix if:
     * - Multiple check:fix packages are needed
     * - The check:fix script is a compound command (&&, ||, ;)
     */
    public async checkFixViaDlx(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        // Only use dlx for simple single-package cases
        if (this.checkFixPackages.length !== 1 || this.checkFixCommand.length !== 1) {
            logger.debug("checkFixViaDlx: complex config, falling back to install");
            await this.installCheckFixDependencies(logger);
            await this.checkFix(logger);
            return;
        }

        // Read the check:fix script from package.json
        const pkgJsonPath = join(this.directory, RelativeFilePath.of("package.json"));
        let scriptContent: string | undefined;
        try {
            const raw = await readFile(pkgJsonPath, "utf-8");
            const pkgJson = JSON.parse(raw);
            scriptContent = pkgJson.scripts?.[this.checkFixCommand[0]!];
        } catch {
            // Fall through to fallback
        }

        if (typeof scriptContent !== "string" || /[;&|]/.test(scriptContent)) {
            logger.debug("checkFixViaDlx: compound script or missing, falling back to install");
            await this.installCheckFixDependencies(logger);
            await this.checkFix(logger);
            return;
        }

        // Parse: "biome check --fix ..." → ["check", "--fix", ...]
        const args = scriptContent.trim().split(/\s+/).slice(1);
        const pkg = this.checkFixPackages[0]!;

        const startTime = Date.now();
        const pm = createLoggingExecutable("pnpm", {
            cwd: this.directory,
            logger,
            reject: false,
            doNotPipeOutput: true
        });

        try {
            const result = await pm(["dlx", pkg, ...args]);
            await this.writeToolOutputToLogFile({
                step: "checkFixDlx",
                stdout: result.stdout,
                stderr: result.stderr,
                logger
            });
            logger.debug(`[TIMING] checkFixViaDlx took ${Date.now() - startTime}ms`);
        } catch (e) {
            const error = e as { stdout?: string; stderr?: string };
            await this.writeToolOutputToLogFile({
                step: "checkFixDlx",
                stdout: error.stdout ?? "",
                stderr: error.stderr ?? "",
                logger
            });
            logger.warn(`checkFixViaDlx failed (${Date.now() - startTime}ms), falling back to install`);
            await this.installCheckFixDependencies(logger);
            await this.checkFix(logger);
        }
    }

    public async build(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        const pm = createLoggingExecutable(this.packageManager, {
            cwd: this.directory,
            logger
        });
        const startTime = Date.now();
        await pm(this.buildCommand);
        logger.debug(`[TIMING] build took ${Date.now() - startTime}ms`);
    }

    public async copyProjectTo({
        destinationPath,
        zipFilename,
        unzipOutput,
        logger
    }: {
        destinationPath: AbsoluteFilePath;
        zipFilename: string;
        unzipOutput?: boolean;
        logger: Logger;
    }): Promise<void> {
        await this.zipDirectoryContents(this.directory, { logger, destinationPath, zipFilename, unzipOutput });
    }

    public async npmPackTo({
        destinationPath,
        zipFilename,
        unzipOutput,
        logger
    }: {
        destinationPath: AbsoluteFilePath;
        zipFilename: string;
        unzipOutput?: boolean;
        logger: Logger;
    }): Promise<void> {
        const npm = createLoggingExecutable("npm", {
            cwd: this.directory,
            logger
        });

        // pack to tmp dir
        const directoryContainingPack = AbsoluteFilePath.of((await tmp.dir()).path);
        await npm(["pack", "--pack-destination", directoryContainingPack]);

        // decompress pack to a new tmp dir
        const directoryContainingPackItems = await readdir(directoryContainingPack);
        const packName = directoryContainingPackItems.find((item) => item.endsWith(".tgz"));
        if (packName == null) {
            throw new Error("Failed to find pack");
        }
        const pathToPack = join(directoryContainingPack, RelativeFilePath.of(packName));
        const directoryOfDecompressedPack = AbsoluteFilePath.of((await tmp.dir()).path);
        await decompress(pathToPack, directoryOfDecompressedPack, {
            strip: 1
        });

        // zip decompressed pack into destination
        await this.zipDirectoryContents(directoryOfDecompressedPack, {
            logger,
            destinationPath,
            zipFilename,
            unzipOutput
        });
    }

    public async copySrcTo({
        destinationPath,
        zipFilename,
        unzipOutput,
        logger
    }: {
        destinationPath: AbsoluteFilePath;
        zipFilename: string;
        unzipOutput?: boolean;
        logger: Logger;
    }): Promise<void> {
        await this.zipDirectoryContents(join(this.directory, this.srcDirectory), {
            logger,
            destinationPath,
            zipFilename,
            unzipOutput
        });
    }

    public async copySrcContentsTo({
        destinationPath,
        zipFilename,
        unzipOutput,
        logger
    }: {
        destinationPath: AbsoluteFilePath;
        zipFilename: string;
        unzipOutput?: boolean;
        logger: Logger;
    }): Promise<void> {
        const srcDirectoryPath = join(this.directory, this.srcDirectory);
        await this.zipDirectoryContents(srcDirectoryPath, {
            logger,
            destinationPath,
            zipFilename,
            unzipOutput
        });
    }

    public async copyDistTo({
        destinationPath,
        zipFilename,
        unzipOutput,
        logger
    }: {
        destinationPath: AbsoluteFilePath;
        zipFilename: string;
        unzipOutput?: boolean;
        logger: Logger;
    }): Promise<void> {
        // Stage dist contents and root documentation files into a temp directory
        // so the output zip includes them alongside the compiled cjs/esm output.
        const stagingDir = AbsoluteFilePath.of((await tmp.dir()).path);
        const distDir = join(this.directory, this.distDirectory);
        const distItems = await readdir(distDir);
        for (const item of distItems) {
            await cp(join(distDir, RelativeFilePath.of(item)), join(stagingDir, RelativeFilePath.of(item)), {
                recursive: true
            });
        }

        const ROOT_FILES_TO_INCLUDE = ["README.md", "reference.md", "CONTRIBUTING.md"];
        for (const filename of ROOT_FILES_TO_INCLUDE) {
            const src = join(this.directory, RelativeFilePath.of(filename));
            try {
                await cp(src, join(stagingDir, RelativeFilePath.of(filename)));
            } catch (e) {
                // File may not exist (e.g. whitelabel skips CONTRIBUTING.md)
                logger.debug(`Skipping ${filename}: ${e}`);
            }
        }

        await this.zipDirectoryContents(stagingDir, {
            logger,
            destinationPath,
            zipFilename,
            unzipOutput
        });
    }

    private async zipDirectoryContents(
        directoryToZip: AbsoluteFilePath,
        {
            destinationPath,
            zipFilename,
            logger,
            unzipOutput
        }: { destinationPath: AbsoluteFilePath; zipFilename: string; logger: Logger; unzipOutput?: boolean }
    ) {
        const zip = createLoggingExecutable("zip", {
            cwd: directoryToZip,
            logger,
            // zip is noisy
            doNotPipeOutput: true
        });
        const destinationZip = join(destinationPath, RelativeFilePath.of(zipFilename));

        const tmpZipLocation = join(AbsoluteFilePath.of((await tmp.dir()).path), RelativeFilePath.of("output.zip"));
        await zip(["-r", tmpZipLocation, ...(await readdir(directoryToZip))]);
        await cp(tmpZipLocation, destinationZip);

        if (unzipOutput) {
            // Unzip the file in the destination directory
            await decompress(destinationZip, destinationPath, {
                strip: 0
            });
            // Clean up (remove) the zip file after successful decompression
            await rm(destinationZip);
        }
    }

    public async publish({
        logger,
        publishInfo,
        dryRun,
        shouldTolerateRepublish,
        version
    }: {
        logger: Logger;
        publishInfo: PublishInfo;
        dryRun: boolean;
        shouldTolerateRepublish: boolean;
        version?: string;
    }): Promise<void> {
        const npm = createLoggingExecutable("npm", {
            cwd: this.directory,
            logger
        });

        const parsedRegistryUrl = new URL(publishInfo.registryUrl);
        const registryUrlWithoutProtocol = `${parsedRegistryUrl.host}${parsedRegistryUrl.pathname}`;

        await npm(["config", "set", `//${registryUrlWithoutProtocol}:_authToken`, publishInfo.token], {
            secrets: [registryUrlWithoutProtocol, publishInfo.token]
        });

        const publishCommand = ["publish", "--registry", publishInfo.registryUrl];

        // npm 10.9+ requires --tag when publishing prerelease versions (e.g. 0.0.1-preview.123)
        if (version != null && version.includes("-")) {
            publishCommand.push("--tag", "preview");
        }

        if (dryRun) {
            publishCommand.push("--dry-run");
        }
        if (shouldTolerateRepublish) {
            publishCommand.push("--tolerate-republish");
        }
        const startTime = Date.now();
        await npm(publishCommand, {
            secrets: [publishInfo.registryUrl]
        });
        logger.debug(`[TIMING] publish took ${Date.now() - startTime}ms`);
    }

    public async deleteGitIgnoredFiles(logger: Logger): Promise<void> {
        // Instead of spawning 5 git sub-processes (init, config, add, commit, clean)
        // + rm .git, parse .gitignore and directly remove matching entries.
        const gitignorePath = join(this.directory, RelativeFilePath.of(".gitignore"));
        let gitignoreContent: string;
        try {
            gitignoreContent = await readFile(gitignorePath, "utf-8");
        } catch {
            logger.debug("No .gitignore found, nothing to clean");
            return;
        }

        const entries = await readdir(this.directory, { withFileTypes: true });
        const patterns = gitignoreContent
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && !line.startsWith("#") && !line.startsWith("!"));

        const toRemove: string[] = [];
        for (const entry of entries) {
            const name = entry.name;
            for (const pattern of patterns) {
                // Strip leading / and trailing / from pattern for matching
                const cleanPattern = pattern.replace(/^\//, "").replace(/\/$/, "");
                if (name === cleanPattern) {
                    toRemove.push(name);
                    break;
                }
                // Handle glob patterns like *.d.ts or .pnp.*
                if (cleanPattern.includes("*")) {
                    const regex = new RegExp("^" + cleanPattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$");
                    if (regex.test(name)) {
                        toRemove.push(name);
                        break;
                    }
                }
            }
        }

        await Promise.all(
            toRemove.map((name) => {
                logger.debug(`Removing gitignored: ${name}`);
                return rm(join(this.directory, RelativeFilePath.of(name)), {
                    recursive: true,
                    force: true
                });
            })
        );
    }

    private async writeToolOutputToLogFile({
        step,
        stdout,
        stderr,
        logger
    }: {
        step: string;
        stdout: string;
        stderr: string;
        logger: Logger;
    }): Promise<void> {
        const logFilePath = `/tmp/fern-${step}.log`;
        const content = [stdout, stderr].filter(Boolean).join("\n");
        if (content.length > 0) {
            try {
                await writeFile(logFilePath, content);
                logger.debug(`${step} output written to ${logFilePath}`);
            } catch (error) {
                logger.debug(`Failed to write ${step} output to ${logFilePath}: ${error}`);
            }
        }
    }

    public async writeArbitraryFiles(run: (pathToProject: AbsoluteFilePath) => Promise<void>): Promise<void> {
        await run(this.directory);
    }
}
