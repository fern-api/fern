import { writeFile } from "fs/promises";

import { FERN_DIRECTORY, PROJECT_CONFIG_FILENAME } from "@fern-api/configuration";
import { FernDocsBuilderImpl } from "@fern-api/docs-importer-commons";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { ReadmeImporter } from "./ReadmeImporter";

interface RunReadmeMigrationParams {
    readmeUrl: string;
    outputPath: AbsoluteFilePath;
    taskContext: TaskContext;
    versionOfCli: string;
    organization: string;
}

export async function runReadmeMigration({
    readmeUrl,
    outputPath,
    taskContext,
    versionOfCli,
    organization
}: RunReadmeMigrationParams): Promise<void> {
    const readmeImporter = new ReadmeImporter({
        context: taskContext
    });

    const builder = new FernDocsBuilderImpl();

    await readmeImporter.import({
        args: { readmeUrl, organization },
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
                organization
            },
            undefined,
            4
        )
    );
}
