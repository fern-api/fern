import { dependenciesYml } from "@fern-api/configuration"
import { RawSchemas } from "@fern-api/fern-definition-schema"
import { AbsoluteFilePath } from "@fern-api/path-utils"
import { TaskContext } from "@fern-api/task-context"

import { AbstractAPIWorkspace, FernDefinition } from "./AbstractAPIWorkspace"
import { IdentifiableSource } from "./Source"

export declare namespace FernWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        dependenciesConfiguration: dependenciesYml.DependenciesConfiguration
        definition: FernDefinition
        sources?: IdentifiableSource[]
    }
}

export class FernWorkspace extends AbstractAPIWorkspace<void> {
    public definition: FernDefinition
    public sources: IdentifiableSource[]

    public type: string = "fern"

    constructor({ definition, sources, ...superArgs }: FernWorkspace.Args) {
        super(superArgs)
        this.definition = definition
        this.sources = sources ?? []
    }

    public async getDefinition(): Promise<FernDefinition> {
        return this.definition
    }

    public async toFernWorkspace(): Promise<FernWorkspace> {
        return this
    }

    public getSources(): IdentifiableSource[] {
        return this.sources
    }

    public getAbsoluteFilePaths(): AbsoluteFilePath[] {
        return [this.absoluteFilePath]
    }
}
