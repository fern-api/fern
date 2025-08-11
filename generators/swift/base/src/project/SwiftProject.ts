import { mkdir } from "node:fs/promises";
import { AbstractProject } from "@fern-api/base-generator";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { BaseSwiftCustomConfigSchema, swift } from "@fern-api/swift-codegen";

import { AbstractSwiftGeneratorContext } from "../context";
import { SwiftFile } from "./SwiftFile";
import { SymbolRegistry } from "./SymbolRegistry";

export class SwiftProject extends AbstractProject<AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema>> {
    /** Files stored in the the project root. */
    private readonly rootFiles: SwiftFile[] = [];
    /** Files stored in the `Sources` directory. */
    private readonly srcFiles: SwiftFile[] = [];
    private readonly srcFileNamesWithoutExtension = new Set<string>();

    public readonly symbolRegistry: SymbolRegistry;

    public constructor({
        context
    }: {
        context: AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema>;
    }) {
        super(context);
        this.symbolRegistry = SymbolRegistry.create();
    }

    private get srcDirectory(): RelativeFilePath {
        return RelativeFilePath.of("Sources");
    }

    public get absolutePathToSrcDirectory(): AbsoluteFilePath {
        return join(this.absolutePathToOutputDirectory, this.srcDirectory);
    }

    public addRootFiles(...files: SwiftFile[]): void {
        this.rootFiles.push(...files);
    }

    /**
     * Adds a source file to the project. Conflicts will be resolved by appending underscores to duplicate names.
     * The file will include a Foundation import.
     */
    public addSourceFile({
        nameCandidateWithoutExtension,
        directory,
        fileContents
    }: {
        nameCandidateWithoutExtension: string;
        directory: RelativeFilePath;
        fileContents: swift.FileComponent[];
    }): SwiftFile {
        let filenameWithoutExt = nameCandidateWithoutExtension;
        while (this.srcFileNamesWithoutExtension.has(filenameWithoutExt)) {
            filenameWithoutExt += "_";
        }
        this.srcFileNamesWithoutExtension.add(filenameWithoutExt);
        const file = SwiftFile.createWithFoundation({
            filename: filenameWithoutExt + ".swift",
            directory,
            fileContents
        });
        this.srcFiles.push(file);
        return file;
    }

    public addSourceAsIsFile({
        filenameWithoutExt,
        directory,
        fileContents
    }: {
        filenameWithoutExt: string;
        directory: RelativeFilePath;
        fileContents: swift.FileComponent[];
    }): SwiftFile {
        this.srcFileNamesWithoutExtension.add(filenameWithoutExt);
        const file = SwiftFile.create({
            filename: filenameWithoutExt + ".swift",
            directory,
            fileContents
        });
        this.srcFiles.push(file);
        return file;
    }

    public async persist(): Promise<void> {
        const { context, absolutePathToSrcDirectory } = this;
        context.logger.debug(`mkdir ${absolutePathToSrcDirectory}`);
        await mkdir(absolutePathToSrcDirectory, { recursive: true });
        await Promise.all([this.persistRootFiles(), this.persistSourceFiles()]);
    }

    private async persistRootFiles(): Promise<void> {
        const { absolutePathToOutputDirectory, rootFiles } = this;
        await Promise.all(rootFiles.map((file) => file.write(absolutePathToOutputDirectory)));
    }

    private async persistSourceFiles(): Promise<void> {
        const { absolutePathToSrcDirectory, srcFiles } = this;
        await Promise.all(srcFiles.map((file) => file.write(absolutePathToSrcDirectory)));
    }
}
