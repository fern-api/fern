import { AbstractProject } from "@fern-api/base-generator";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { BaseRustCustomConfigSchema } from "@fern-api/rust-codegen";
import { mkdir } from "fs/promises";
import { AbstractRustGeneratorContext } from "../context/AbstractRustGeneratorContext";
import { RustFile } from "./RustFile";

const SRC_DIRECTORY_NAME = "src";

export interface RustProjectConfig {
    context: AbstractRustGeneratorContext<BaseRustCustomConfigSchema>;
    packageName: string;
    packageVersion: string;
    clientClassName: string;
}

export class RustProject extends AbstractProject<AbstractRustGeneratorContext<BaseRustCustomConfigSchema>> {
    private packageName: string;
    private packageVersion: string;
    private clientClassName: string;
    private sourceFiles: RustFile[] = [];

    public constructor({ context, packageName, packageVersion, clientClassName }: RustProjectConfig) {
        super(context);
        this.packageName = packageName;
        this.packageVersion = packageVersion;
        this.clientClassName = clientClassName;
    }

    public get sourceFileDirectory(): RelativeFilePath {
        return RelativeFilePath.of(SRC_DIRECTORY_NAME);
    }

    public addSourceFiles(...files: RustFile[]): void {
        this.sourceFiles.push(...files);
    }

    public async persist(): Promise<void> {
        // Create source directory
        const absolutePathToSrcDirectory = join(this.absolutePathToOutputDirectory, this.sourceFileDirectory);
        this.context.logger.debug(`mkdir ${absolutePathToSrcDirectory}`);
        await mkdir(absolutePathToSrcDirectory, { recursive: true });

        // Write all template files (both source and project-level)
        await this.persistStaticSourceFiles();

        // Write all dynamic source files
        await Promise.all(this.sourceFiles.map((file) => file.write(this.absolutePathToOutputDirectory)));
    }

    private async persistStaticSourceFiles(): Promise<void> {
        const { context, absolutePathToOutputDirectory } = this;
        await Promise.all(
            context.getCoreAsIsFiles().map(async (def) => {
                let fileContents = await def.loadContents();

                // Replace template variables
                fileContents = this.replaceTemplateVariables(fileContents);

                const rustFile = new RustFile({
                    filename: def.filename,
                    directory: def.directory,
                    fileContents
                });
                await rustFile.write(absolutePathToOutputDirectory);
            })
        );
    }

    private replaceTemplateVariables(content: string): string {
        // Replace CLIENT_NAME template variable (using the configured client class name)
        content = content.replace(/\{\{CLIENT_NAME\}\}/g, this.clientClassName);

        // Replace project-level template variables
        content = content.replace(/\{\{PACKAGE_NAME\}\}/g, this.packageName);
        content = content.replace(/\{\{PACKAGE_VERSION\}\}/g, this.packageVersion);

        // Replace dependency template variables
        content = content.replace(/\{\{EXTRA_DEPENDENCIES\}\}/g, this.generateExtraDependencies());
        content = content.replace(/\{\{EXTRA_DEV_DEPENDENCIES\}\}/g, this.generateExtraDevDependencies());

        return content;
    }

    private generateExtraDependencies(): string {
        const extraDeps = this.context.customConfig.extraDependencies || {};
        if (Object.keys(extraDeps).length === 0) {
            return "";
        }

        let result = "";
        for (const [name, config] of Object.entries(extraDeps)) {
            if (typeof config === "string") {
                result += `${name} = "${config}"\n`;
            } else {
                result += `${name} = ${this.objectToToml(config)}\n`;
            }
        }
        return result;
    }

    private generateExtraDevDependencies(): string {
        const extraDevDeps = this.context.customConfig.extraDevDependencies || {};
        if (Object.keys(extraDevDeps).length === 0) {
            return "";
        }

        let result = "";
        for (const [name, version] of Object.entries(extraDevDeps)) {
            result += `${name} = "${version}"\n`;
        }
        return result;
    }

    private objectToToml(obj: unknown): string {
        if (typeof obj === "string") {
            return `"${obj}"`;
        }
        if (Array.isArray(obj)) {
            return `[${obj.map((item) => `"${item}"`).join(", ")}]`;
        }
        if (typeof obj === "object" && obj !== null) {
            const pairs = Object.entries(obj).map(([key, value]) => {
                if (typeof value === "string") {
                    return `${key} = "${value}"`;
                } else if (Array.isArray(value)) {
                    return `${key} = [${value.map((item) => `"${item}"`).join(", ")}]`;
                } else {
                    return `${key} = ${this.objectToToml(value)}`;
                }
            });
            return `{ ${pairs.join(", ")} }`;
        }
        return String(obj);
    }
}
