import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";

import type { FernGeneratorCli } from "./generated";

export async function loadGitHubConfig({
    absolutePathToConfig
}: {
    absolutePathToConfig: AbsoluteFilePath;
}): Promise<FernGeneratorCli.GitHubConfig> {
    const rawContents = await readFile(absolutePathToConfig, "utf8");
    return JSON.parse(rawContents);
}
