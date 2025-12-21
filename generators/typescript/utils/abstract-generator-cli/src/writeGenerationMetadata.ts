import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const GENERATION_METADATA_FILENAME = "metadata.json";
const GENERATION_METADATA_FILEPATH = ".fern";

export async function writeGenerationMetadata({
    generationMetadata,
    pathToProject,
    sdkVersion
}: {
    generationMetadata: FernIr.GenerationMetadata;
    pathToProject: AbsoluteFilePath;
    sdkVersion: string | undefined;
}): Promise<void> {
    const metadata = {
        ...generationMetadata,
        sdkVersion
    };
    const content = JSON.stringify(metadata, null, 2);
    const generationMetadataDir = path.join(pathToProject, GENERATION_METADATA_FILEPATH);
    await mkdir(generationMetadataDir, { recursive: true });
    await writeFile(`${generationMetadataDir}/${GENERATION_METADATA_FILENAME}`, content);
}
