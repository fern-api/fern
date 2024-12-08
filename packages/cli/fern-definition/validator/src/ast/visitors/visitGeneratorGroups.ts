import { generatorsYml } from "@fern-api/configuration-loader";
import { NodePath } from "@fern-api/fern-definition-schema";
import { GeneratorsYmlFileAstVisitor } from "../GeneratorsYmlAstVisitor";

export  function visitGeneratorGroups({
    groups,
    visitor,
    nodePath,
    cliVersion
}: {
    groups: Record<string, generatorsYml.GeneratorGroupSchema> | undefined;
    visitor: Partial<GeneratorsYmlFileAstVisitor>;
    nodePath: NodePath;
    cliVersion: string;
}): void {
    if (groups == null) {
        return;
    }
    for (const [groupName, group] of Object.entries(groups)) {
         visitGeneratorGroup({ group, visitor, nodePath: [...nodePath, groupName], cliVersion });
    }
}

 function visitGeneratorGroup({
    group,
    visitor,
    nodePath,
    cliVersion
}: {
    group: generatorsYml.GeneratorGroupSchema;
    visitor: Partial<GeneratorsYmlFileAstVisitor>;
    nodePath: NodePath;
    cliVersion: string;
}): void {
    group.generators.map(
        (generator, idx) =>
            visitor.generatorInvocation?.({ invocation: generator, cliVersion }, [
            ...nodePath,
            "generators",
            idx.toString(),
            generator.name
        ])
    )
}
