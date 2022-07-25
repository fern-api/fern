import { runDocker } from "@fern-api/docker-utils";
import { GeneratorHelpers } from "@fern-fern/ir-model/generators";
import { writeFile } from "fs/promises";
import path from "path";
import { getGeneratorConfig } from "./getGeneratorConfig";

const DOCKER_FERN_DIRECTORY = "/fern";
const DOCKER_CODEGEN_OUTPUT_DIRECTORY = path.join(DOCKER_FERN_DIRECTORY, "output");
const DOCKER_GENERATOR_CONFIG_PATH = path.join(DOCKER_FERN_DIRECTORY, "config.json");
const DOCKER_PATH_TO_IR = path.join(DOCKER_FERN_DIRECTORY, "ir.json");

export declare namespace runGenerator {
    export interface Args {
        imageName: string;
        helpers: GeneratorHelpers;
        customConfig: unknown;
        workspaceName: string;
        organization: string;

        absolutePathToIr: string;
        absolutePathToOutput: string | undefined;
        pathToWriteConfigJson: string;

        keepDocker: boolean;
    }
}

export async function runGenerator({
    imageName,
    workspaceName,
    organization,
    absolutePathToOutput,
    absolutePathToIr,
    pathToWriteConfigJson,
    helpers,
    customConfig,
    keepDocker,
}: runGenerator.Args): Promise<void> {
    const binds = [
        `${pathToWriteConfigJson}:${DOCKER_GENERATOR_CONFIG_PATH}:ro`,
        `${absolutePathToIr}:${DOCKER_PATH_TO_IR}:ro`,
    ];

    if (absolutePathToOutput != null) {
        binds.push(`${absolutePathToOutput}:${DOCKER_CODEGEN_OUTPUT_DIRECTORY}`);
    }

    const { config, binds: bindsForGenerators } = getGeneratorConfig({
        helpers,
        customConfig,
        workspaceName,
        organization,
    });
    binds.push(...bindsForGenerators);

    await writeFile(pathToWriteConfigJson, JSON.stringify(config, undefined, 4));

    await runDocker({
        imageName,
        args: [DOCKER_GENERATOR_CONFIG_PATH],
        binds,
        removeAfterCompletion: !keepDocker,
    });
}
