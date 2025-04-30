import { mkdir, readFile, writeFile } from "fs/promises";
import { cloneDeep, isArray, mergeWith } from "lodash-es";
import path from "path";

import { AbstractProject, File } from "@fern-api/base-generator";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast";

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

    public constructor({ context }: { context: AbstractTypescriptMcpGeneratorContext<TypescriptCustomConfigSchema> }) {
        super(context);
        this.filepaths = new TypescriptMcpProjectFilepaths();
    }

    public addSrcFiles(file: File): void {
        this.sourceFiles.push(file);
    }

    public addSchemasFiles(file: File): void {
        this.schemasFiles.push(file);
    }

    public addToolsFiles(file: File): void {
        this.toolsFiles.push(file);
    }

    public async persist(): Promise<void> {
        this.context.logger.debug(`Writing typescript project files to ${this.absolutePathToOutputDirectory}`);
        await this.createRawFiles();
        await this.createPackageJson();
        await this.createSrcDirectory();
        await this.createSchemasDirectory();
        await this.createToolsDirectory();
        this.context.logger.debug(
            `Successfully wrote typescript project files to ${this.absolutePathToOutputDirectory}`
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

    private async createPackageJson(): Promise<void> {
        const packageJson = new PackageJson({
            context: this.context
        });
        const packageJsonContent = packageJson.toString();
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
    constructor() {}

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
        let packageJson: Record<string, unknown> = {
            ...this.context.customConfig.packageJson,
            name: `@${this.context.config.organization}/${this.context.config.organization}-mcp-server`,
            description: `Model Context Protocol (MCP) server for ${this.context.config.organization}.`,
            version: this.context.version ?? "0.0.0",
            keywords: [this.context.config.organization, "mcp", "server"],
            bin: `${DIST_DIRECTORY_NAME}/index.js`,
            files: [DIST_DIRECTORY_NAME],
            scripts: {
                dev: `concurrently 'npm run build:watch' 'nodemon --env-file=.env -q --watch ${DIST_DIRECTORY_NAME} ${DIST_DIRECTORY_NAME}/index.js'`,
                build: `tsup ${SRC_DIRECTORY_NAME}/index.ts --dts --clean`,
                "build:watch": `tsup ${SRC_DIRECTORY_NAME}/index.ts --dts --watch`,
                test: "jest"
            },
            dependencies: {
                "@modelcontextprotocol/sdk": "^1.8.0",
                zod: "^3.24.2"
            },
            devDependencies: {
                "@types/jest": "^29.5.14",
                "@types/node": "^22.13.13",
                concurrently: "^9.1.2",
                jest: "^29.7.0",
                nodemon: "^3.1.9",
                "ts-jest": "^29.3.1",
                tsup: "^8.4.0",
                typescript: "^5.8.2"
            }
        };
        packageJson = mergeExtraConfigs(packageJson, this.context.customConfig.packageJson);
        return packageJson;
    }

    public toString(): string {
        return JSON.stringify(this.build(), null, 2);
    }
}

function getAsIsFilepath(filename: string): string {
    return AbsoluteFilePath.of(path.join(AS_IS_DIRECTORY, filename));
}

export function mergeExtraConfigs(
    packageJson: Record<string, unknown>,
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

    return mergeWith(cloneDeep(packageJson), extraConfigs ?? {}, customizer);
}
