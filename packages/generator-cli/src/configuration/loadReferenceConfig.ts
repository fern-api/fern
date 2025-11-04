import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";

import type { FernGeneratorCli } from "./generated";

export async function loadReferenceConfig({
    absolutePathToConfig
}: {
    absolutePathToConfig: AbsoluteFilePath;
}): Promise<FernGeneratorCli.ReferenceConfig> {
    const rawContents = await readFile(absolutePathToConfig, "utf8");
    return JSON.parse(rawContents);
}
