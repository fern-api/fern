import { APIS_DIRECTORY, FERN_DIRECTORY } from "@fern-api/configuration";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import fs from "fs";
import { difference } from "lodash-es";
import path from "path";

import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { printTestCases } from "./printTestCases";
import { TestRunner } from "./test-runner";

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
    const testCases: Promise<TestRunner.TestResult>[] = [];
    for (const fixture of fixtures) {
        let fixtureName = fixture;
        let fixtureOutputFolder = outputFolder;

        // Parse fixture name and outputFolder if format is "name:outputFolder"
        // Format name:outputFolder will override the passed in outputFolder
        if (fixture.includes(":")) {
            const [name, folder] = fixture.split(":", 2);
            fixtureName = name ?? fixture;
            fixtureOutputFolder = folder;
        }

        const config = generator.workspaceConfig.fixtures?.[fixtureName];
        const matchingPrefix = LANGUAGE_SPECIFIC_FIXTURE_PREFIXES.filter((prefix) => fixtureName.startsWith(prefix))[0];

        if (matchingPrefix != null && !generator.workspaceName.startsWith(matchingPrefix)) {
            CONSOLE_LOGGER.debug(
                `Skipping fixture ${fixtureName} for generator ${generator.workspaceName} because it was deemed specific to another language`
            );
            continue;
        }
        if (config != null) {
            for (const instance of config) {
                if (fixtureOutputFolder != null && instance.outputFolder !== fixtureOutputFolder) {
                    continue;
                }
                testCases.push(
                    runner.run({
                        fixture: fixtureName,
                        configuration: instance,
                        inspect
                    })
                );
            }
        } else {
            testCases.push(
                runner.run({
                    fixture: fixtureName,
                    configuration: undefined,
                    inspect
                })
            );
        }
    }
    const results = await Promise.all(testCases);

    printTestCases(results);

    const failedFixtures = results
        .filter((res) => res.type === "failure")
        .map((res) => (res.id === res.outputFolder || !res.outputFolder ? res.id : `${res.id}:${res.outputFolder}`));
    const unexpectedFixtures = difference(failedFixtures, generator.workspaceConfig.allowedFailures ?? []);

    if (failedFixtures.length === 0) {
        CONSOLE_LOGGER.info(`${results.length}/${results.length} test cases passed ✅`);
    } else {
        CONSOLE_LOGGER.info(
            `${failedFixtures.length}/${
                results.length
            } test cases failed. The failed fixtures include ${failedFixtures.join(", ")}.`
        );
        if (unexpectedFixtures.length > 0) {
            CONSOLE_LOGGER.info(
                `❌ THERE WERE UNEXPECTED TEST CASE FAILURES: Of the ${failedFixtures.length} failed fixtures, ${unexpectedFixtures.length} were unexpected failures, including: ${unexpectedFixtures.join(", ")}.`
            );
            return false;
        } else {
            CONSOLE_LOGGER.info("✅ All failed fixtures were expected failures.");
        }
    }
    return true;
}

function readDirectories(filepath: string): string[] {
    const files = fs.readdirSync(filepath);
    return files
        .map((file) => path.join(filepath, file))
        .filter((fullPath) => fs.statSync(fullPath).isDirectory())
        .map((fullPath) => path.basename(fullPath));
}
