import { AbstractProject, File } from "@fern-api/base-generator";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FernFilepath, Name } from "@fern-fern/ir-sdk/api";
import { mkdir, readFile, writeFile } from "fs/promises";
import { capitalize, kebabCase } from "lodash-es";
import path from "path";

import { Logger } from "../../../../../packages/cli/logger/src/Logger";
import { AbstractTypescriptMcpGeneratorContext } from "../context/AbstractTypescriptMcpGeneratorContext";

const AS_IS_DIRECTORY = path.join(__dirname, "asIs");
const DIST_DIRECTORY_NAME = "dist";
const SRC_DIRECTORY_NAME = "src";
const SCHEMAS_DIRECTORY_NAME = "schemas";
const TOOLS_DIRECTORY_NAME = "tools";

const PACKAGE_JSON_FILENAME = "package.json";

/**
 * In memory representation of a typescript project.
 */
export class TypescriptMcpProject extends AbstractProject<
    AbstractTypescriptMcpGeneratorContext<TypescriptCustomConfigSchema>
> {
    private sourceFiles: File[] = [];
    private schemasFiles: File[] = [];
    private toolsFiles: File[] = [];
    public readonly filepaths: TypescriptMcpProjectFilepaths;

    public readonly builder: TypescriptMcpProjectBuilder;
    private packageJson: PackageJson;

    public constructor({ context }: { context: AbstractTypescriptMcpGeneratorContext<TypescriptCustomConfigSchema> }) {
        super(context);
        this.filepaths = new TypescriptMcpProjectFilepaths();
        this.builder = new TypescriptMcpProjectBuilder({ context });
        this.packageJson = new PackageJson({ context });
    }

    public addSrcFile(file: File): void {
        this.sourceFiles.push(file);
    }

    public addSchemasFile(file: File): void {
        this.schemasFiles.push(file);
    }

    public addToolsFile(file: File): void {
        this.toolsFiles.push(file);
    }

    public async persist(): Promise<void> {
        this.context.logger.debug(`Writing typescript project files to ${this.absolutePathToOutputDirectory}`);
        await this.createRawFiles();
        await this.createPackageJson();
        await this.createSrcDirectory();
        await this.createSchemasDirectory();
        await this.createToolsDirectory();
        await this.installDependencies(this.context.logger);
        this.context.logger.debug(
            `Successfully wrote typescript project files to ${this.absolutePathToOutputDirectory}`
        );
    }

    private async installDependencies(logger: Logger): Promise<void> {
        const npm = createLoggingExecutable("npm", {
            cwd: this.absolutePathToOutputDirectory,
            logger
        });

        await npm(["install"]);
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

    private async createPackageJson(): Promise<void> {
        const packageJsonContent = this.packageJson.toString();
        await writeFile(
            join(this.absolutePathToOutputDirectory, RelativeFilePath.of(PACKAGE_JSON_FILENAME)),
            packageJsonContent
        );
    }

    private async createSrcDirectory(): Promise<AbsoluteFilePath> {
        return await this.createTypescriptMcpDirectory({
            absolutePathToDirectory: join(this.absolutePathToOutputDirectory, this.filepaths.getSrcDirectory()),
            files: this.sourceFiles
        });
    }

    private async createSchemasDirectory(): Promise<AbsoluteFilePath> {
        return await this.createTypescriptMcpDirectory({
            absolutePathToDirectory: join(this.absolutePathToOutputDirectory, this.filepaths.getSchemasDirectory()),
            files: this.schemasFiles
        });
    }

    private async createToolsDirectory(): Promise<AbsoluteFilePath> {
        return await this.createTypescriptMcpDirectory({
            absolutePathToDirectory: join(this.absolutePathToOutputDirectory, this.filepaths.getToolsDirectory()),
            files: this.toolsFiles
        });
    }

    private async createTypescriptMcpDirectory({
        absolutePathToDirectory,
        files
    }: {
        absolutePathToDirectory: AbsoluteFilePath;
        files: File[];
    }): Promise<AbsoluteFilePath> {
        await this.mkdir(absolutePathToDirectory);
        await Promise.all(files.map(async (file) => await file.write(absolutePathToDirectory)));
        return absolutePathToDirectory;
    }

    private async mkdir(absolutePathToDirectory: AbsoluteFilePath): Promise<void> {
        this.context.logger.debug(`mkdir ${absolutePathToDirectory}`);
        await mkdir(absolutePathToDirectory, { recursive: true });
    }
}

class TypescriptMcpProjectFilepaths {
    public getSrcDirectory(): RelativeFilePath {
        return RelativeFilePath.of(SRC_DIRECTORY_NAME);
    }

    public getSchemasDirectory(): RelativeFilePath {
        return join(this.getSrcDirectory(), RelativeFilePath.of(SCHEMAS_DIRECTORY_NAME));
    }

    public getToolsDirectory(): RelativeFilePath {
        return join(this.getSrcDirectory(), RelativeFilePath.of(TOOLS_DIRECTORY_NAME));
    }
}

declare namespace TypescriptMcpProjectBuilder {
    interface Args {
        context: AbstractTypescriptMcpGeneratorContext<TypescriptCustomConfigSchema>;
    }
}

class TypescriptMcpProjectBuilder {
    public readonly packageName: string;
    public readonly description: string;
    public readonly sdkModuleName: string;
    public readonly sdkClientClassName: string;
    public readonly zodReference: ts.Reference;

    constructor({ context }: TypescriptMcpProjectBuilder.Args) {
        const { organization, workspaceName } = context.config;
        this.packageName = context.publishConfig?.packageName ?? `${organization}-mcp-server`;
        this.description = `Model Context Protocol (MCP) server for ${organization}'s ${workspaceName}.`;
        this.sdkModuleName = this.getSdkModuleName(organization, workspaceName);
        this.sdkClientClassName = this.getSdkClientClassName(organization, workspaceName);
        this.zodReference = ts.reference({
            name: "z",
            importFrom: { type: "default", moduleName: "zod" }
        });
    }

    private getSdkModuleName(organization: string, workspaceName: string): string {
        return `${kebabCase(organization)}-${kebabCase(workspaceName)}`;
    }

    private getSdkClientClassName(organization: string, workspaceName: string): string {
        return `${capitalize(organization)}${capitalize(workspaceName)}Client`;
    }

    public getSdkMethodPath(name: Name, fernFilepath?: FernFilepath): string {
        const parts = [...(fernFilepath?.allParts ?? []), name].map((part) => part.camelCase.unsafeName);
        return parts.join(".");
    }

    public getSchemaVariableName(name: Name, fernFilepath?: FernFilepath): string {
        const parts = [...(fernFilepath?.allParts ?? []), name].map((part) => part.pascalCase.safeName);
        return parts.join("");
    }

    public getToolVariableName(name: Name, fernFilepath?: FernFilepath): string {
        const parts = [...(fernFilepath?.allParts ?? []), name].map((part, index) =>
            index === 0 ? part.camelCase.safeName : part.pascalCase.safeName
        );
        return parts.join("");
    }

    public getToolName(name: Name, fernFilepath?: FernFilepath): string {
        const parts = [...(fernFilepath?.allParts ?? []), name].map((part) => part.snakeCase.safeName);
        return parts.join("_");
    }
}

declare namespace PackageJson {
    interface Args {
        context: AbstractTypescriptMcpGeneratorContext<TypescriptCustomConfigSchema>;
    }
}

class PackageJson {
    private context: AbstractTypescriptMcpGeneratorContext<TypescriptCustomConfigSchema>;

    public constructor({ context }: PackageJson.Args) {
        this.context = context;
    }

    private build(): Record<string, unknown> {
        const packageJson: Record<string, unknown> = {
            name: this.context.project.builder.packageName,
            description: this.context.project.builder.description,
            version: this.context.version ?? "0.0.0",
            keywords: [this.context.config.organization, "mcp", "server"],
            bin: `${DIST_DIRECTORY_NAME}/index.js`,
            files: [DIST_DIRECTORY_NAME],
            scripts: {
                preinstall: "cd sdk && npm run build && npm run prepack",
                dev: `concurrently 'npm run build:watch' 'nodemon --env-file=.env -q --watch ${DIST_DIRECTORY_NAME} ${DIST_DIRECTORY_NAME}/index.js'`,
                build: `tsdown ${SRC_DIRECTORY_NAME}/index.ts --dts --clean`,
                "build:watch": `tsdown ${SRC_DIRECTORY_NAME}/index.ts --dts --watch`,
                test: "jest"
            },
            dependencies: {
                "@modelcontextprotocol/sdk": "^1.8.0",
                [this.context.project.builder.sdkModuleName]: "file:./sdk",
                zod: "^3.24.2"
            },
            devDependencies: {
                "@types/jest": "^29.5.14",
                "@types/node": "^22.13.13",
                concurrently: "^9.1.2",
                jest: "^29.7.0",
                nodemon: "^3.1.9",
                "ts-jest": "^29.3.1",
                tsdown: "^0.15.3",
                typescript: "^5.8.2"
            }
        };
        return packageJson;
    }

    public toString(): string {
        return JSON.stringify(this.build(), null, 2);
    }
}

function getAsIsFilepath(filename: string): string {
    return AbsoluteFilePath.of(path.join(AS_IS_DIRECTORY, filename));
}
