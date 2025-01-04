import { writeFile } from "fs/promises";
import yaml from "js-yaml";

import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/configuration-loader";
import { docsYml } from "@fern-api/configuration-loader";
import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { createFernDirectoryAndWorkspace } from "./createFernDirectoryAndOrganization";

export async function initializeDocs({
    organization,
    taskContext,
    versionOfCli
}: {
    organization: string | undefined;
    taskContext: TaskContext;
    versionOfCli: string;
}): Promise<void> {
    const createDirectoryResponse = await createFernDirectoryAndWorkspace({
        organization,
        versionOfCli,
        taskContext
    });

    await writeFile(
        join(createDirectoryResponse.absolutePathToFernDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME)),
        yaml.dump(getDocsConfig(createDirectoryResponse.organization))
    );
}

function getDocsConfig(organization: string): docsYml.RawSchemas.DocsConfiguration {
    return {
        instances: [
            {
                url: `https://${organization}.${process.env.DOCS_DOMAIN_SUFFIX}`
            }
        ],
        title: `${organization} | Documentation`,
        navigation: [{ api: "API Reference" }],
        colors: {
            accentPrimary: "#ffffff",
            background: "#000000"
        }
    };
}
