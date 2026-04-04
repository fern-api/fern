import { AbstractProject, File } from "@fern-api/base-generator";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { BasePhpCustomConfigSchema } from "@fern-api/php-codegen";
import { Eta } from "eta";
import { createWriteStream, existsSync } from "fs";
import { chmod, mkdir, readFile, rename, unlink, writeFile } from "fs/promises";
import type { IncomingMessage } from "http";
import https from "https";
import { cloneDeep, isArray, mergeWith } from "lodash-es";
import os from "os";
import path from "path";
import { pipeline } from "stream/promises";

import { AsIsFiles } from "../AsIs.js";
import { AbstractPhpGeneratorContext } from "../context/AbstractPhpGeneratorContext.js";
import { PhpFile } from "./PhpFile.js";

const eta = new Eta({ autoEscape: false, useWith: true, autoTrim: false });

const AS_IS_DIRECTORY = path.join(__dirname, "asIs");
const CORE_DIRECTORY_NAME = "Core";
const UTILS_DIRECTORY_NAME = "Utils";
const SRC_DIRECTORY_NAME = "src";
const TESTS_DIRECTORY_NAME = "tests";

// https://github.com/composer/spdx-licenses/blob/614a1b86ff628ca7e0713f733ee09f94569548b0/src/SpdxLicenses.php#L317
const CUSTOM_LICENSE_NAME = "LicenseRef-LICENSE";

const COMPOSER_JSON_FILENAME = "composer.json";

const PHP_CS_FIXER_VERSION = "v3.94.2";
const PHP_CS_FIXER_DOWNLOAD_URL = `https://github.com/PHP-CS-Fixer/PHP-CS-Fixer/releases/download/${PHP_CS_FIXER_VERSION}/php-cs-fixer.phar`;

let resolvedPhpCsFixerPath: string | undefined;

async function resolvePhpCsFixer(logger?: {
    debug: (msg: string) => void;
}): Promise<{ command: string; args: string[] }> {
    if (resolvedPhpCsFixerPath != null) {
        if (resolvedPhpCsFixerPath === "php-cs-fixer") {
            return { command: "php-cs-fixer", args: [] };
        }
        return { command: "php", args: [resolvedPhpCsFixerPath] };
    }

    // Check if php-cs-fixer is on PATH
    try {
        const { exitCode } = await loggingExeca(undefined, "php-cs-fixer", ["--version"], {
            doNotPipeOutput: true,
            reject: false
        });
        if (exitCode === 0) {
            resolvedPhpCsFixerPath = "php-cs-fixer";
            return { command: "php-cs-fixer", args: [] };
        }
    } catch (error) {
        logger?.debug(`php-cs-fixer not found on PATH, falling back to download: ${error}`);
    }

    // Download the phar to a cache directory
    const cacheDir = path.join(os.tmpdir(), "fern-php-cs-fixer");
    const pharPath = path.join(cacheDir, `php-cs-fixer-${PHP_CS_FIXER_VERSION}.phar`);

    if (!existsSync(pharPath)) {
        await mkdir(cacheDir, { recursive: true });
        const tmpPath = pharPath + ".tmp";
        try {
            await downloadFile(PHP_CS_FIXER_DOWNLOAD_URL, tmpPath);
            await chmod(tmpPath, 0o755);
            await rename(tmpPath, pharPath);
        } catch (error) {
            // Clean up partial download so next attempt re-downloads
            await unlink(tmpPath).catch(() => {
                // Ignore cleanup errors; the file may not exist
            });
            throw error;
        }
    }

    resolvedPhpCsFixerPath = pharPath;
    return { command: "php", args: [pharPath] };
}

async function downloadFile(url: string, destPath: string): Promise<void> {
    const MAX_REDIRECTS = 10;
    let requestUrl = url;
    for (let redirectCount = 0; ; redirectCount++) {
        if (redirectCount > MAX_REDIRECTS) {
            throw new Error(`Too many redirects (>${MAX_REDIRECTS}) while downloading ${url}`);
        }
        const response = await new Promise<IncomingMessage>((resolve, reject) => {
            https.get(requestUrl, resolve).on("error", reject);
        });
        if (
            response.statusCode != null &&
            response.statusCode >= 300 &&
            response.statusCode < 400 &&
            response.headers.location
        ) {
            response.resume();
            requestUrl = response.headers.location;
            continue;
        }
        if (response.statusCode != null && response.statusCode !== 200) {
            response.resume();
            throw new Error(`Failed to download ${requestUrl}: HTTP ${response.statusCode}`);
        }
        const fileStream = createWriteStream(destPath);
        await pipeline(response, fileStream);
        return;
    }
}

