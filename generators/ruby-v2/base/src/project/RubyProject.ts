import { AbstractProject, File } from "@fern-api/base-generator";
import { AbsoluteFilePath, join, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { BaseRubyCustomConfigSchema } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import dedent from "dedent";
import { Eta } from "eta";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join as pathJoin } from "path";
import { AsIsFiles, topologicalCompareAsIsFiles } from "../AsIs.js";
import { AbstractRubyGeneratorContext } from "../context/AbstractRubyGeneratorContext.js";
import { RubocopFile } from "./RubocopFile.js";

const eta = new Eta({ autoEscape: false, useWith: true, autoTrim: false });

const GEMFILE_FILENAME = "Gemfile";
const CUSTOM_GEMFILE_FILENAME = "Gemfile.custom";
const RAKEFILE_FILENAME = "Rakefile";
const RUBOCOP_FILENAME = ".rubocop.yml";
const CUSTOM_TEST_FILENAME = "custom.test.rb";
const CUSTOM_GEMSPEC_FILENAME = "custom.gemspec.rb";

interface Dependency {
    name: string;
    versionConstraint?: string;
}

function depToGemfileString(dep: Dependency): string {
    return dep.versionConstraint != null ? `gem "${dep.name}", "${dep.versionConstraint}"` : `gem "${dep.name}"`;
}

function depToGemspecString(dep: Dependency): string {
    return dep.versionConstraint != null
        ? `spec.add_dependency "${dep.name}", "${dep.versionConstraint}"`
        : `spec.add_dependency "${dep.name}"`;
}

