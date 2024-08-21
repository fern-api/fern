import { TaskContext } from "@fern-api/task-context";
import { GeneratorReleaseRequest } from "@fern-fern/generators-sdk/api/resources/generators";
import * as serializers from "@fern-fern/generators-sdk/serialization";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

export async function parseGeneratorReleasesFile({
    generatorId,
    versionsFilePath,
    context,
    action
}: {
    generatorId: string;
    versionsFilePath: string;
    context: TaskContext;
    action: (release: GeneratorReleaseRequest) => Promise<void>;
}): Promise<void> {
    context.logger.debug(`Parsing versions file ${versionsFilePath}`);
    const changelogs = yaml.load((await readFile(versionsFilePath)).toString());
    if (Array.isArray(changelogs)) {
        for (const entry of changelogs) {
            try {
                const release = serializers.generators.GeneratorReleaseRequest.parseOrThrow({
                    generator_id: generatorId,
                    ...entry
                });
                context.logger.debug(`Encountered generator  ${generatorId} release: ${release.version}`);
                await action(release);
            } catch (e) {
                context.logger.error(`Error parsing release: ${e}`);
            }
        }
    }
}
