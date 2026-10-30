import { isRecord } from "@fern-api/core-utils";
import { AbsoluteFilePath, dirname, resolve } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { readFile } from "fs/promises";

import { GeneratorName } from "./GeneratorName.js";

/**
 * Inlines `config.banner.file` for the CLI generator. The generator container only receives
 * `config` as JSON, so a banner kept as an asset next to generators.yml has to be read here and
 * handed over as `config.banner.text`.
 */
export async function resolveCliBannerFile({
    generatorName,
    config,
    absolutePathToGeneratorsConfiguration
}: {
    generatorName: string;
    config: unknown;
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
}): Promise<unknown> {
    if (generatorName !== GeneratorName.CLI || !isRecord(config) || !isRecord(config.banner)) {
        return config;
    }
    const { file, ...banner } = config.banner;
    if (file === undefined) {
        return config;
    }
    if (typeof file !== "string" || file.length === 0) {
        throw new CliError({
            message: "Invalid config.banner.file in generators.yml: expected a path to a text file.",
            code: CliError.Code.ConfigError
        });
    }
    if (banner.text !== undefined) {
        throw new CliError({
            message: "Invalid config.banner in generators.yml: set either `text` or `file`, not both.",
            code: CliError.Code.ConfigError
        });
    }

    const absolutePathToBanner = resolve(dirname(absolutePathToGeneratorsConfiguration), file);
    let text: string;
    try {
        text = await readFile(absolutePathToBanner, "utf-8");
    } catch {
        throw new CliError({
            message: `Failed to read config.banner.file "${file}" (resolved to ${absolutePathToBanner}).`,
            code: CliError.Code.ConfigError
        });
    }
    return { ...config, banner: { ...banner, text } };
}