function sanitizeRubyStringValue(value: string, field: string): string {
    if (/["\r\n\\]/.test(value)) {
        throw new Error(
            `Invalid character in ${field} "${value}": values used in Ruby string ` +
                `literals cannot contain unescaped quotes, backslashes, or newlines.`
        );
    }
    return value;
}

function depsFromRecord(record: Record<string, string | undefined> | undefined): Dependency[] {
    const deps = Object.entries(record ?? {});
    if (deps == null || deps.length === 0) {
        return [];
    }

    return deps.map(([packageName, versionConstraint]) => ({
        name: sanitizeRubyStringValue(packageName, "package name"),
        versionConstraint:
            versionConstraint != null ? sanitizeRubyStringValue(versionConstraint, "version constraint") : undefined
    }));
}

function mergedDependencies(baseDeps: Dependency[], overrideDeps: Dependency[]): Dependency[] {
    const mergedDeps: Record<string, string | undefined> = {};
    baseDeps.forEach((dep) => {
        mergedDeps[dep.name] = dep.versionConstraint;
    });
    overrideDeps.forEach((dep) => {
        mergedDeps[dep.name] = dep.versionConstraint;
    });
    return depsFromRecord(mergedDeps);
}

const BASE_DEV_DEPENDENCIES: Dependency[] = [
    { name: "minitest", versionConstraint: "~> 5.16" },
    { name: "minitest-rg" },
    { name: "pry" },
    { name: "rake", versionConstraint: "~> 13.0" },
    { name: "rubocop", versionConstraint: "~> 1.21" },
    { name: "rubocop-minitest" },
    { name: "webmock" }
];

function hasBasicAuth(ir: FernIr.IntermediateRepresentation): boolean {
    return ir.auth.schemes.some((s) => s.type === "basic");
}

const BASE_DEPENDENCIES: Dependency[] = [];

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
        await this.createGithubCiWorkflow();
        await this.createGitignore();
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

    private async createGithubCiWorkflow(): Promise<void> {
        const githubWorkflowsDir = join(this.absolutePathToOutputDirectory, RelativeFilePath.of(".github/workflows"));
        await mkdir(githubWorkflowsDir, { recursive: true });
        const githubCiTemplate = (await readFile(getAsIsFilepath(AsIsFiles.GithubCiYml))).toString();

        // Use enableWireTests config to conditionally include wire-tests in the test command
        const enableWireTests = this.rubyContext.customConfig.enableWireTests ?? false;

        const githubCiContents = eta.renderString(githubCiTemplate, { enableWireTests });
        await writeFile(join(githubWorkflowsDir, RelativeFilePath.of("ci.yml")), githubCiContents);
    }

    private async createGitignore(): Promise<void> {
        const gitignoreContents = (await readFile(getAsIsFilepath(AsIsFiles.Gitignore))).toString();
        await writeFile(join(this.absolutePathToOutputDirectory, RelativeFilePath.of(".gitignore")), gitignoreContents);
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
                    gemNamespace: this.rubyContext.getRootModuleName(),
                    rootFolderName: this.rubyContext.getRootFolderName(),
                    customPagerClassName: this.rubyContext.customConfig.customPagerName,
                    omitFernHeaders: this.rubyContext.customConfig.omitFernHeaders,
                    maxRetries: this.rubyContext.customConfig.maxRetries,
                    retryStatusCodes: this.rubyContext.customConfig.retryStatusCodes
                })
            );
        }
    }

    private async createAsIsFile({
        filename,
        gemNamespace,
        rootFolderName,
        customPagerClassName,
        omitFernHeaders,
        maxRetries,
        retryStatusCodes
    }: {
        filename: string;
        gemNamespace: string;
        rootFolderName: string;
        customPagerClassName?: string;
        omitFernHeaders?: boolean;
        maxRetries?: number;
        retryStatusCodes?: string;
    }): Promise<File> {
        let rendered = replaceTemplate({
            contents: (await readFile(getAsIsFilepath(filename))).toString(),
            variables: getTemplateVariables({
                gemNamespace,
                rootFolderName,
                customPagerClassName,
                omitFernHeaders,
                maxRetries
            })
        });

        const retryStatusCodesArray =
            retryStatusCodes === "recommended"
                ? "[408, 429, 502, 503, 504].freeze"
                : "[408, 429, 500, 502, 503, 504, 521, 522, 524].freeze";
        rendered = rendered.replace(/\{\{RETRY_STATUS_CODES_ARRAY\}\}/g, retryStatusCodesArray);

        return new File(this.getAsIsOutputFilename(filename), this.getAsIsOutputDirectory(filename), rendered);
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

function replaceTemplate({ contents, variables }: { contents: string; variables: Record<string, unknown> }): string {
    return eta.renderString(contents, variables);
}

function getTemplateVariables({
    gemNamespace,
    rootFolderName,
    customPagerClassName,
    omitFernHeaders,
    maxRetries
}: {
    gemNamespace: string;
    rootFolderName: string;
    customPagerClassName?: string;
    omitFernHeaders?: boolean;
    maxRetries?: number;
}): Record<string, unknown> {
    return {
        gem_namespace: gemNamespace,
        // sdkName is used for SDK branding (e.g., X-Fern-SDK-Name header)
        sdkName: gemNamespace.toLowerCase(),
        // rootFolderName is used for require paths (matches actual file/folder names)
        rootFolderName,
        custom_pager_class_name: customPagerClassName ?? "CustomPager",
        omitFernHeaders: omitFernHeaders ?? false,
        defaultMaxRetries: maxRetries ?? 2
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
    private readonly baseDependencies: Dependency[];

    public constructor({ context, project }: GemspecFile.Args) {
        this.context = context;
        this.baseDependencies = hasBasicAuth(context.ir)
            ? [...BASE_DEPENDENCIES, { name: "base64" }]
            : BASE_DEPENDENCIES;
    }

    public async toString(): Promise<string> {
        const moduleFolderName = this.context.getRootFolderName();
        const moduleName = this.context.getRootModuleName();
        const gemName = this.context.getGemName();

        const dependencies = mergedDependencies(
            this.baseDependencies,
            depsFromRecord(this.context.customConfig.extraDependencies)
        );

        return (
            dedent`
            # frozen_string_literal: true

            require_relative "lib/${moduleFolderName}/version"
            require_relative "${CUSTOM_GEMSPEC_FILENAME.replace(".rb", "")}"

            # NOTE: A handful of these fields are required as part of the Ruby specification.
            #       You can change them here or overwrite them in the custom gemspec file.
            Gem::Specification.new do |spec|
              spec.name = "${gemName}"
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
${dependencies.length > 0 ? "              " + dependencies.map(depToGemspecString).join("\n              ") + "\n" : ""}              # For more information and examples about making a new gem, check out our
              # guide at: https://bundler.io/guides/creating_gem.html

              # Load custom gemspec configuration if it exists
              custom_gemspec_file = File.join(__dir__, "${CUSTOM_GEMSPEC_FILENAME}")
              add_custom_gemspec_data(spec) if File.exist?(custom_gemspec_file)
            end
        ` + "\n"
        );
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

        return (
            dedent`
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
        ` + "\n"
        );
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
        const devDependencies = mergedDependencies(
            BASE_DEV_DEPENDENCIES,
            depsFromRecord(this.context.customConfig.extraDevDependencies)
        );

        return (
            dedent`
            # frozen_string_literal: true

            source "https://rubygems.org"

            gemspec

            group :test, :development do
              ${devDependencies.map(depToGemfileString).join("\n              ")}
            end

            # Load custom Gemfile configuration if it exists
            custom_gemfile = File.join(__dir__, "${CUSTOM_GEMFILE_FILENAME}")
            eval_gemfile(custom_gemfile) if File.exist?(custom_gemfile)
        ` + "\n"
        );
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
        return (
            dedent`
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
        ` + "\n"
        );
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
        return (
            dedent`
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
        ` + "\n"
        );
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
        return (
            dedent`
            # frozen_string_literal: true

            # This is a custom test file, if you wish to add more tests
            # to your SDK.
            # Be sure to mark this file in \`.fernignore\`.
            #
            # If you include example requests/responses in your fern definition,
            # you will have tests automatically generated for you.

            # This test is run via command line: rake customtest
            describe "Custom Test" do
              it "Default" do
                refute false
              end
            end
        ` + "\n"
        );
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

        return (
            dedent`
            # frozen_string_literal: true

            module ${seedName}
              VERSION = "${version}"
            end
        ` + "\n"
        );
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
    private get baseContents(): string {
        const hasBasicAuth = this.context.ir.auth.schemes.some((s) => s.type === "basic");
        const requires = ['"json"', '"net/http"', '"securerandom"'];
        if (hasBasicAuth) {
            requires.push('"base64"');
        }
        return dedent`
            # frozen_string_literal: true

            ${requires.map((r) => `require ${r}`).join("\n")}\n\n`;
    }

    public constructor({ context, project }: ModuleFile.Args) {
        this.context = context;
        this.project = project;
        this.filePath = join(project.absolutePathToOutputDirectory, RelativeFilePath.of("lib"));
        this.fileName = this.context.getRootFolderName() + ".rb";
    }

    private getAbsoluteFilePathForTypeDeclaration(typeDeclaration: FernIr.TypeDeclaration): AbsoluteFilePath {
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
            // Filter out test files from requires - they should not be loaded in the main lib file
            const relativePath = relative(this.filePath, filePath);
            if (relativePath.includes("/test/") || relativePath.startsWith("test/")) {
                return;
            }
            relativeImportPaths.add(relativePath);
        });

        const contents =
            this.baseContents +
            Array.from(relativeImportPaths)
                .filter((importPath) => importPath.endsWith(".rb"))
                .map((importPath) => `require_relative "${importPath.replaceAll(".rb", "")}"`)
                .join("\n");

        // Add optional user require paths hook at the end (only if configured)
        // This allows users to add custom code (e.g., Sentry integration) without fernignoring generated files
        const requirePaths = this.context.customConfig?.requirePaths;
        if (requirePaths != null && requirePaths.length > 0) {
            const rootFolder = this.context.getRootFolderName();
            const pathsArray = requirePaths
                .map((p) => `"${rootFolder}/${sanitizeRubyStringValue(p, "require path")}"`)
                .join(", ");
            const requirePathsHook = `

# Load user-defined files if present (e.g., for Sentry integration)
# Files are loaded from lib/${rootFolder}/ if they exist
[${pathsArray}].each do |relative_path|
  absolute_path = File.join(__dir__, "\#{relative_path}.rb")
  require_relative relative_path if File.exist?(absolute_path)
end`;

            return dedent`${contents}` + requirePathsHook + "\n";
        }

        return dedent`${contents}` + "\n";
    }

    public async writeFile(): Promise<void> {
        await writeFile(join(this.filePath, RelativeFilePath.of(this.fileName)), this.toString());
    }
}

function dependsOn(a: FernIr.TypeDeclaration, b: FernIr.TypeDeclaration): boolean {
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
