import { TaskContext } from "@fern-api/task-context";
import produce from "immer";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

export function upgradeGeneratorVersion({
    generatorsConfiguration,
    groupName,
    generatorName,
    context,
    version
}: {
    generatorsConfiguration: GeneratorsConfigurationSchema;
    context: TaskContext;
    groupName: string;
    generatorName: string;
    version: string | undefined;
}): GeneratorsConfigurationSchema {
    return version == null
        ? generatorsConfiguration
        : produce(generatorsConfiguration, (draft) => {
              const groups = (draft.groups ??= {});
              const draftGroup = groups[groupName];
              if (draftGroup == null) {
                  context.failAndThrow(`Group ${groupName} not found.`);
              } else {
                  const generator = draftGroup.generators.find((generator) => generator.name === generatorName);
                  if (generator == null) {
                      context.failAndThrow(`Generator ${generatorName} not found in group ${groupName}.`);
                  } else {
                      generator.version = version;
                  }
              }
          });
}
