import { mkdir } from "fs/promises";

import { AbstractProject } from "@fern-api/base-generator";
import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { BaseSwiftCustomConfigSchema } from "@fern-api/swift-codegen";

import { AbstractSwiftGeneratorContext } from "../context/AbstractSwiftGeneratorContext";
import { SwiftFile } from "./SwiftFile";

const SRC_DIRECTORY_NAME = "src";

export class SwiftProject extends AbstractProject<AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema>> {
    private name: string;
    private sourceFiles: SwiftFile[] = [];

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

    public get sourceFileDirectory(): RelativeFilePath {
        return RelativeFilePath.of(SRC_DIRECTORY_NAME);
    }

    public get projectDirectory(): RelativeFilePath {
        return join(this.sourceFileDirectory, RelativeFilePath.of(this.name));
    }

    public addSourceFiles(...files: SwiftFile[]): void {
        this.sourceFiles.push(...files);
    }

    public async persist(): Promise<void> {
        const absolutePathToSrcDirectory = join(this.absolutePathToOutputDirectory, this.sourceFileDirectory);
        this.context.logger.debug(`mkdir ${absolutePathToSrcDirectory}`);
        await mkdir(absolutePathToSrcDirectory, { recursive: true });

        const absolutePathToProjectDirectory = join(absolutePathToSrcDirectory, RelativeFilePath.of(this.name));
        this.context.logger.debug(`mkdir ${absolutePathToProjectDirectory}`);
        await mkdir(absolutePathToProjectDirectory, { recursive: true });

        await Promise.all(this.sourceFiles.map((file) => file.write(absolutePathToProjectDirectory)));
    }
}
