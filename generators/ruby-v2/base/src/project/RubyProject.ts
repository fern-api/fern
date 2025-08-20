import { AbstractProject, File } from "@fern-api/base-generator";
import { AbsoluteFilePath, join, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { BaseRubyCustomConfigSchema } from "@fern-api/ruby-ast";
import { TypeDeclaration } from "@fern-fern/ir-sdk/api";
import dedent from "dedent";
import { mkdir, readFile, writeFile } from "fs/promises";
import { template } from "lodash-es";
import { join as pathJoin } from "path";
import { topologicalCompareAsIsFiles } from "../AsIs";
import { AbstractRubyGeneratorContext } from "../context/AbstractRubyGeneratorContext";
import { RubocopFile } from "./RubocopFile";

const GEMFILE_FILENAME = "Gemfile";
const RAKEFILE_FILENAME = "Rakefile";
const RUBOCOP_FILENAME = ".rubocop.yml";

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
        await this.createRubocoopFile();
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

    private async createRubocoopFile(): Promise<void> {
        const rubocoopFile = new RubocopFile({ context: this.context });
        await writeFile(
            join(this.absolutePathToOutputDirectory, RelativeFilePath.of(RUBOCOP_FILENAME)),
            await rubocoopFile.toString()
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
            this.getAsIsOutputFilename(filename),
            this.getAsIsOutputDirectory(),
            replaceTemplate({
                contents,
                variables: getTemplateVariables({
                    gemNamespace
                })
            })
        );
    }

    public getAsIsOutputDirectory(): RelativeFilePath {
        return RelativeFilePath.of(`lib/${this.context.getRootFolderName()}/internal`);
    }

    public getAsIsOutputFilename(templateFileName: string): string {
        return templateFileName.replace(".Template", "");
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
        return join(
            this.absolutePathToOutputDirectory,
            file.directory,
            RelativeFilePath.of(file.filename.replaceAll(".rb", ""))
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
    private readonly baseContents: string = dedent`
        # frozen_string_literal: true

        require "json"
        require "net/http"
        require "securerandom"\n\n`;

    public constructor({ context, project }: ModuleFile.Args) {
        this.context = context;
        this.project = project;
        this.filePath = join(project.absolutePathToOutputDirectory, RelativeFilePath.of("lib"));
        this.fileName = this.context.getRootFolderName() + ".rb";
    }

    private getAbsoluteFilePathForTypeDeclaration(typeDeclaration: TypeDeclaration): AbsoluteFilePath {
        return join(
            this.project.absolutePathToOutputDirectory,
            this.context.getLocationForTypeId(typeDeclaration.name.typeId),
            RelativeFilePath.of(this.context.getFileNameForTypeId(typeDeclaration.name.typeId).replaceAll(".rb", ""))
        );
    }

    public toString(): string {
        let contents = this.baseContents;
        const visitedPaths = new Set<string>();

        contents += `# Internal Types\n`;
        const coreFiles = this.context.getCoreAsIsFiles();
        coreFiles.sort((a, b) => topologicalCompareAsIsFiles(a, b));
        coreFiles.forEach((filename) => {
            const absoluteFilePath = join(
                this.project.absolutePathToOutputDirectory,
                this.project.getAsIsOutputDirectory(),
                RelativeFilePath.of(this.project.getAsIsOutputFilename(filename).replaceAll(".rb", ""))
            );
            contents += `require_relative "${relative(this.filePath, absoluteFilePath)}"\n`;
            visitedPaths.add(absoluteFilePath.toString());
        });

        const coreFilePaths = this.project.getCoreAbsoluteFilePaths();
        coreFilePaths.forEach((filePath) => {
            if (!visitedPaths.has(filePath.toString())) {
                contents += `require_relative "${relative(this.filePath, filePath)}"\n`;
                visitedPaths.add(filePath.toString());
            }
        });

        contents += "\n";
        contents += `# API Types\n`;
        const typeDeclarations = this.context.getAllTypeDeclarations();
        const rubyFilePaths = this.project.getRawAbsoluteFilePaths();
        const filteredTypeDeclarations = typeDeclarations.filter((typeDeclaration) => {
            const absoluteFilePath = this.getAbsoluteFilePathForTypeDeclaration(typeDeclaration);
            return rubyFilePaths.includes(absoluteFilePath);
        });

        const { sorted, cycles } = topologicalSortWithCycleDetection(filteredTypeDeclarations, dependsOn);
        if (cycles.length > 0) {
            const cycleDescriptions = cycles.map((cycle) =>
                cycle.map((typeDeclaration) => typeDeclaration.name.typeId).join(" --> ")
            );
            cycleDescriptions.forEach((cycleDescription) => {
                this.context.logger.warn(`Circular dependency detected: ${cycleDescription}`);
            });
        }
        sorted.forEach((typeDeclaration) => {
            const typeFilePath = join(
                this.project.absolutePathToOutputDirectory,
                this.context.getLocationForTypeId(typeDeclaration.name.typeId),
                RelativeFilePath.of(
                    this.context.getFileNameForTypeId(typeDeclaration.name.typeId).replaceAll(".rb", "")
                )
            );
            contents += `require_relative '${relative(this.filePath, typeFilePath)}'\n`;
            visitedPaths.add(typeFilePath);
        });

        contents += "\n";
        contents += `# Client Types\n`;
        rubyFilePaths.forEach((filePath) => {
            if (!visitedPaths.has(filePath.toString())) {
                contents += `require_relative '${relative(this.filePath, filePath)}'\n`;
                visitedPaths.add(filePath.toString());
            }
        });
        return dedent`${contents}`;
    }

    public async writeFile(): Promise<void> {
        await writeFile(join(this.filePath, RelativeFilePath.of(this.fileName)), this.toString());
    }
}

function dependsOn(a: TypeDeclaration, b: TypeDeclaration): boolean {
    if (a.name.typeId === b.name.typeId) {
        return false;
    }
    return a.referencedTypes.has(b.name.typeId);
}

/**
 * Topological sort for a directed acyclic graph (DAG).
 * Sorts nodes so that if A depends on B, then B comes before A in the result.
 *
 * @param nodes - Array of nodes to sort
 * @param dependsOn - Function that returns true if first node depends on second node
 * @returns Topologically sorted array
 */
function topologicalSort<T>(
    context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>,
    nodes: T[],
    dependsOn: (a: T, b: T) => boolean
): T[] {
    const result: T[] = [];
    const visited = new Set<T>();
    const visiting = new Set<T>();

    function visit(node: T): void {
        if (visiting.has(node)) {
            context.logger.warn(`Circular dependency detected for ${Array.from(visiting).join("-->")}`);
            return;
        }
        if (visited.has(node)) {
            return;
        }

        visiting.add(node);

        // Visit all dependencies first
        for (const other of nodes) {
            if (dependsOn(node, other)) {
                visit(other);
            }
        }

        visiting.delete(node);
        visited.add(node);
        result.push(node);
    }

    // Visit all nodes
    for (const node of nodes) {
        if (!visited.has(node)) {
            visit(node);
        }
    }

    return result;
}

function topologicalSortWithCycleDetection<T>(
    nodes: T[],
    dependsOn: (a: T, b: T) => boolean
): { sorted: T[]; cycles: T[][] } {
    const result: T[] = [];
    const visited = new Set<T>();
    const cycles: T[][] = [];

    function visit(node: T, path: T[]): void {
        const cycleStart = path.indexOf(node);
        if (cycleStart !== -1) {
            // Found cycle - extract it
            const cycle = path.slice(cycleStart);
            cycle.push(node); // Complete the cycle
            cycles.push(cycle);
            return;
        }

        if (visited.has(node)) {
            return;
        }

        const newPath = [...path, node];

        for (const other of nodes) {
            if (dependsOn(node, other)) {
                visit(other, newPath);
            }
        }

        visited.add(node);
        result.push(node);
    }

    for (const node of nodes) {
        if (!visited.has(node)) {
            visit(node, []);
        }
    }

    return { sorted: result, cycles };
}
