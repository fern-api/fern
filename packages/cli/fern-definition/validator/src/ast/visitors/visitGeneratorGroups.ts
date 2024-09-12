import { GeneratorGroupSchema } from "@fern-api/configuration/src/generators-yml/schemas/GeneratorGroupSchema";
import { NodePath } from "@fern-api/fern-definition-schema";
import { GeneratorsYmlFileAstVisitor } from "../GeneratorsYmlAstVisitor";

export async function visitGeneratorGroups({
    groups,
    visitor,
    nodePath
}: {
    groups: Record<string, GeneratorGroupSchema> | undefined;
    visitor: Partial<GeneratorsYmlFileAstVisitor>;
    nodePath: NodePath;
}): Promise<void> {
    if (groups == null) {
        return;
    }
    for (const [groupName, group] of Object.entries(groups)) {
        await visitGeneratorGroup({ group, visitor, nodePath: [...nodePath, groupName] });
    }
}

async function visitGeneratorGroup({
    group,
    visitor,
    nodePath
}: {
    group: GeneratorGroupSchema;
    visitor: Partial<GeneratorsYmlFileAstVisitor>;
    nodePath: NodePath;
}): Promise<void> {
    for (const generator of group.generators) {
        await visitor.generatorInvocation?.(generator, [...nodePath, generator.name]);
    }
}
