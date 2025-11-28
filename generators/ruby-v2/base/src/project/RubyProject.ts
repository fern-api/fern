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
const CUSTOM_GEMFILE_FILENAME = "Gemfile.custom";
const RAKEFILE_FILENAME = "Rakefile";
const RUBOCOP_FILENAME = ".rubocop.yml";
const CUSTOM_TEST_FILENAME = "custom.test.rb";
const CUSTOM_GEMSPEC_FILENAME = "custom.gemspec.rb";

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
        await this.createGemspecfile();
        await this.createCustomGemspecFile();
        await this.createGemfile();
        await this.createCustomGemfile();
        await this.createRakefile();
        await this.writeRawFiles();
        await this.createAsIsFiles();
        await this.writeAsIsFiles();
        await this.createTestFiles();
        await this.createVersionFile();
        await this.createModuleFile();
        await this.createRuboCopFile();
    }

    private async createGemspecfile(): Promise<void> {
        const gemspecFilename = this.context.getRootFolderName() + ".gemspec";
        const gemspecFile = new GemspecFile({ context: this.context, project: this });
        await writeFile(
            join(this.absolutePathToOutputDirectory, RelativeFilePath.of(gemspecFilename)),
            await gemspecFile.toString()
        );
    }

    private async createCustomGemspecFile(): Promise<void> {
        const customGemspecFile = new CustomGemspecFile({ context: this.context, project: this });
        await writeFile(
            join(this.absolutePathToOutputDirectory, RelativeFilePath.of(CUSTOM_GEMSPEC_FILENAME)),
            await customGemspecFile.toString()
        );
    }

    private async createGemfile(): Promise<void> {
        const gemfile = new Gemfile({ context: this.context });
        await writeFile(
            join(this.absolutePathToOutputDirectory, RelativeFilePath.of(GEMFILE_FILENAME)),
            await gemfile.toString()
        );
    }

    private async createCustomGemfile(): Promise<void> {
        const customGemfile = new CustomGemfile({ context: this.context });
        await writeFile(
            join(this.absolutePathToOutputDirectory, RelativeFilePath.of(CUSTOM_GEMFILE_FILENAME)),
            await customGemfile.toString()
        );
    }

    private async createRakefile(): Promise<void> {
        const rakefile = new Rakefile({ context: this.context });
        await writeFile(
            join(this.absolutePathToOutputDirectory, RelativeFilePath.of(RAKEFILE_FILENAME)),
            await rakefile.toString()
        );
    }

    private async createRuboCopFile(): Promise<void> {
        const ruboCopFile = new RubocopFile({ context: this.context });
        await writeFile(
            join(this.absolutePathToOutputDirectory, RelativeFilePath.of(RUBOCOP_FILENAME)),
            await ruboCopFile.toString()
        );
    }

    private async createModuleFile(): Promise<void> {
        const moduleFile = new ModuleFile({ context: this.context, project: this });
        moduleFile.writeFile();
    }

    private async createTestFiles(): Promise<void> {
        // Create custom test file for quick testing per fixture
        const customTestFile = new CustomTestFile({ context: this.context, project: this });
        await customTestFile.writeFile();
    }

    private async createVersionFile(): Promise<void> {
        // Create version.rb file per fixture
        const versionFile = new VersionFile({ context: this.context, project: this });
        await versionFile.writeFile();
    }

    private async createAsIsFiles(): Promise<void> {
        const asIsFiles = this.rubyContext.getCoreAsIsFiles();
        this.context.logger.debug(`Found ${asIsFiles.length} as-is files to copy: ${asIsFiles.join(", ")}`);

        for (const filename of asIsFiles) {
            this.coreFiles.push(
                await this.createAsIsFile({
                    filename,
                    gemNamespace: firstCharUpperCase(this.context.config.organization || "fern"),
                    customPagerClassName: this.rubyContext.customConfig.customPagerName
                })
            );
        }
    }

    private async createAsIsFile({
        filename,
        gemNamespace,
        customPagerClassName
    }: {
        filename: string;
        gemNamespace: string;
        customPagerClassName?: string;
    }): Promise<File> {
        const contents = (await readFile(getAsIsFilepath(filename))).toString();
        return new File(
            this.getAsIsOutputFilename(filename),
            this.getAsIsOutputDirectory(filename),
            replaceTemplate({
                contents,
                variables: getTemplateVariables({
                    gemNamespace,
                    customPagerClassName
                })
            })
        );
    }

    public getAsIsOutputDirectory(templateFileName: string): RelativeFilePath {
        if (templateFileName.startsWith(`test/`)) {
            return RelativeFilePath.of("");
        } else {
            return RelativeFilePath.of(`lib/${this.context.getRootFolderName()}`);
        }
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
        return this.coreFiles
            .filter((file) => !(file.directory == "" && file.filename.startsWith("test/")))
            .map((file) => this.filePathFromRubyFile(file));
    }

    public getRawAbsoluteFilePaths(): AbsoluteFilePath[] {
        return this.rawFiles.map((file) => this.filePathFromRubyFile(file));
    }

    private filePathFromRubyFile(file: File): AbsoluteFilePath {
        return join(this.absolutePathToOutputDirectory, file.directory, RelativeFilePath.of(file.filename));
    }
}

