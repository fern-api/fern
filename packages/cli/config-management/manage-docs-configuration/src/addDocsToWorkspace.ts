import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { loadRawGeneratorsConfiguration, updateGeneratorGroup } from "@fern-api/generators-configuration";
import { DOCS_CONFIGURATION_FILENAME, DOCS_DIRECTORY } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { FernDocsConfig as RawDocs } from "@fern-fern/docs-config";
import { mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";

export async function addDocsToWorkspace({
    organization,
    workspace,
    groupName,
    context,
}: {
    organization: string;
    workspace: Workspace;
    groupName: string | undefined;
    context: TaskContext;
}): Promise<void> {
    const generatorsConfiguration = await loadRawGeneratorsConfiguration({
        absolutePathToWorkspace: workspace.absoluteFilepath,
        context,
    });
    const newGeneratorsConfiguration = updateGeneratorGroup({
        generatorsConfiguration,
        groupName,
        context,
        update: (group, groupName: string) => {
            if (group.docs != null) {
                context.failAndThrow(`Group ${groupName} already has docs configured.`);
            }
            group.docs = {
                domain: `${organization}.${process.env.DOCS_DOMAIN_SUFFIX}`,
            };
            if (group.generators == null) {
                group.generators = [];
            }
        },
    });
    await writeFile(
        workspace.generatorsConfiguration.absolutePathToConfiguration,
        yaml.dump(newGeneratorsConfiguration)
    );

    if (workspace.docsDefinition == null) {
        const docsDefinitionPath = join(workspace.absoluteFilepath, RelativeFilePath.of(DOCS_DIRECTORY));
        await mkdir(docsDefinitionPath);

        await writeFile(
            join(docsDefinitionPath, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME)),
            yaml.dump(getDocsConfig(organization))
        );
    }
}

function getDocsConfig(organization: string): RawDocs.DocsConfiguration {
    return {
        title: organization,
        navigation: [{ api: "API Reference" }],
        colors: {
            accentPrimary: "#ffffff",
        },
        logo: "./logo.png",
    };
}
