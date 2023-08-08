import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { DOCKER_CODEGEN_OUTPUT_DIRECTORY, DOCKER_PATH_TO_IR } from "./constants";

export declare namespace getGeneratorConfig {
    export interface CliArgs {
        workspaceName: string;
        organization: string;
        customConfig: unknown;
    }

    export interface SeedArgs {
        workspaceName: string;
        organization: string;
        customConfig: unknown;
        outputMode: FernGeneratorExec.OutputMode;
    }

    export interface Return {
        config: FernGeneratorExec.GeneratorConfig;
        binds: string[];
    }
}

export function getGeneratorConfigForSeed({
    customConfig,
    workspaceName,
    organization,
    outputMode,
}: getGeneratorConfig.SeedArgs): getGeneratorConfig.Return {
    const binds: string[] = [];

    return {
        binds,
        config: {
            irFilepath: DOCKER_PATH_TO_IR,
            output: {
                mode: outputMode,
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

export function getGeneratorConfigForCli({
    customConfig,
    workspaceName,
    organization,
}: getGeneratorConfig.CliArgs): getGeneratorConfig.Return {
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
