import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { TaskContext } from "@fern-api/task-context";

import { CliReleaseRequest, GeneratorReleaseRequest } from "@fern-fern/generators-sdk/api/resources/generators";
import * as serializers from "@fern-fern/generators-sdk/serialization";

export async function parseGeneratorReleasesFile({
    generatorId,
    changelogPath,
    context,
    action
}: {
    generatorId: string;
    changelogPath: string;
    context: TaskContext;
    action: (release: GeneratorReleaseRequest) => Promise<void>;
}): Promise<void> {
    context.logger.debug(`Parsing versions file ${changelogPath}`);
    const changelogs = yaml.load((await readFile(changelogPath)).toString());
    if (Array.isArray(changelogs)) {
        for (const entry of changelogs) {
            try {
                const release = serializers.generators.GeneratorReleaseRequest.parseOrThrow({
                    generatorId,
                    ...entry
                });
                await action(release);
            } catch (e) {
                context.logger.error(
                    `Failed to parse and run action on release ${JSON.stringify(entry)}: ${(e as Error)?.message}`
                );
            }
        }
    }
}

export async function parseCliReleasesFile({
    changelogPath,
    context,
    action
}: {
    changelogPath: string;
    context: TaskContext;
    action: (release: CliReleaseRequest) => Promise<void>;
}): Promise<void> {
    context.logger.debug(`Parsing versions file ${changelogPath}`);
    const changelogs = yaml.load((await readFile(changelogPath)).toString());
    if (Array.isArray(changelogs)) {
        for (const entry of changelogs) {
            try {
                const release = serializers.generators.CliReleaseRequest.parseOrThrow(entry);
                await action(release);
            } catch (e) {
                context.logger.error(
                    `Failed to parse and run action on release ${JSON.stringify(entry)}: ${(e as Error)?.message}`
                );
            }
        }
    }
}
