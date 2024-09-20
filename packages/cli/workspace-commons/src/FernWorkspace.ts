import { dependenciesYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { AbstractAPIWorkspace, FernDefinition } from "./AbstractAPIWorkspace";

export declare namespace FernWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        absoluteFilePath: AbsoluteFilePath;
        dependenciesConfiguration: dependenciesYml.DependenciesConfiguration;
        definition: FernDefinition;
    }
}

export class FernWorkspace extends AbstractAPIWorkspace<void> {
    public definition: FernDefinition;
    public absoluteFilePath: AbsoluteFilePath;

    constructor({ definition, absoluteFilePath, ...superArgs }: FernWorkspace.Args) {
        super(superArgs);
        this.definition = definition;
        this.absoluteFilePath = absoluteFilePath;
    }

    public async getDefinition(): Promise<FernDefinition> {
        return this.definition;
    }

    public async toFernWorkspace(): Promise<FernWorkspace> {
        return this;
    }

    public getAbsoluteFilepaths(): AbsoluteFilePath[] {
        return [this.absoluteFilePath];
    }
}
