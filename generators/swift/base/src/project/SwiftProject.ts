import { AbstractProject } from "@fern-api/base-generator";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { BaseSwiftCustomConfigSchema } from "@fern-api/swift-codegen";
import { mkdir } from "fs/promises";

import { AbstractSwiftGeneratorContext } from "../context";
import { SwiftFile } from "./SwiftFile";

export class SwiftProject extends AbstractProject<AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema>> {
    /** Files stored in the the project root. */
    private readonly rootFiles: SwiftFile[] = [];
    /** Files stored in the `Sources` directory. */
    private readonly srcFiles: SwiftFile[] = [];

    public constructor({
        context
    }: {
        context: AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema>;
    }) {
        super(context);
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

    public addSourceFiles(...files: SwiftFile[]): void {
        this.srcFiles.push(...files);
    }

    public async persist(): Promise<void> {
        const { context, absolutePathToSrcDirectory } = this;
        context.logger.debug(`mkdir ${absolutePathToSrcDirectory}`);
        await mkdir(absolutePathToSrcDirectory, { recursive: true });
        await Promise.all([this.persistRootFiles(), this.persistDynamicSourceFiles(), this.persistStaticSourceFiles()]);
    }

    private async persistRootFiles(): Promise<void> {
        const { absolutePathToOutputDirectory, rootFiles } = this;
        await Promise.all(rootFiles.map((file) => file.write(absolutePathToOutputDirectory)));
    }

    private async persistDynamicSourceFiles(): Promise<void> {
        const { absolutePathToSrcDirectory, srcFiles } = this;
        // TODO(kafkas): Use Promise.all() when we start handling name collisions
        for (const file of srcFiles) {
            await file.write(absolutePathToSrcDirectory);
        }
    }

    private async persistStaticSourceFiles(): Promise<void> {
        const { context, absolutePathToSrcDirectory } = this;
        await Promise.all(
            context.getCoreAsIsFiles().map(async (def) => {
                const swiftFile = new SwiftFile({
                    filename: def.filename,
                    directory: def.directory,
                    fileContents: await def.loadContents()
                });
                await swiftFile.write(absolutePathToSrcDirectory);
            })
        );
    }
}
