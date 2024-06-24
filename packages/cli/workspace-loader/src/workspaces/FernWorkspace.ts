import { dependenciesYml, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { APIChangelog, FernDefinition } from "../types/Workspace";
import { AbstractAPIWorkspace } from "./AbstractAPIWorkspace";

export declare namespace FernWorkspace {
    export interface Args {
        workspaceName: string | undefined;
        absoluteFilepath: AbsoluteFilePath;
        generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
        dependenciesConfiguration: dependenciesYml.DependenciesConfiguration;
        definition: FernDefinition;
        changelog: APIChangelog | undefined;
    }
}

export class FernWorkspace extends AbstractAPIWorkspace<void> {
    public type: "fern" | "oss" = "fern";
    public workspaceName: string | undefined;
    public absoluteFilepath: AbsoluteFilePath;
    public generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
    public dependenciesConfiguration: dependenciesYml.DependenciesConfiguration;
    public definition: FernDefinition;
    public changelog: APIChangelog | undefined;

    constructor({
        absoluteFilepath,
        workspaceName,
        generatorsConfiguration,
        dependenciesConfiguration,
        definition,
        changelog
    }: FernWorkspace.Args) {
        super();
        this.absoluteFilepath = absoluteFilepath;
        this.workspaceName = workspaceName;
        this.changelog = changelog;
        this.generatorsConfiguration = generatorsConfiguration;
        this.dependenciesConfiguration = dependenciesConfiguration;
        this.definition = definition;
    }

    public async getDefinition(): Promise<FernDefinition> {
        return this.definition;
    }

    public async toFernWorkspace(): Promise<FernWorkspace> {
        return this;
    }
}