/**
 * In memory representation of a PHP project.
 */
export class PhpProject extends AbstractProject<AbstractPhpGeneratorContext<BasePhpCustomConfigSchema>> {
    private name: string;
    private packagePathPrefix: string;
    private sourceFiles: PhpFile[] = [];
    private testFiles: PhpFile[] = [];
    private coreFiles: File[] = [];
    private coreTestFiles: File[] = [];
    private utilsFiles: File[] = [];
    public readonly filepaths: PhpProjectFilepaths;

    public constructor({
        context,
        name
    }: {
        context: AbstractPhpGeneratorContext<BasePhpCustomConfigSchema>;
        name: string;
    }) {
        super(context);
        this.name = name;
        this.packagePathPrefix = PhpProject.getPackagePathPrefix(this.context.customConfig.packagePath);
        this.filepaths = new PhpProjectFilepaths(this.packagePathPrefix, this.name);
    }

    public addSourceFiles(file: PhpFile): void {
        this.sourceFiles.push(file);
    }

    public addTestFiles(file: PhpFile): void {
        this.testFiles.push(file);
    }

    public addCoreFiles(file: File): void {
        this.coreFiles.push(file);
    }

    public async persist(): Promise<void> {
        await this.createRawFiles();
        await this.createSourceDirectory();
        await this.createTestsDirectory();
        await this.createCoreDirectory();
        await this.createCoreTestsDirectory();
        await this.createUtilsDirectory();
        await this.createGitHubWorkflowsDirectory();
        await this.createComposerJson();
    }

    private static getPackagePathPrefix(packagePath?: string): string {
        if (!packagePath) {
            return "";
        }
        if (!packagePath.endsWith("/")) {
            packagePath += "/";
        }
        if (!packagePath.startsWith("/")) {
            packagePath = "/" + packagePath;
        }
        return packagePath;
    }

    private async createComposerJson(): Promise<void> {
        const composerJson = new ComposerJson({
            projectName: this.name,
            license: this.context.config.license?._visit({
                basic: (val) => {
                    return val.id;
                },
                custom: () => CUSTOM_LICENSE_NAME,
                _other: () => undefined
            }),
            context: this.context,
            packagePathPrefix: this.packagePathPrefix
        });
        const composerJsonContent = composerJson.toString();
        await writeFile(
            join(this.absolutePathToOutputDirectory, RelativeFilePath.of(COMPOSER_JSON_FILENAME)),
            composerJsonContent
        );
    }

    private async createRawFiles(): Promise<void> {
        for (const filename of this.context.getRawAsIsFiles()) {
            this.addRawFiles(await this.createRawAsIsFile({ filename }));
        }
        await this.writeRawFiles();
    }

    private async createRawAsIsFile({ filename }: { filename: string }): Promise<File> {
        const contents = (await readFile(getAsIsFilepath(filename))).toString();
        return new File(filename, RelativeFilePath.of(""), contents);
    }

    private async createAsIsFile({
        filename,
        namespace,
        extraTemplateVars
    }: {
        filename: string;
        namespace: string;
        extraTemplateVars?: Record<string, string>;
    }): Promise<File> {
        const contents = (await readFile(getAsIsFilepath(filename))).toString();

        return new File(
            filename.replace(".Template", ""),
            RelativeFilePath.of(""),
            this.replaceTemplate({
                contents,
                namespace: this.getNestedNamespace({ namespace, filename }),
                extraTemplateVars
            })
        );
    }

    private async createGitHubWorkflowsDirectory(): Promise<void> {
        const githubWorkflow = (await readFile(getAsIsFilepath(AsIsFiles.GithubCiYml))).toString();
        const githubWorkflowsDirectoryPath = join(
            this.absolutePathToOutputDirectory,
            RelativeFilePath.of(".github/workflows")
        );
        await this.mkdir(githubWorkflowsDirectoryPath);
        await writeFile(join(githubWorkflowsDirectoryPath, RelativeFilePath.of("ci.yml")), githubWorkflow);
    }