function firstCharUpperCase(st: string): string {
    return st.length < 1 ? st : st.charAt(0).toUpperCase() + st.substring(1);
}

function replaceTemplate({ contents, variables }: { contents: string; variables: Record<string, unknown> }): string {
    return template(contents)(variables);
}

function getTemplateVariables({
    gemNamespace,
    customPagerClassName
}: {
    gemNamespace: string;
    customPagerClassName?: string;
}): Record<string, unknown> {
    return {
        gem_namespace: gemNamespace,
        sdkName: gemNamespace.toLowerCase(),
        custom_pager_class_name: customPagerClassName ?? "CustomPager"
    };
}

function getAsIsFilepath(filename: string): AbsoluteFilePath {
    return AbsoluteFilePath.of(pathJoin(__dirname, "asIs", filename));
}

declare namespace GemspecFile {
    interface Args {
        context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;
        project: RubyProject;
    }
}

class GemspecFile {
    private context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;

    public constructor({ context, project }: GemspecFile.Args) {
        this.context = context;
    }

    public async toString(): Promise<string> {
        const moduleFolderName = this.context.getRootFolderName();
        const moduleName = this.context.getRootModuleName();

        return dedent`
            # frozen_string_literal: true

            require_relative "lib/${moduleFolderName}/version"
            require_relative "${CUSTOM_GEMSPEC_FILENAME}"

            # Note: A handful of these fields are required as part of the Ruby specification. 
            #       You can change them here or overwrite them in the custom gemspec file.
            Gem::Specification.new do |spec|
            spec.name = "${moduleFolderName}"
            spec.authors = ["${moduleName}"] 
            spec.version = ${moduleName}::VERSION
            spec.summary = "Ruby client library for the ${moduleName} API"
            spec.description = "The ${moduleName} Ruby library provides convenient access to the ${moduleName} API from Ruby."
            spec.required_ruby_version = ">= 3.3.0"
            spec.metadata["rubygems_mfa_required"] = "true"
            
            # Specify which files should be added to the gem when it is released.
            # The \`git ls-files -z\` loads the files in the RubyGem that have been added into git.
            gemspec = File.basename(__FILE__)
            spec.files = IO.popen(%w[git ls-files -z], chdir: __dir__, err: IO::NULL) do |ls|
                ls.readlines("\x0", chomp: true).reject do |f|
                (f == gemspec) ||
                    f.start_with?(*%w[bin/ test/ spec/ features/ .git appveyor Gemfile])
                end
            end
            spec.bindir = "exe"
            spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
            spec.require_paths = ["lib"]

            # Uncomment to register a new dependency of your gem
            # spec.add_dependency "example-gem", "~> 1.0"

            # For more information and examples about making a new gem, check out our
            # guide at: https://bundler.io/guides/creating_gem.html
            
            # Load custom gemspec configuration if it exists
            custom_gemspec_file = File.join(__dir__, "${CUSTOM_GEMSPEC_FILENAME}")
            add_custom_gemspec_data(spec) if File.exist?(custom_gemspec_file)
            end
        `;
    }
}

