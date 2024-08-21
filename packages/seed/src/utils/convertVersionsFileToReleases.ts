import { TaskContext } from "@fern-api/task-context";
import { GeneratorReleaseRequest } from "@fern-fern/generators-sdk/api/resources/generators";
import * as serializers from "@fern-fern/generators-sdk/serialization";
import { readFile } from "fs/promises";
import YAML from "yaml";

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
    const changelogs = YAML.parseDocument((await readFile(versionsFilePath)).toString());
    if (YAML.isSeq(changelogs)) {
        for (const entry of changelogs.items) {
            if (!YAML.isMap(entry)) {
                continue;
            }
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
