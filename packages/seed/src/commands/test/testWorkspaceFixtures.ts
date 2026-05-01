import { APIS_DIRECTORY, FERN_DIRECTORY } from "@fern-api/configuration";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import fs from "fs";
import { difference } from "lodash-es";
import path from "path";

import { BaselineConfiguration, FixtureConfigurations } from "../../config/api/index.js";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces.js";
import { getBaselineDir } from "../../utils/diffStorage.js";
import { printTestCases } from "./printTestCases.js";
import { TestRunner } from "./test-runner/index.js";

export const LANGUAGE_SPECIFIC_FIXTURE_PREFIXES = ["csharp", "go", "java", "python", "ruby", "ts"];

export const FIXTURES = readDirectories(
    path.join(__dirname, "../../../test-definitions", FERN_DIRECTORY, APIS_DIRECTORY)
);

export async function testGenerator({
    runner,
    generator,
    fixtures,
    outputFolder,
    inspect
}: {
    runner: TestRunner;
    generator: GeneratorWorkspace;
    fixtures: string[];
    outputFolder?: string;
    inspect: boolean;
}): Promise<boolean> {
    // Group inputs by fixture base name so each fixture's baseline runs exactly
    // once even when the input list contains multiple `name:outputFolder`
    // variants of the same fixture. Without this, parallel baseline runs race on
    // `<fixture>/baseline/` (mkdir/rmdir/copyfile) and corrupt each other.
    //
    // A null entry in `requestedOutputFolders` means "run the entire fixture"
    // (no folder filter). A specific string narrows variants to that outputFolder.
    const groupedFixtures = new Map<string, Array<string | null>>();
    for (const fixture of fixtures) {
        let fixtureName = fixture;
        let fixtureOutputFolder = outputFolder ?? null;
        if (fixture.includes(":")) {
            const [name, folder] = fixture.split(":", 2);
            fixtureName = name ?? fixture;
            fixtureOutputFolder = folder ?? null;
        }
        const existing = groupedFixtures.get(fixtureName);
        if (existing == null) {
            groupedFixtures.set(fixtureName, [fixtureOutputFolder]);
        } else {
            existing.push(fixtureOutputFolder);
        }
    }

    // Each fixture runs as a group: baseline first, then custom config variants.
    // Cross-fixture parallelism is preserved.
    const fixturePromises: Promise<TestRunner.TestResult[]>[] = [];
    const allowedFailuresAsSet = new Set(generator.workspaceConfig.allowedFailures);
    for (const [fixtureName, requestedOutputFolders] of groupedFixtures) {
        const config = generator.workspaceConfig.fixtures?.[fixtureName];
        const matchingPrefix = LANGUAGE_SPECIFIC_FIXTURE_PREFIXES.filter((prefix) => fixtureName.startsWith(prefix))[0];

        if (matchingPrefix != null && !generator.workspaceName.startsWith(matchingPrefix)) {
            CONSOLE_LOGGER.debug(
                `Skipping fixture ${fixtureName} for generator ${generator.workspaceName} because it was deemed specific to another language`
            );
            continue;
        }

        // If any input was unfiltered (null), all variants run; otherwise restrict
        // to the union of requested outputFolders.
        const runAllVariants = requestedOutputFolders.includes(null);
        const requestedVariantSet = new Set(requestedOutputFolders.filter((f): f is string => f != null));

        // BaselineConfiguration carries per-baseline options like
        // `disableDynamicSnippetTests` that previously rode along on a
        // `customConfig: null` fixture entry. Adapt it to the FixtureConfigurations
        // shape the runner expects (outputFolder is filled with a placeholder; the
        // runner overrides it to "baseline" when isBaseline=true).
        const baselineConfig = baselineConfigurationToFixtureConfigurations(
            generator.workspaceConfig.baselineConfigurations?.[fixtureName]
        );

        if (config != null && config.length > 0) {
            // Fixture has custom config entries.
            // Run baseline first, then all custom config variants in parallel.
            const baselineDir = getBaselineDir(generator.absolutePathToWorkspace, fixtureName);
            fixturePromises.push(
                (async (): Promise<TestRunner.TestResult[]> => {
                    // Phase 1: Run the implicit baseline (customConfig=null)
                    const baselineResult = await runner.run({
                        fixture: fixtureName,
                        configuration: baselineConfig,
                        inspect,
                        isBaseline: true
                    });

                    // If baseline failed, skip all variants — diffing against
                    // an incomplete baseline would produce incorrect diffs.
                    if (baselineResult.type === "failure") {
                        return [baselineResult];
                    }

                    // Phase 2: Run all custom config variants in parallel
                    const variantCases: Promise<TestRunner.TestResult>[] = [];
                    for (const instance of config) {
                        if (!runAllVariants && !requestedVariantSet.has(instance.outputFolder)) {
                            continue;
                        }
                        variantCases.push(
                            runner.run({
                                fixture: fixtureName,
                                configuration: instance,
                                inspect,
                                baselineDir
                            })
                        );
                    }
                    const variantResults = await Promise.all(variantCases);
                    return [baselineResult, ...variantResults];
                })()
            );
        } else {
            // No custom config entries — just run the baseline
            fixturePromises.push(
                runner
                    .run({
                        fixture: fixtureName,
                        configuration: baselineConfig,
                        inspect,
                        isBaseline: true
                    })
                    .then((result) => [result])
            );
        }
    }
    const results = (await Promise.all(fixturePromises)).flat();

    printTestCases(results);

    const failedFixtures = results
        .filter((res) => res.type === "failure")
        .map((res) => (res.id === res.outputFolder || !res.outputFolder ? res.id : `${res.id}:${res.outputFolder}`));
    const unexpectedlyFailedFixtures = difference(failedFixtures, generator.workspaceConfig.allowedFailures ?? []);

    const succeededFixtures = results
        .filter((res) => res.type === "success")
        .map((res) => (res.id === res.outputFolder || !res.outputFolder ? res.id : `${res.id}:${res.outputFolder}`));
    const unexpectedlySucceededFixtures = succeededFixtures.filter((fixture) => allowedFailuresAsSet.has(fixture));

    if (failedFixtures.length === 0) {
        CONSOLE_LOGGER.info(`${results.length}/${results.length} test cases passed ✅`);
    } else {
        CONSOLE_LOGGER.info(
            `${failedFixtures.length}/${
                results.length
            } test cases failed. The failed fixtures include ${failedFixtures.join(", ")}.`
        );
        if (unexpectedlyFailedFixtures.length > 0) {
            CONSOLE_LOGGER.info(
                `❌ THERE WERE UNEXPECTED TEST CASE FAILURES: Of the ${failedFixtures.length} failed fixtures, ${unexpectedlyFailedFixtures.length} were unexpected failures, including: ${unexpectedlyFailedFixtures.join(", ")}.`
            );
            return false;
        } else {
            CONSOLE_LOGGER.info("✅ All failed fixtures were expected failures.");
        }
    }

    if (unexpectedlySucceededFixtures.length > 0) {
        CONSOLE_LOGGER.info(
            `⚠️ ${unexpectedlySucceededFixtures.length}/${
                results.length
            } test cases succeeded unexpectedly. Consider removing the following fixtures from allowedFailures: ${unexpectedlySucceededFixtures.join(", ")}.`
        );
    }

    return true;
}

// The runner consumes a single FixtureConfigurations type for both baseline and
// variant runs. BaselineConfiguration is a strict subset (no outputFolder, no
// storeFullSnapshot). Fill outputFolder with the constant "baseline" — TestRunner
// overrides it for baseline runs, so the value is never observed.
function baselineConfigurationToFixtureConfigurations(
    spec: BaselineConfiguration | undefined
): FixtureConfigurations | undefined {
    if (spec == null) {
        return undefined;
    }
    return {
        ...spec,
        outputFolder: "baseline"
    };
}

function readDirectories(filepath: string): string[] {
    if (!fs.existsSync(filepath)) {
        return [];
    }
    const files = fs.readdirSync(filepath);
    return files
        .map((file) => path.join(filepath, file))
        .filter((fullPath) => fs.statSync(fullPath).isDirectory())
        .map((fullPath) => path.basename(fullPath));
}
