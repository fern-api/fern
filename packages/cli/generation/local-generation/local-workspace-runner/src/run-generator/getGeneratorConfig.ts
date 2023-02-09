import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { DOCKER_CODEGEN_OUTPUT_DIRECTORY, DOCKER_PATH_TO_IR } from "./constants";

export declare namespace getGeneratorConfig {
    export interface Args {
        workspaceName: string;
        organization: string;
        customConfig: unknown;
    }

    export interface Return {
        config: FernGeneratorExec.GeneratorConfig;
        binds: string[];
    }
}

export function getGeneratorConfig({
    customConfig,
    workspaceName,
    organization,
}: getGeneratorConfig.Args): getGeneratorConfig.Return {
    const binds: string[] = [];

    return {
        binds,
        config: {
            irFilepath: DOCKER_PATH_TO_IR,
            output: {
                mode: FernGeneratorExec.OutputMode.downloadFiles(),
                path: DOCKER_CODEGEN_OUTPUT_DIRECTORY,
            },
            publish: undefined,
            customConfig,
            workspaceName,
            organization,
            environment: FernGeneratorExec.GeneratorEnvironment.local(),
            dryRun: false,
        },
    };
}