declare namespace CustomGemspecFile {
    interface Args {
        context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;
        project: RubyProject;
    }
}

class CustomGemspecFile {
    private context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;

    public constructor({ context, project }: CustomGemspecFile.Args) {
        this.context = context;
    }

    public async toString(): Promise<string> {
        const moduleName = this.context.getRootModuleName();

        return dedent`
            # frozen_string_literal: true

            # Custom gemspec configuration file
            # This file is automatically loaded by the main gemspec file. The 'spec' variable is available 
            # in this context from the main gemspec file. You can modify this file to add custom metadata, 
            # dependencies, or other gemspec configurations. If you do make changes to this file, you will
            # need to add it to the .fernignore file to prevent your changes from being overwritten.

            def add_custom_gemspec_data(spec)
                # Example custom configurations (uncomment and modify as needed)

                # spec.authors = ["Your name"]
                # spec.email = ["your.email@example.com"]
                # spec.homepage = "https://github.com/your-org/${moduleName.toLowerCase()}-ruby"
                # spec.license = "Your license"
            end
        `;
    }
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
            # frozen_string_literal: true

            source "https://rubygems.org"

                gemspec

                group :test, :development do
                gem "rake", "~> 13.0"

                gem "minitest", "~> 5.16"
                gem "minitest-rg"

                gem "rubocop", "~> 1.21"
                gem "rubocop-minitest"

                gem "pry"

                gem "webmock"
            end

            # Load custom Gemfile configuration if it exists
            custom_gemfile = File.join(__dir__, "${CUSTOM_GEMFILE_FILENAME}")
            eval_gemfile(custom_gemfile) if File.exist?(custom_gemfile)
        `;
    }
}

declare namespace CustomGemfile {
    interface Args {
        context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;
    }
}

class CustomGemfile {
    private context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;

    public constructor({ context }: CustomGemfile.Args) {
        this.context = context;
    }

    public async toString(): Promise<string> {
        return dedent`
            # frozen_string_literal: true

            # Custom Gemfile configuration file
            # This file is automatically loaded by the main Gemfile. You can add custom gems,
            # groups, or other Gemfile configurations here. If you do make changes to this file,
            # you will need to add it to the .fernignore file to prevent your changes from being
            # overwritten by the generator.

            # Example usage:
            # group :test, :development do
            #   gem 'custom-gem', '~> 2.0'
            # end

            # Add your custom gem dependencies here
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
            # frozen_string_literal: true

            require "bundler/gem_tasks"
            require "minitest/test_task"

            Minitest::TestTask.create

            require "rubocop/rake_task"

            RuboCop::RakeTask.new

            task default: %i[test]

            task lint: %i[rubocop]

            # Run only the custom test file
            Minitest::TestTask.create(:customtest) do |t|
            t.libs << "test"
            t.test_globs = ["test/${CUSTOM_TEST_FILENAME}"]
            end
        `;
    }
}

declare namespace CustomTestFile {
    interface Args {
        context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;
        project: RubyProject;
    }
}

class CustomTestFile {
    private context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;
    private project: RubyProject;
    public readonly filePath: AbsoluteFilePath;
    public readonly fileName: string;

    public constructor({ context, project }: CustomTestFile.Args) {
        this.context = context;
        this.project = project;
        this.filePath = join(project.absolutePathToOutputDirectory, RelativeFilePath.of("test"));
        this.fileName = CUSTOM_TEST_FILENAME;
    }

    public toString(): string {
        return dedent`
            # frozen_string_literal: true

