import { generatorsYml } from "@fern-api/configuration-loader";
import { NodePath } from "@fern-api/fern-definition-schema";

import { GeneratorsYmlFileAstVisitor } from "../GeneratorsYmlAstVisitor";

export async function visitGeneratorGroups({
    groups,
    visitor,
    nodePath,
    cliVersion
}: {
    groups: Record<string, generatorsYml.GeneratorGroupSchema> | undefined;
    visitor: Partial<GeneratorsYmlFileAstVisitor>;
    nodePath: NodePath;
    cliVersion: string;
}): Promise<void> {
    if (groups == null) {
        return;
    }
    for (const [groupName, group] of Object.entries(groups)) {
        await visitGeneratorGroup({ group, visitor, nodePath: [...nodePath, groupName], cliVersion });
    }
}

async function visitGeneratorGroup({
    group,
    visitor,
    nodePath,
    cliVersion
}: {
    group: generatorsYml.GeneratorGroupSchema;
    visitor: Partial<GeneratorsYmlFileAstVisitor>;
    nodePath: NodePath;
    cliVersion: string;
}): Promise<void> {
    await Promise.all(
        group.generators.map(
            async (generator, idx) =>
                await visitor.generatorInvocation?.({ invocation: generator, cliVersion }, [
                    ...nodePath,
                    "generators",
                    idx.toString(),
                    generator.name
                ])
        )
    );
}
