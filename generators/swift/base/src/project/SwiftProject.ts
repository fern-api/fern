import { mkdir } from "fs/promises";

import { AbstractProject } from "@fern-api/base-generator";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { BaseSwiftCustomConfigSchema } from "@fern-api/swift-codegen";

import { AbstractSwiftGeneratorContext } from "../context/AbstractSwiftGeneratorContext";
import { SwiftFile } from "./SwiftFile";

const SRC_DIRECTORY_NAME = "Sources";

export class SwiftProject extends AbstractProject<AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema>> {
    private readonly name: string;
    private readonly sourceFiles: SwiftFile[] = [];

    public constructor({
        context,
        name
    }: {
        context: AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema>;
        name: string;
    }) {
        super(context);
        this.name = name;
    }

    public get absolutePathToSrcDirectory(): AbsoluteFilePath {
        return join(this.absolutePathToOutputDirectory, RelativeFilePath.of(SRC_DIRECTORY_NAME));
    }

    public addSourceFiles(...files: SwiftFile[]): void {
        this.sourceFiles.push(...files);
    }

    public async persist(): Promise<void> {
        const { absolutePathToSrcDirectory } = this;
        this.context.logger.debug(`mkdir ${absolutePathToSrcDirectory}`);
        await mkdir(absolutePathToSrcDirectory, { recursive: true });
        await Promise.all(this.sourceFiles.map((file) => file.write(absolutePathToSrcDirectory)));
    }
}
