import { mkdir } from "node:fs/promises";
import { AbstractProject, File } from "@fern-api/base-generator";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { BaseSwiftCustomConfigSchema, swift } from "@fern-api/swift-codegen";
import { TestAsIsFiles } from "../AsIs";
import { AbstractSwiftGeneratorContext } from "../context";
import { FileRegistry } from "./file-registry";
import { SourceNameRegistry } from "./name-registry";
import { SwiftFile } from "./SwiftFile";
import { TestSymbolRegistry } from "./TestSymbolRegistry";

interface FileCandidate {
    nameCandidateWithoutExtension: string;
    directory: RelativeFilePath;
    contents: string | swift.FileComponent[];
}

export class SwiftProject extends AbstractProject<AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema>> {
    /** Files stored in the the project root. */
    private readonly rootFiles: File[] = [];
    /** Files stored in the `Sources` directory. */
    private readonly srcFileRegistry = new FileRegistry();
    /** Files stored in the `Tests` directory. */
    private readonly testFileRegistry = new FileRegistry();

    public readonly nameRegistry: SourceNameRegistry;
    public readonly testSymbolRegistry: TestSymbolRegistry;

    private static createTestSymbolRegistry(): TestSymbolRegistry {
        const additionalReservedSymbols = Object.values(TestAsIsFiles).flatMap((file) => file.symbols);
        return TestSymbolRegistry.create(additionalReservedSymbols.map((symbol) => symbol.name));
    }

    public constructor({
        context
    }: {
        context: AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema>;
    }) {
        super(context);
        this.nameRegistry = SourceNameRegistry.create();
        this.testSymbolRegistry = SwiftProject.createTestSymbolRegistry();
    }

    public get sourcesDirectory(): RelativeFilePath {
        return RelativeFilePath.of("Sources");
    }

    public get testsDirectory(): RelativeFilePath {
        return RelativeFilePath.of("Tests");
    }

    public get absolutePathToSourcesDirectory(): AbsoluteFilePath {
        return join(this.absolutePathToOutputDirectory, this.sourcesDirectory);
    }

    public get absolutePathToTestsDirectory(): AbsoluteFilePath {
        return join(this.absolutePathToOutputDirectory, this.testsDirectory);
    }

    public addRootFiles(...files: File[]): void {
        this.rootFiles.push(...files);
    }

    /**
     * Adds a source file to the project. The file will include a Foundation import so you don't need to add it to the file contents manually.
     */
    public addSourceFile(candidate: FileCandidate): SwiftFile {
        return this.srcFileRegistry.add({ ...candidate, includeFoundationImport: true });
    }

    /**
     * Adds a source "as is" file to the project.
     */
    public addSourceAsIsFile(candidate: FileCandidate): SwiftFile {
        return this.srcFileRegistry.add(candidate);
    }

    /**
     * Adds a test file to the project.
     */
    public addTestFile(candidate: FileCandidate): SwiftFile {
        return this.testFileRegistry.add(candidate);
    }

    /**
     * Adds a test "as is" file to the project.
     */
    public addTestAsIsFile(candidate: FileCandidate): SwiftFile {
        return this.testFileRegistry.add(candidate);
    }

    public async persist(): Promise<void> {
        const { context, absolutePathToSourcesDirectory } = this;
        context.logger.debug(`mkdir ${absolutePathToSourcesDirectory}`);
        await mkdir(absolutePathToSourcesDirectory, { recursive: true });
        await Promise.all([this.persistRootFiles(), this.persistSourceFiles(), this.persistTestFiles()]);
    }

    private async persistRootFiles(): Promise<void> {
        const { absolutePathToOutputDirectory, rootFiles } = this;
        await Promise.all(rootFiles.map((file) => file.write(absolutePathToOutputDirectory)));
    }

    private async persistSourceFiles(): Promise<void> {
        const { absolutePathToSourcesDirectory, srcFileRegistry } = this;
        const srcFiles = srcFileRegistry.getAll();
        await Promise.all(srcFiles.map((file) => file.write(absolutePathToSourcesDirectory)));
    }

    private async persistTestFiles(): Promise<void> {
        const { absolutePathToTestsDirectory, testFileRegistry } = this;
        const testFiles = testFileRegistry.getAll();
        await Promise.all(testFiles.map((file) => file.write(absolutePathToTestsDirectory)));
    }
}
