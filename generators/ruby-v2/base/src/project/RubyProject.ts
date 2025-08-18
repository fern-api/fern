import { AbstractProject, File } from "@fern-api/base-generator";
import { AbsoluteFilePath, join, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { BaseRubyCustomConfigSchema } from "@fern-api/ruby-ast";
import { TypeDeclaration } from "@fern-fern/ir-sdk/api";
import dedent from "dedent";
import { mkdir, readFile, writeFile } from "fs/promises";
import { template } from "lodash-es";
import { join as pathJoin } from "path";
import { AbstractRubyGeneratorContext } from "../context/AbstractRubyGeneratorContext";

const GEMFILE_FILENAME = "Gemfile";
const RAKEFILE_FILENAME = "Rakefile";

/**
 * In memory representation of a Ruby project.
 */
export class RubyProject extends AbstractProject<AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>> {
    private coreFiles: File[] = [];
    private rubyContext: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;

    public constructor({ context }: { context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema> }) {
        super(context);
        this.rubyContext = context;
    }

    public async persist(): Promise<void> {
        await this.createGemfile();
        await this.createRakefile();
        await this.writeRawFiles();
        await this.createAsIsFiles();
        await this.writeAsIsFiles();
        await this.createModuleFile();
    }

    private async createGemfile(): Promise<void> {
        const gemfile = new Gemfile({ context: this.context });
        this.context.logger.debug(`Gemfile base path ${this.absolutePathToOutputDirectory}`);
        this.context.logger.debug(`Gemfile filename ${GEMFILE_FILENAME}`);
        this.context.logger.debug(`Gemfile filename relative ${RelativeFilePath.of(GEMFILE_FILENAME)}`);
        await writeFile(
            join(this.absolutePathToOutputDirectory, RelativeFilePath.of(GEMFILE_FILENAME)),
            await gemfile.toString()
        );
    }

    private async createRakefile(): Promise<void> {
        const rakefile = new Rakefile({ context: this.context });
        await writeFile(
            join(this.absolutePathToOutputDirectory, RelativeFilePath.of(RAKEFILE_FILENAME)),
            await rakefile.toString()
        );
    }

    private async createModuleFile(): Promise<void> {
        const moduleFile = new ModuleFile({ context: this.context, project: this });
        moduleFile.writeFile();
    }

    private async createAsIsFiles(): Promise<void> {
        const asIsFiles = this.rubyContext.getCoreAsIsFiles();
        this.context.logger.debug(`Found ${asIsFiles.length} as-is files to copy: ${asIsFiles.join(", ")}`);

        for (const filename of asIsFiles) {
            this.coreFiles.push(
                await this.createAsIsFile({
                    filename,
                    gemNamespace: firstCharUpperCase(this.context.config.organization || "fern")
                })
            );
        }
    }

    private async createAsIsFile({
        filename,
        gemNamespace
    }: {
        filename: string;
        gemNamespace: string;
    }): Promise<File> {
        const contents = (await readFile(getAsIsFilepath(filename))).toString();
        return new File(
            filename.replace(".Template", ""),
            RelativeFilePath.of(`lib/${this.context.getRootFolderName()}/internal`),
            replaceTemplate({
                contents,
                variables: getTemplateVariables({
                    gemNamespace
                })
            })
        );
    }

    private async writeAsIsFiles(): Promise<void> {
        for (const file of this.coreFiles) {
            await file.write(this.absolutePathToOutputDirectory);
        }
    }

    private async mkdir(absolutePathToDirectory: AbsoluteFilePath): Promise<void> {
        this.context.logger.debug(`mkdir ${absolutePathToDirectory}`);
        await mkdir(absolutePathToDirectory, { recursive: true });
    }

    public getCoreAbsoluteFilePaths(): AbsoluteFilePath[] {
        return this.coreFiles.map((file) => this.filePathFromRubyFile(file));
    }

    public getRawAbsoluteFilePaths(): AbsoluteFilePath[] {
        return this.rawFiles.map((file) => this.filePathFromRubyFile(file));
    }

    private filePathFromRubyFile(file: File): AbsoluteFilePath {
        return AbsoluteFilePath.of(
            join(
                this.absolutePathToOutputDirectory,
                file.directory,
                RelativeFilePath.of(file.filename.replaceAll(".rb", ""))
            )
        );
    }
}

function firstCharUpperCase(st: string): string {
    return st.length < 1 ? st : st.charAt(0).toUpperCase() + st.substring(1);
}

function replaceTemplate({ contents, variables }: { contents: string; variables: Record<string, unknown> }): string {
    return template(contents)(variables);
}

function getTemplateVariables({ gemNamespace }: { gemNamespace: string }): Record<string, unknown> {
    return {
        gem_namespace: gemNamespace,
        sdkName: gemNamespace.toLowerCase()
    };
}

function getAsIsFilepath(filename: string): AbsoluteFilePath {
    return AbsoluteFilePath.of(pathJoin(__dirname, "asIs", filename));
}

declare namespace Gemfile {
    interface Args {
        context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;
    }
}

class Gemfile {
    private context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;

    public constructor({ context }: Gemfile.Args) {
        this.context = context;
    }

    public async toString(): Promise<string> {
        return dedent`
            source 'https://rubygems.org'
            gem 'rake'
        `;
    }
}

declare namespace Rakefile {
    interface Args {
        context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;
    }
}

class Rakefile {
    private context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;

    public constructor({ context }: Rakefile.Args) {
        this.context = context;
    }

    public async toString(): Promise<string> {
        return dedent`
            task :test do
              puts "No tests for now"
            end
        `;
    }
}

declare namespace ModuleFile {
    interface Args {
        context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;
        project: RubyProject;
    }
}

class ModuleFile {
    private context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;
    private project: RubyProject;
    public readonly filePath: AbsoluteFilePath;
    public readonly fileName: string;

    public constructor({ context, project }: ModuleFile.Args) {
        this.context = context;
        this.project = project;
        this.filePath = join(project.absolutePathToOutputDirectory, RelativeFilePath.of("lib"));
        this.fileName = this.context.getRootFolderName() + ".rb";
    }

    public toString(): string {
        let contents = "";

        const coreFilePaths = this.project.getCoreAbsoluteFilePaths();
        coreFilePaths.forEach((filePath) => {
            contents += `require_relative '${relative(this.filePath, filePath)}'\n`;
        });

        const visitedPaths = new Set<string>();
        const typeDeclarations = this.context.getAllTypeDeclarations();
        typeDeclarations.sort(compareTypeDeclarations);
        typeDeclarations.forEach((typeDeclaration) => {
            const typeFilePath = join(
                this.project.absolutePathToOutputDirectory,
                this.context.getLocationForTypeId(typeDeclaration.name.typeId),
                RelativeFilePath.of(this.context.getFileNameForTypeId(typeDeclaration.name.typeId).replaceAll(".rb", ""))
            );
            contents += `require_relative '${relative(this.filePath, typeFilePath)}'\n`;
            visitedPaths.add(typeFilePath);
        });

        const rubyFilePaths = this.project.getRawAbsoluteFilePaths();
        rubyFilePaths.forEach((filePath) => {
            if (!visitedPaths.has(filePath.toString())) {
                contents += `require_relative '${relative(this.filePath, filePath)}'\n`;
            }
        });
        return dedent`${contents}`;
    }

    public async writeFile(): Promise<void> {
        await writeFile(join(this.filePath, RelativeFilePath.of(this.fileName)), this.toString());
    }
}

function compareTypeDeclarations(a: TypeDeclaration, b: TypeDeclaration): number {
    if (dependsOn(a, b)) {
        return -1;
    }
    if (dependsOn(b, a)) {
        return 1;
    }
    return 0;
}

function dependsOn(a: TypeDeclaration, b: TypeDeclaration): boolean {
    return a.referencedTypes.has(b.name.typeId);
}