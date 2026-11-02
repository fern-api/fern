import { AbstractAPIWorkspace, getCasingFromGeneratorsConfiguration } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration-loader";
import { TaskContext } from "@fern-api/task-context";

/**
 * Casing for an IR built for `--language` without running a generator. An explicit
 * `--smart-casing`/`--no-smart-casing` wins; otherwise the language's generator in generators.yml
 * decides, so the IR names match the SDK that generator produces (e.g. `StoreID` for a Go
 * generator with `smart-casing: true`).
 */
export function resolveCasingForIr({
    workspace,
    generationLanguage,
    smartCasing,
    context
}: {
    workspace: AbstractAPIWorkspace<unknown>;
    generationLanguage: generatorsYml.GenerationLanguage | undefined;
    smartCasing: boolean | undefined;
    context: TaskContext;
}): { smartCasing: boolean; smartCasingDigitWordBoundary: boolean | undefined } {
    const fromGenerators = getCasingFromGeneratorsConfiguration({
        generatorsConfiguration: workspace.generatorsConfiguration,
        generationLanguage
    });
    if (smartCasing != null) {
        return { smartCasing, smartCasingDigitWordBoundary: fromGenerators?.smartCasingDigitWordBoundary };
    }
    if (fromGenerators == null) {
        if (generationLanguage != null) {
            const groups = workspace.generatorsConfiguration?.groups ?? [];
            context.logger.debug(
                `No ${generationLanguage} generator found in generators.yml (${groups.length} group(s): ${groups
                    .flatMap((group) => group.generators.map((g) => `${g.name}:${g.language ?? "?"}`))
                    .join(", ")}); smart-casing defaults to false`
            );
        }
        return { smartCasing: false, smartCasingDigitWordBoundary: undefined };
    }
    context.logger.debug(
        `Using smart-casing: ${fromGenerators.smartCasing} from generator ${fromGenerators.generatorName} in generators.yml`
    );
    return fromGenerators;
}
