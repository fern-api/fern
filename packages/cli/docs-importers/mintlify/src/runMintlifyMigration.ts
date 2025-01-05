import { writeFile } from "fs/promises";

import { FERN_DIRECTORY, PROJECT_CONFIG_FILENAME } from "@fern-api/configuration";
import { FernDocsBuilderImpl } from "@fern-api/docs-importer-commons";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { MintlifyImporter } from "./MintlifyImporter";

interface RunMintlifyMigrationParams {
    absolutePathToMintJson: AbsoluteFilePath;
    outputPath: AbsoluteFilePath;
    taskContext: TaskContext;
    versionOfCli: string;
}

export async function runMintlifyMigration({
    absolutePathToMintJson,
    outputPath,
    taskContext,
    versionOfCli
}: RunMintlifyMigrationParams): Promise<void> {
    const mintlifyImporter = new MintlifyImporter({
        context: taskContext
    });

    const builder = new FernDocsBuilderImpl();

    await mintlifyImporter.import({
        args: { absolutePathToMintJson },
        builder
    });

    await builder.build({ outputDirectory: outputPath });

    await writeFile(
        join(
            AbsoluteFilePath.of(outputPath),
            RelativeFilePath.of(FERN_DIRECTORY),
            RelativeFilePath.of(PROJECT_CONFIG_FILENAME)
        ),
        JSON.stringify(
            {
                version: versionOfCli,
                organization: "fern"
            },
            undefined,
            4
        )
    );
}
