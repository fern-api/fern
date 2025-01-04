import { mkdir, readFile, writeFile } from "fs/promises";
import { template } from "lodash-es";
import path from "path";

import { AbstractProject, File } from "@fern-api/base-generator";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";

import { AsIsFiles } from "../AsIs";
import { AbstractPhpGeneratorContext } from "../context/AbstractPhpGeneratorContext";
import { BasePhpCustomConfigSchema } from "../custom-config/BasePhpCustomConfigSchema";
import { PhpFile } from "./PhpFile";

const AS_IS_DIRECTORY = path.join(__dirname, "asIs");
const CORE_DIRECTORY_NAME = "Core";
const UTILS_DIRECTORY_NAME = "Utils";
const SRC_DIRECTORY_NAME = "src";
const TESTS_DIRECTORY_NAME = "tests";

const COMPOSER_JSON_FILENAME = "composer.json";

/**
 * In memory representation of a PHP project.
 */
export class PhpProject extends AbstractProject<AbstractPhpGeneratorContext<BasePhpCustomConfigSchema>> {
    private name: string;
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
        this.filepaths = new PhpProjectFilepaths(this.name);
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

    private async createComposerJson(): Promise<void> {
        const composerJson = new ComposerJson({
            projectName: this.name,
            license: this.context.config.license?._visit({
                basic: (val) => {
                    return val.id;
                },
                custom: () => undefined, // composer doesn't support custom license filepaths.
                _other: () => undefined
            }),
            context: this.context
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

    private async createAsIsFile({ filename, namespace }: { filename: string; namespace: string }): Promise<File> {
        const contents = (await readFile(getAsIsFilepath(filename))).toString();

        return new File(
            filename.replace(".Template", ""),
            RelativeFilePath.of(""),
            this.replaceTemplate({
                contents,
                namespace: this.getNestedNamespace({ namespace, filename })
            })
        );
    }

    private async createGitHubWorkflowsDirectory(): Promise<void> {
        const githubWorkflowTemplate = (await readFile(getAsIsFilepath(AsIsFiles.GithubCiYml))).toString();
        const githubWorkflow = template(githubWorkflowTemplate)(/* TODO: Add publish job */).replaceAll("\\{", "{");
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
                    namespace: this.context.getCoreNamespace()
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
            await loggingExeca(this.context.logger, "php-cs-fixer", ["fix", "."], {
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

    private replaceTemplate({ contents, namespace }: { contents: string; namespace: string }): string {
        return template(contents)({
            namespace,
            coreNamespace: this.context.getCoreNamespace()
        });
    }
}

class PhpProjectFilepaths {
    constructor(private readonly name: string) {}

    public getProjectDirectory(): RelativeFilePath {
        return RelativeFilePath.of(this.name);
    }

    public getSourceDirectory(): RelativeFilePath {
        return RelativeFilePath.of(SRC_DIRECTORY_NAME);
    }

    public getTestsDirectory(): RelativeFilePath {
        return RelativeFilePath.of(TESTS_DIRECTORY_NAME);
    }

    public getCoreDirectory(): RelativeFilePath {
        return join(this.getSourceDirectory(), RelativeFilePath.of(CORE_DIRECTORY_NAME));
    }

    public getCoreTestsDirectory(): RelativeFilePath {
        return join(this.getTestsDirectory(), this.getProjectDirectory(), RelativeFilePath.of(CORE_DIRECTORY_NAME));
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
    }
}

class ComposerJson {
    private context: AbstractPhpGeneratorContext<BasePhpCustomConfigSchema>;
    private projectName: string;
    private license: string | undefined;

    public constructor({ context, projectName, license }: ComposerJson.Args) {
        this.context = context;
        this.projectName = projectName;
        this.license = license;
    }

    public toString(): string {
        const composerProjectName = `${this.context.config.organization}/${this.context.config.organization}`;
        return `
{
  "name": "${composerProjectName}",
  "version": ${this.context.version != null ? `"${this.context.version}"` : '"0.0.0"'},
  "description": "${this.projectName} PHP Library",
  "keywords": [
    "${this.context.config.organization}",
    "api",
    "sdk"
  ],
  "license": ${this.license != null ? `[\n    "${this.license}"\n  ]` : "[]"},
  "require": {
    "php": "^8.1",
    "ext-json": "*",
    "guzzlehttp/guzzle": "^7.9"
  },
  "require-dev": {
    "phpunit/phpunit": "^9.0",
    "friendsofphp/php-cs-fixer": "3.5.0",
    "phpstan/phpstan": "^1.12"
  },
  "autoload": {
    "psr-4": {
      "${this.projectName}\\\\": "${SRC_DIRECTORY_NAME}/"
    }
  },
  "autoload-dev": {
    "psr-4": {
      "\\\\${this.projectName}\\\\Tests\\\\": "${TESTS_DIRECTORY_NAME}/"
    }
  },
  "scripts": {
    "build": [
      "@php -l ${SRC_DIRECTORY_NAME}",
      "@php -l ${TESTS_DIRECTORY_NAME}"
    ],
    "test": "phpunit",
    "analyze": "phpstan analyze src tests"
  }
}
`;
    }
}

function getAsIsFilepath(filename: string): string {
    return AbsoluteFilePath.of(path.join(AS_IS_DIRECTORY, filename));
}
