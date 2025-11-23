import { Project } from "@fern-api/project-loader";
import { CliContext } from "../../../../../cli-context/CliContext";
import { getSdkGeneratorCLILoader } from "../../../config";

export async function warmCache({ project, cliContext }: { project: Project; cliContext: CliContext }) {
    const uniqueGeneratorKeys = new Set<string>();
    const warmPromises: Promise<unknown>[] = [];

    for (const workspace of project.apiWorkspaces) {
        const generatorsConfig = workspace.generatorsConfiguration;
        if (generatorsConfig == null) {
            continue;
        }
        for (const group of generatorsConfig.groups) {
            for (const generator of group.generators) {
                const lang = generator.language;
                const version = generator.version;
                if (lang == null || version == null) {
                    continue;
                }
                const loader = getSdkGeneratorCLILoader(lang);
                if (loader == null) {
                    continue;
                }

                const key = `${lang}-${version}`;
                if (uniqueGeneratorKeys.has(key)) {
                    continue;
                }
                uniqueGeneratorKeys.add(key);

                warmPromises.push(
                    loader(version, (message: string) => {
                        cliContext.logger.info(message);
                    })
                );
            }
        }
    }

    if (warmPromises.length === 0) {
        cliContext.logger.info("No supported generators found in this project for cache warming.");
        return;
    }

    await Promise.all(warmPromises);
}