    private async createSourceDirectory(): Promise<AbsoluteFilePath> {
        return await this.createPhpDirectory({
            absolutePathToDirectory: join(this.absolutePathToOutputDirectory, this.filepaths.getSourceDirectory()),
            files: this.sourceFiles
        });
    }

    private async createTestsDirectory(): Promise<AbsoluteFilePath> {
        return await this.createPhpDirectory({
            absolutePathToDirectory: join(this.absolutePathToOutputDirectory, this.filepaths.getTestsDirectory()),
            files: this.testFiles
        });
    }

    private async createCoreDirectory(): Promise<AbsoluteFilePath> {
        for (const filename of this.context.getCoreAsIsFiles()) {
            this.coreFiles.push(
                await this.createAsIsFile({
                    filename,
                    namespace: this.context.getCoreNamespace(),
                    extraTemplateVars: this.context.getExtraTemplateVarsForFile(filename)
                })
            );
        }
        return await this.createPhpDirectory({
            absolutePathToDirectory: join(this.absolutePathToOutputDirectory, this.filepaths.getCoreDirectory()),
            files: this.coreFiles
        });
    }

    private async createCoreTestsDirectory(): Promise<AbsoluteFilePath> {
        for (const filename of this.context.getCoreTestAsIsFiles()) {
            this.coreTestFiles.push(
                await this.createAsIsFile({
                    filename,
                    namespace: this.context.getCoreTestsNamespace()
                })
            );
        }
        return await this.createPhpDirectory({
            absolutePathToDirectory: join(this.absolutePathToOutputDirectory, this.filepaths.getCoreTestsDirectory()),
            files: this.coreTestFiles
        });
    }

    private async createUtilsDirectory(): Promise<AbsoluteFilePath> {
        for (const filename of this.context.getUtilsAsIsFiles()) {
            this.utilsFiles.push(
                await this.createAsIsFile({
                    filename,
                    namespace: this.context.getUtilsTypesNamespace()
                })
            );
        }
        return await this.createPhpDirectory({
            absolutePathToDirectory: join(this.absolutePathToOutputDirectory, this.filepaths.getUtilsDirectory()),
            files: this.utilsFiles
        });
    }

    private getNestedNamespace({ namespace, filename }: { namespace: string; filename: string }): string {
        const parts = filename.split("/");
        if (parts.length <= 1) {
            return namespace;
        }
        return [namespace, ...parts.slice(0, -1)].join("\\");
    }

    private async createPhpDirectory({
        absolutePathToDirectory,
        files
    }: {
        absolutePathToDirectory: AbsoluteFilePath;
        files: File[];
    }): Promise<AbsoluteFilePath> {
        await this.mkdir(absolutePathToDirectory);
        await Promise.all(files.map(async (file) => await file.write(absolutePathToDirectory)));
        if (files.length > 0) {
            const { command, args } = await resolvePhpCsFixer(this.context.logger);
            await loggingExeca(this.context.logger, command, [...args, "fix", ".", "--no-interaction"], {
                doNotPipeOutput: true,
                cwd: absolutePathToDirectory
            });
        }
        return absolutePathToDirectory;
    }

    private async mkdir(absolutePathToDirectory: AbsoluteFilePath): Promise<void> {
        this.context.logger.debug(`mkdir ${absolutePathToDirectory}`);
        await mkdir(absolutePathToDirectory, { recursive: true });
    }

    private replaceTemplate({
        contents,
        namespace,
        extraTemplateVars
    }: {
        contents: string;
        namespace: string;
        extraTemplateVars?: Record<string, string>;
    }): string {
        return eta.renderString(contents, {
            namespace,
            coreNamespace: this.context.getCoreNamespace(),
            ...extraTemplateVars
        });
    }
}

class PhpProjectFilepaths {
    constructor(
        private readonly packagePathPrefix: string,
        private readonly name: string
    ) {}

    public getProjectDirectory(): RelativeFilePath {
        return RelativeFilePath.of(this.packagePathPrefix + this.name);
    }

