import { GeneratorConfig } from "@fern-fern/ir-model/generators";
import { DOCKER_CODEGEN_OUTPUT_DIRECTORY, DOCKER_PATH_TO_IR } from "./constants";

export declare namespace getGeneratorConfig {
    export interface Args {
        workspaceName: string;
        organization: string;
        customConfig: unknown;
    }

    export interface Return {
        config: GeneratorConfig;
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
            output: { path: DOCKER_CODEGEN_OUTPUT_DIRECTORY },
            publish: null,
            customConfig,
            helpers: {
                encodings: {},
            },
            workspaceName,
            organization,
            environment: { _type: "local" },
        },
    };
}
