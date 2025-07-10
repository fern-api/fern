import { AbstractProject } from "@fern-api/base-generator";
import { BaseSwiftCustomConfigSchema } from "@fern-api/swift-codegen";

import { AbstractSwiftGeneratorContext } from "../context/AbstractSwiftGeneratorContext";
import { SwiftFile } from "./SwiftFile";

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

    public addSourceFiles(...files: SwiftFile[]): void {
        this.sourceFiles.push(...files);
    }

    public async persist(): Promise<void> {
        // TODO: Implement
        await Promise.all(this.sourceFiles.map((file) => file.write(this.absolutePathToOutputDirectory)));
    }
}
