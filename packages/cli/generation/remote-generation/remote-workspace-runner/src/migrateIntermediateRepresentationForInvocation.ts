import { generatorsYml } from "@fern-api/configuration";
import { getIrVersionForGenerator } from "@fern-api/core";
import {
    migrateIntermediateRepresentationForGenerator,
    migrateIntermediateRepresentationToVersionForGenerator
} from "@fern-api/ir-migrations";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

export async function migrateIntermediateRepresentationForInvocation({
    intermediateRepresentation,
    generatorInvocation,
    context,
    irVersionOverride
}: {
    intermediateRepresentation: IntermediateRepresentation;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    context: TaskContext;
    irVersionOverride: string | undefined;
}): Promise<unknown> {
    const irVersionFromFdr = await getIrVersionForGenerator(generatorInvocation);
    const resolvedIrVersion = irVersionOverride ?? (irVersionFromFdr == null ? undefined : `v${irVersionFromFdr}`);
    const targetGenerator = {
        name: generatorInvocation.name,
        version: generatorInvocation.version
    };

    return resolvedIrVersion == null
        ? migrateIntermediateRepresentationForGenerator({
              intermediateRepresentation,
              context,
              targetGenerator
          })
        : migrateIntermediateRepresentationToVersionForGenerator({
              intermediateRepresentation,
              context,
              irVersion: resolvedIrVersion,
              targetGenerator
          });
}