    public getSourceDirectory(): RelativeFilePath {
        return RelativeFilePath.of(SRC_DIRECTORY_NAME + this.packagePathPrefix);
    }

    public getTestsDirectory(): RelativeFilePath {
        return RelativeFilePath.of(TESTS_DIRECTORY_NAME + this.packagePathPrefix);
    }

    public getCoreDirectory(): RelativeFilePath {
        return join(this.getSourceDirectory(), RelativeFilePath.of(CORE_DIRECTORY_NAME));
    }

    public getCoreTestsDirectory(): RelativeFilePath {
        return join(this.getTestsDirectory(), RelativeFilePath.of(CORE_DIRECTORY_NAME));
    }

    public getUtilsDirectory(): RelativeFilePath {
        return join(this.getSourceDirectory(), RelativeFilePath.of(UTILS_DIRECTORY_NAME));
    }
}

declare namespace ComposerJson {
    interface Args {
        context: AbstractPhpGeneratorContext<BasePhpCustomConfigSchema>;
        projectName: string;
        license?: string;
        packagePathPrefix: string;
    }
}

class ComposerJson {
    private context: AbstractPhpGeneratorContext<BasePhpCustomConfigSchema>;
    private projectName: string;
    private license: string | undefined;
    private packagePathPrefix: string;

    public constructor({ context, projectName, license, packagePathPrefix }: ComposerJson.Args) {
        this.context = context;
        this.projectName = projectName;
        this.license = license;
        this.packagePathPrefix = this.context.customConfig.packagePath ? packagePathPrefix : "/";
    }

    private build(): Record<string, unknown> {
        let composerJson: Record<string, unknown> = {
            name: this.context.getPackageName(),
            version: this.context.version ?? "0.0.0",
            description: `${this.projectName} PHP Library`,
            keywords: [this.context.config.organization, "api", "sdk"],
            license: this.license ?? [],
            require: {
                php: "^8.1",
                "ext-json": "*",
                "psr/http-client": "^1.0",
                "psr/http-client-implementation": "^1.0",
                "psr/http-factory": "^1.0",
                "psr/http-factory-implementation": "^1.0",
                "psr/http-message": "^1.1 || ^2.0",
                "php-http/discovery": "^1.0",
                "php-http/multipart-stream-builder": "^1.0"
            },
            "require-dev": {
                "phpunit/phpunit": "^9.0",
                "friendsofphp/php-cs-fixer": "3.5.0",
                "phpstan/phpstan": "^1.12",
                "guzzlehttp/guzzle": "^7.4"
            },
            autoload: {
                "psr-4": {
                    [`${this.projectName}\\`]: `${SRC_DIRECTORY_NAME}` + this.packagePathPrefix
                }
            },
            "autoload-dev": {
                "psr-4": {
                    [`${this.projectName}\\Tests\\`]: `${TESTS_DIRECTORY_NAME}` + this.packagePathPrefix
                }
            },
            scripts: {
                build: [`@php -l ${SRC_DIRECTORY_NAME}`, `@php -l ${TESTS_DIRECTORY_NAME}`],
                test: "phpunit",
                analyze: "phpstan analyze src tests --memory-limit=1G"
            }
        };
        composerJson = mergeExtraConfigs(composerJson, this.context.customConfig.composerJson);
        return composerJson;
    }

    public toString(): string {
        return JSON.stringify(this.build(), null, 2);
    }
}

function getAsIsFilepath(filename: string): string {
    return AbsoluteFilePath.of(path.join(AS_IS_DIRECTORY, filename));
}

export function mergeExtraConfigs(
    composerJson: Record<string, unknown>,
    extraConfigs: Record<string, unknown> | undefined
): Record<string, unknown> {
    function customizer(objValue: unknown, srcValue: unknown) {
        if (isArray(objValue) && isArray(srcValue)) {
            return [...new Set(srcValue.concat(objValue))];
        } else if (typeof objValue === "object" && typeof srcValue === "object") {
            return {
                ...objValue,
                ...srcValue
            };
        } else {
            return srcValue;
        }
    }

    return mergeWith(cloneDeep(composerJson), extraConfigs ?? {}, customizer);
}