            =begin
            This is a custom test file, if you wish to add more tests
            to your SDK.
            Be sure to mark this file in \`.fernignore\`.
            
            If you include example requests/responses in your fern definition,
            you will have tests automatically generated for you.
            =end

            # This test is run via command line: rake customtest
            describe "Custom Test" do
                it "Default" do
                    refute false
                end
            end
        `;
    }

    public async writeFile(): Promise<void> {
        // Ensure the test directory exists before writing the file
        await mkdir(this.filePath, { recursive: true });
        await writeFile(join(this.filePath, RelativeFilePath.of(this.fileName)), this.toString());
    }
}

declare namespace VersionFile {
    interface Args {
        context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;
        project: RubyProject;
    }
}

class VersionFile {
    private context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;
    private project: RubyProject;
    public readonly filePath: AbsoluteFilePath;
    public readonly fileName: string;

    public constructor({ context, project }: VersionFile.Args) {
        this.context = context;
        this.project = project;
        this.filePath = join(
            project.absolutePathToOutputDirectory,
            RelativeFilePath.of(`lib/${context.getRootFolderName()}`)
        );
        this.fileName = "version.rb";
    }

    public toString(): string {
        const seedName = this.context.getRootModuleName();
        const version = this.context.getVersionFromConfig();

        return dedent`
            # frozen_string_literal: true

            module ${seedName}
                VERSION = "${version}"
            end
        `;
    }

    public async writeFile(): Promise<void> {
        // Ensure the lib directory exists before writing the file
        await mkdir(this.filePath, { recursive: true });
        await writeFile(join(this.filePath, RelativeFilePath.of(this.fileName)), this.toString());
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
            RelativeFilePath.of(this.context.getFileNameForTypeId(typeDeclaration.name.typeId))
        );
    }

    public toString(): string {
        const relativeImportPaths: Set<RelativeFilePath> = new Set();

        const coreFiles = this.context.getCoreAsIsFiles();
        coreFiles.sort((a, b) => topologicalCompareAsIsFiles(a, b));
        coreFiles.forEach((filename) => {
            if (filename.startsWith("test/")) {
                return;
            }
            const absoluteFilePath = join(
                this.project.absolutePathToOutputDirectory,
                this.project.getAsIsOutputDirectory(filename),
                RelativeFilePath.of(this.project.getAsIsOutputFilename(filename))
            );
            relativeImportPaths.add(relative(this.filePath, absoluteFilePath));
        });

        const coreFilePaths = this.project.getCoreAbsoluteFilePaths();
        coreFilePaths.forEach((filePath) => {
            relativeImportPaths.add(relative(this.filePath, filePath));
        });

        const typeDeclarations = this.context.getAllTypeDeclarations();
        const rubyFilePaths = this.project.getRawAbsoluteFilePaths();
        const filteredTypeDeclarations = typeDeclarations.filter((typeDeclaration) => {
            const absoluteFilePath = this.getAbsoluteFilePathForTypeDeclaration(typeDeclaration);
            return rubyFilePaths.includes(absoluteFilePath);
        });

        const { sorted, cycles } = topologicalSortWithCycleDetection(filteredTypeDeclarations, dependsOn);

        sorted.forEach((typeDeclaration) => {
            const typeFilePath = join(
                this.project.absolutePathToOutputDirectory,
                this.context.getLocationForTypeId(typeDeclaration.name.typeId),
                RelativeFilePath.of(this.context.getFileNameForTypeId(typeDeclaration.name.typeId))
            );
            relativeImportPaths.add(relative(this.filePath, typeFilePath));
        });

        rubyFilePaths.forEach((filePath) => {
            relativeImportPaths.add(relative(this.filePath, filePath));
        });

        const contents =
            this.baseContents +
            Array.from(relativeImportPaths)
                .filter((importPath) => importPath.endsWith(".rb"))
                .map((importPath) => `require_relative '${importPath.replaceAll(".rb", "")}'`)
                .join("\n");
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
